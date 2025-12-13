// ---------------------------------------------
// Developer Reference Notes
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar, Anandjit Kaur
// File: app/find-jobs/page.tsx
//
// What this page does:
// This is the “Find Jobs” page where professionals can browse open job posts from clients.
// It pulls job data from Firestore, shows it in clean job cards, and lets the user search by title
// or filter by skill. When a professional is interested, they can open the proposal dialog and
// submit a proposal that gets saved into Firestore.
//
// How I built it / what I learned:
// - I used a Firestore real-time listener (onSnapshot) so jobs update instantly without refreshing.
// - To keep things simple and reliable, I filtered for “open” jobs and sorted by createdAt on the client side.
// - I added a small helper (getTimeAgo) so job cards show a “Posted X ago” label, which makes the UI feel more real.
// - I used React state to manage search/filter inputs and the proposal dialog form values.
// - Before submitting a proposal, I added basic front-end checks (empty cover letter, invalid rate) to avoid bad writes.
// - I also pulled the client’s name/avatar from the users collection so each job post looks complete and trustworthy.
//
// References I used while working on this:
// • Next.js App Router + Client Components: https://nextjs.org/docs/app/building-your-application/routing
// • Firestore listeners & real-time updates (onSnapshot): https://firebase.google.com/docs/firestore/query-data/listen
// • Firestore addDoc + serverTimestamp: https://firebase.google.com/docs/firestore/manage-data/add-data
// • shadcn/ui component library: https://ui.shadcn.com
// • TailwindCSS docs (layout + responsive grid): https://tailwindcss.com/docs
// • lucide-react icons: https://lucide.dev/icons
//
// Notes:
// The main goal here was to keep the job browsing experience fast, clean, and easy to use,
// while making sure proposals are saved properly and the UI stays consistent with the Hirefy dashboard.

'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Tag, DollarSign, Clock, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import InlineRating from "@/components/InlineRating";

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  category: string;
  location: string;
  clientId: string;
  clientEmail: string;
  status: string;
  createdAt: any;
  clientName?: string;
  clientAvatar?: string;
}

// Helper function to calculate time ago
const getTimeAgo = (timestamp: any): string => {
  if (!timestamp) return 'Recently';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};

interface JobCardProps {
  job: Job;
  onSubmitProposal: (job: Job) => void;
}

const JobCard = ({ job, onSubmitProposal }: JobCardProps) => (
  <Card className="flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
        <Badge variant="outline">Posted {getTimeAgo(job.createdAt)}</Badge>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={job.clientAvatar} alt={job.clientName || job.clientEmail} />
          <AvatarFallback>{(job.clientName || job.clientEmail || 'C').substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardDescription className="font-medium text-foreground flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate">{job.clientName || job.clientEmail}</span>
          <InlineRating userId={job.clientId} size="sm" />
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.map((skill: string) => (
          <Badge key={skill} variant="secondary">{skill}</Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>${job.budget} Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>{job.duration}</span>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => onSubmitProposal(job)}>
        View Details
      </Button>
      <Button onClick={() => onSubmitProposal(job)}>
        <FileText className="mr-2" />Submit Proposal
      </Button>
    </CardFooter>
  </Card>
);

export default function FindJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [proposalRate, setProposalRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user, userData } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchJobs = async () => {
      try {
        // Simple query - just get all jobs, filter and sort in memory
        const jobsCollection = collection(db, 'jobs');

        unsubscribe = onSnapshot(
          jobsCollection,
          async (snapshot) => {
            const jobsData: Job[] = [];
            
            for (const docSnap of snapshot.docs) {
              const jobData = docSnap.data() as Job;
              
              // Filter for open jobs only
              if (jobData.status !== 'open') continue;
              
              // Fetch client information
              try {
                const clientDoc = await getDoc(doc(db, 'users', jobData.clientId));
                if (clientDoc.exists()) {
                  const clientData = clientDoc.data();
                  jobData.clientName = clientData.name || clientData.email;
                  jobData.clientAvatar = clientData.photoURL || '';
                }
              } catch (error) {
                console.error('Error fetching client data:', error);
              }
              
              jobsData.push({
                ...jobData,
                id: docSnap.id,
              });
            }
            
            // Sort by createdAt in memory (newest first)
            jobsData.sort((a, b) => {
              const aTime = a.createdAt?.toDate?.() || new Date(0);
              const bTime = b.createdAt?.toDate?.() || new Date(0);
              return bTime.getTime() - aTime.getTime();
            });
            
            setJobs(jobsData);
            setLoading(false);
          },
          (error: any) => {
            console.error('Error fetching jobs:', error);
            toast({
              variant: 'destructive',
              title: 'Error Loading Jobs',
              description: error.message || 'Failed to load jobs. Please refresh the page.',
            });
            setLoading(false);
          }
        );
      } catch (error: any) {
        console.error('Error setting up jobs listener:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to initialize. Please refresh the page.',
        });
        setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [toast]);

  const handleOpenProposal = (job: Job) => {
    setSelectedJob(job);
    setProposalText('');
    setProposalRate('');
    setProposalDialogOpen(true);
  };

  const handleSubmitProposal = async () => {
    if (!user || !userData || !selectedJob) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit a proposal.',
      });
      return;
    }

    if (!proposalText.trim() || !proposalRate.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields.',
      });
      return;
    }

    const rate = parseFloat(proposalRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a valid rate.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const proposalData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        clientId: selectedJob.clientId,
        professionalId: user.uid,
        professionalEmail: user.email,
        professionalName: (userData.profile as any)?.fullName || userData.email || 'Professional',
        coverLetter: proposalText,
        proposedRate: rate,
        status: 'pending', // pending, accepted, declined
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'proposals'), proposalData);
      console.log('✅ Proposal submitted! ID:', docRef.id, 'Data:', proposalData);

      toast({
        title: 'Success!',
        description: 'Your proposal has been submitted successfully!',
      });

      setProposalDialogOpen(false);
      setSelectedJob(null);
      setProposalText('');
      setProposalRate('');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit proposal. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allSkills = [...new Set(jobs.flatMap((p: Job) => p.skills))];

  const filteredJobs = jobs.filter((p: Job) => {
    const titleMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = skillFilter === 'all' || p.skills.includes(skillFilter);
    return titleMatch && skillMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          <Search className="h-10 w-10 text-primary" /> Find Job Opportunities
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Browse and apply for jobs posted by clients across Calgary.</p>
      </div>

      {/* Filters */}
      <Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by job title..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-10 pr-3 h-10 rounded-md border bg-transparent text-sm"
              >
                <option value="all">All Skills</option>
                {allSkills.map((skill: string) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading jobs...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job: Job) => <JobCard key={job.id} job={job} onSubmitProposal={handleOpenProposal} />)
          ) : (
            <div className="text-center text-muted-foreground col-span-full py-12">
              <p className="font-semibold">No jobs found.</p>
              <p className="text-sm">
                {jobs.length === 0 
                  ? 'No jobs have been posted yet. Check back later!' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submit Proposal Dialog */}
      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Proposal</DialogTitle>
            <DialogDescription>
              Submit your proposal for: <span className="font-semibold">{selectedJob?.title}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Job Details Summary */}
            {selectedJob && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Client Budget:</span>
                  <span className="font-semibold">${selectedJob.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{selectedJob.duration}</span>
                </div>
              </div>
            )}

            {/* Proposed Rate */}
            <div className="space-y-2">
              <label htmlFor="proposalRate" className="text-sm font-semibold">
                Your Proposed Rate ($)
              </label>
              <Input
                id="proposalRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter your rate"
                value={proposalRate}
                onChange={(e) => setProposalRate(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Enter your proposed budget for this project
              </p>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <label htmlFor="proposalText" className="text-sm font-semibold">
                Cover Letter
              </label>
              <Textarea
                id="proposalText"
                placeholder="Explain why you're the best fit for this project..."
                rows={8}
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Introduce yourself and explain how you'll deliver this project
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProposalDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitProposal} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Submit Proposal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
