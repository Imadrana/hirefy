// ---------------------------------------------
// Developer Reference Notes (Revision 2)
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// File: app/manage-jobs/page.tsx
//
// High-Level Purpose:
// - Shows all jobs where the professional has already been hired (accepted proposals).
// - Acts as a “My Jobs” dashboard so users can quickly review job details and their proposal.
//
// Key Implementation Details:
// - Listens to the `proposals` collection in Firestore filtered by the current professional’s UID.
// - Filters the snapshot client-side to only keep proposals with `status === "accepted"`.
// - For each accepted proposal, loads extra job info from `jobs/{jobId}` and client info from `users/{clientId}`.
// - Combines proposal + job + client data into a single `AcceptedJob` object stored in local state.
// - Sorts jobs by `acceptedAt` (or createdAt fallback) so the most recent accepted work shows first.
// - Uses a small `getTimeAgo` helper to display “Accepted X days/weeks ago” text.
//
// UI / UX Notes:
// - Cards show job title, client, short description, a few skills, your accepted rate, and duration.
// - A badge highlights the “Accepted” status, and a “View Details” button opens a dialog.
// - The dialog summarizes budget, your rate, duration, skills, and the original cover letter you sent.
// - Loading and empty states are handled to make the page feel complete even with no jobs yet.
//
// References & Resources Used:
// • Firestore queries and snapshots: https://firebase.google.com/docs/firestore/query-data/queries  
// • Firestore document lookups (getDoc / doc): https://firebase.google.com/docs/firestore/query-data/get-data  
// • shadcn/ui components (Card, Badge, Button, Dialog): https://ui.shadcn.com  
// • Lucide React icons used here (Briefcase, Loader2, Eye, DollarSign, Clock, User, FileText): https://lucide.dev/icons  
// • TailwindCSS flex/grid layout patterns: https://tailwindcss.com/docs  
// ---------------------------------------------
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Briefcase, MoreHorizontal, Eye, Edit, Archive, FilePlus2, Loader2, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  category: string;
  location: string;
  datePosted: string;
  status: 'open' | 'closed' | 'in-progress' | 'completed';
  applicants: any[];
  clientId: string;
  createdAt?: any;
}

const statusVariant: Record<Job['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'open': 'default',
  'in-progress': 'secondary',
  'completed': 'outline',
  'closed': 'destructive',
};

const statusLabel: Record<Job['status'], string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'closed': 'Closed',
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!db || !user) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsRef = collection(db, 'jobs');
        // Temporarily use a simpler query while index is building
        const q = query(jobsRef, where('clientId', '==', user.uid));
        const snapshot = await getDocs(q);

        const fetchedJobs: Job[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Untitled',
              description: data.description || '',
              skills: data.skills || [],
              budget: data.budget || 0,
              duration: data.duration || '',
              category: data.category || '',
              location: data.location || '',
              datePosted: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
              status: data.status || 'open',
              applicants: data.applicants || [],
              clientId: data.clientId || '',
              createdAt: data.createdAt || null,
            };
          })
          // Sort by createdAt on client side
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.seconds - a.createdAt.seconds;
          });

        setJobs(fetchedJobs);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to fetch jobs. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [db, user, toast]);

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/dashboard/client/manage-jobs/edit/${jobId}`);
  };

  const handleCloseJob = async (jobId: string) => {
    setActionLoading(true);
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: 'closed',
        updatedAt: Timestamp.now(),
      });

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: 'closed' } : job
      ));

      toast({
        title: 'Success',
        description: 'Job has been closed successfully.',
      });
    } catch (error) {
      console.error('Error closing job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to close job. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    
    setActionLoading(true);
    try {
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await deleteDoc(jobRef);

      setJobs(jobs.filter(job => job.id !== selectedJob.id));

      toast({
        title: 'Success',
        description: 'Job has been deleted successfully.',
      });

      setDeleteDialogOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" /> Manage Job Postings
        </h1>
        <Button asChild>
          <Link href="/dashboard/client/post-job">
            <FilePlus2 className="mr-2" /> Post New Job
          </Link>
        </Button>
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
            <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start hiring talented professionals by posting your first job. It only takes a few minutes!
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/client/post-job">
                <FilePlus2 className="mr-2 h-5 w-5" /> Post Your First Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section - Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 mt-0.5">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1 truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {job.description}
                        </p>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">${job.budget.toLocaleString()}</span>
                        <span>Budget</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">{job.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>Posted {job.datePosted}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">{job.applicants.length}</span>
                        <span>{job.applicants.length === 1 ? 'Applicant' : 'Applicants'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={statusVariant[job.status]} className="whitespace-nowrap">
                      {statusLabel[job.status]}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewJob(job)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/client/manage-jobs/${job.id}/proposals`)}>
                          <FileText className="mr-2 h-4 w-4" /> View Proposals
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditJob(job.id)} disabled={job.status === 'closed'}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === 'open' && (
                          <DropdownMenuItem onClick={() => handleCloseJob(job.id)}>
                            <Archive className="mr-2 h-4 w-4" /> Close Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(job)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Job Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">{selectedJob?.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedJob?.category} • Posted on {selectedJob?.datePosted}
                </DialogDescription>
              </div>
              {selectedJob && (
                <Badge variant={statusVariant[selectedJob.status]} className="mt-1">
                  {statusLabel[selectedJob.status]}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6 mt-2">
              {/* Description */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Job Description
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              
              {/* Key Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Budget
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedJob.budget.toLocaleString()}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Duration
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedJob.duration}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Applicants
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedJob.applicants.length} {selectedJob.applicants.length === 1 ? 'professional' : 'professionals'}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Work Location
                </h3>
                <Badge variant="outline" className="capitalize text-sm">
                  {selectedJob.location}
                </Badge>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedJob && selectedJob.status !== 'closed' && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleEditJob(selectedJob.id);
              }}>
                <Edit className="mr-2 h-4 w-4" /> Edit Job
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
