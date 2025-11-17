// ---------------------------------------------
// Developer Reference Notes
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar, Anandjit Kaur
// File: app/manage-jobs/page.tsx
//
// Description:
// - Dashboard page that shows all jobs where the professional’s proposal has been accepted.
// - Reads accepted proposals from Firestore and then enriches them with related job + client data.
// - Displays each job in a card with rate, duration, skills, and a “View Details” dialog.
// - Focuses on the professional side: what they’ve been hired for and the proposal they sent.
//
// Development Process & Key Learnings:
// - Used a Firestore query filtered by professionalId, then narrowed down to accepted proposals on the client side.
// - Practiced combining data from multiple collections: proposals, jobs, and users (clients).
// - Implemented a simple getTimeAgo helper to show relative accepted timestamps in the UI.
// - Improved UI structure with shadcn/ui Card, Badge, Button, and a Dialog for detailed job/proposal view.
// - Learned how to keep the layout responsive and readable using Tailwind flex/grid utilities.
//
// References & Resources Used:
// • Firebase Firestore querying & document reads: https://firebase.google.com/docs/firestore/query-data/queries  
// • Firestore document references (getDoc / doc): https://firebase.google.com/docs/firestore/query-data/get-data  
// • shadcn/ui components (Card, Badge, Button, Dialog): https://ui.shadcn.com  
// • Lucide React Icons (Briefcase, Loader2, Eye, DollarSign, Clock, User, FileText): https://lucide.dev/icons  
// • TailwindCSS layout & spacing utilities: https://tailwindcss.com/docs  
// ---------------------------------------------
'use client';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, Loader2, Eye, DollarSign, Clock, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AcceptedJob {
  id: string;
  proposalId: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  proposedRate: number;
  coverLetter: string;
  jobDescription?: string;
  jobBudget?: number;
  jobDuration?: string;
  jobSkills?: string[];
  acceptedAt: any;
}

const statusVariant = {
  'accepted': 'secondary' as const,
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<AcceptedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<AcceptedJob | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Query proposals where professionalId matches current user (respects Firestore rules)
    const proposalsCollection = collection(db, 'proposals');
    const proposalsQuery = query(
      proposalsCollection,
      where('professionalId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      proposalsQuery,
      async (snapshot) => {
        // Filter for accepted proposals client-side
        const relevantDocs = snapshot.docs.filter(doc => {
          const data = doc.data();
          return data.status === 'accepted';
        });

        console.log('✅ Found', relevantDocs.length, 'accepted proposals for professional');
        
        const jobsData: AcceptedJob[] = [];

        for (const docSnap of relevantDocs) {
          const proposalData = docSnap.data();
          
          // Fetch job details
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', proposalData.jobId));
            let jobDetails: any = {};
            if (jobDoc.exists()) {
              jobDetails = jobDoc.data();
            }

            // Fetch client details
            const clientDoc = await getDoc(doc(db, 'users', proposalData.clientId));
            let clientName = proposalData.clientId;
            let clientEmail = '';
            if (clientDoc.exists()) {
              const clientData = clientDoc.data();
              clientName = clientData.name || clientData.email;
              clientEmail = clientData.email;
            }

            jobsData.push({
              id: docSnap.id,
              proposalId: docSnap.id,
              jobId: proposalData.jobId,
              jobTitle: proposalData.jobTitle || jobDetails.title,
              clientId: proposalData.clientId,
              clientName,
              clientEmail,
              proposedRate: proposalData.proposedRate,
              coverLetter: proposalData.coverLetter,
              jobDescription: jobDetails.description,
              jobBudget: jobDetails.budget,
              jobDuration: jobDetails.duration,
              jobSkills: jobDetails.skills,
              acceptedAt: proposalData.updatedAt || proposalData.createdAt,
            });
          } catch (error) {
            console.error('Error fetching job/client details:', error);
          }
        }

        // Sort by accepted date
        jobsData.sort((a, b) => {
          const aTime = a.acceptedAt?.toDate?.() || new Date(0);
          const bTime = b.acceptedAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        setJobs(jobsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching accepted jobs:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your jobs.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleViewJob = (job: AcceptedJob) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" /> My Jobs
        </h1>
        <p className="text-muted-foreground mt-1">
          Jobs you've been hired for
        </p>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading your jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Briefcase className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No active jobs yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              When clients accept your proposals, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 mt-0.5">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1">{job.jobTitle}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span>{job.clientName || job.clientEmail}</span>
                        </div>
                        
                        {job.jobDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {job.jobDescription}
                          </p>
                        )}

                        {/* Skills */}
                        {job.jobSkills && job.jobSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.jobSkills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.jobSkills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.jobSkills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-foreground">${job.proposedRate.toLocaleString()}</span>
                        <span>Your Rate</span>
                      </div>
                      {job.jobDuration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{job.jobDuration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span>Accepted {getTimeAgo(job.acceptedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={statusVariant.accepted}>
                      Accepted
                    </Badge>
                    <Button size="sm" onClick={() => handleViewJob(job)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Job Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedJob?.jobTitle}</DialogTitle>
            <DialogDescription className="text-base">
              Job details and your proposal
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6 mt-2">
              {/* Client Info */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Client
                </h3>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">{selectedJob.clientName || selectedJob.clientEmail}</span>
                </div>
              </div>

              {/* Job Description */}
              {selectedJob.jobDescription && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Job Description
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedJob.jobDescription}
                  </p>
                </div>
              )}

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Your Rate
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedJob.proposedRate.toLocaleString()}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Client Budget
                  </div>
                  <div className="text-2xl font-bold">
                    ${selectedJob.jobBudget?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Duration */}
              {selectedJob.jobDuration && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Duration
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedJob.jobDuration}</span>
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedJob.jobSkills && selectedJob.jobSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.jobSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Proposal */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Your Proposal
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedJob.coverLetter}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
