'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, XCircle, Loader2, User, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  professionalId: string;
  professionalEmail: string;
  professionalName: string;
  coverLetter: string;
  proposedRate: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

interface Job {
  id: string;
  title: string;
  budget: number;
}

const statusVariant: Record<Proposal['status'], 'default' | 'secondary' | 'destructive'> = {
  'pending': 'default',
  'accepted': 'secondary',
  'declined': 'destructive',
};

const statusLabel: Record<Proposal['status'], string> = {
  'pending': 'Pending',
  'accepted': 'Accepted',
  'declined': 'Declined',
};

export default function JobProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch job details
  useEffect(() => {
    if (!jobId || !user) return;

    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          const data = jobDoc.data();
          // Verify this is the client's job
          if (data.clientId !== user.uid) {
            toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: 'You do not have permission to view these proposals.',
            });
            router.push('/dashboard/client/manage-jobs');
            return;
          }
          setJob({
            id: jobDoc.id,
            title: data.title,
            budget: data.budget,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Job not found.',
          });
          router.push('/dashboard/client/manage-jobs');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };

    fetchJob();
  }, [jobId, user, toast, router]);

  // Fetch proposals
  useEffect(() => {
    if (!jobId || !user) {
      console.log('⚠️ No jobId or user found', { jobId, userId: user?.uid });
      return;
    }

    console.log('🔍 Starting to fetch proposals for jobId:', jobId, 'user:', user.uid);

    // Query proposals where clientId matches current user (this respects Firestore rules)
    const proposalsCollection = collection(db, 'proposals');
    const proposalsQuery = query(
      proposalsCollection, 
      where('clientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      proposalsQuery,
      (snapshot) => {
        console.log('📦 Total proposals for client:', snapshot.docs.length);
        const proposalsData: Proposal[] = [];
        
        // Filter for this specific job's proposals client-side
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Checking proposal:', doc.id, 'jobId:', data.jobId, 'matches:', data.jobId === jobId);
          if (data.jobId === jobId) {
            proposalsData.push({
              id: doc.id,
              ...data,
            } as Proposal);
          }
        });

        // Sort by createdAt
        proposalsData.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        console.log('✅ Found proposals for job', jobId, ':', proposalsData.length);
        console.log('📋 Proposals data:', proposalsData);
        setProposals(proposalsData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error fetching proposals:', error);
        console.error('❌ Error details:', error.message, error.code);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to load proposals: ${error.message}`,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobId, user, toast]);

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setViewDialogOpen(true);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setActionLoading(true);
    try {
      const proposalRef = doc(db, 'proposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Success!',
        description: 'Proposal accepted successfully!',
      });
      setViewDialogOpen(false);
    } catch (error) {
      console.error('Error accepting proposal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept proposal. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineProposal = async (proposalId: string) => {
    setActionLoading(true);
    try {
      const proposalRef = doc(db, 'proposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'declined',
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Proposal Declined',
        description: 'The proposal has been declined.',
      });
      setViewDialogOpen(false);
    } catch (error) {
      console.error('Error declining proposal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to decline proposal. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/client/manage-jobs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Proposals</h1>
          {job && (
            <p className="text-muted-foreground mt-1">
              For: <span className="font-semibold">{job.title}</span>
            </p>
          )}
        </div>
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading proposals...</span>
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No proposals yet</h3>
            <p className="text-muted-foreground">
              Professionals haven't submitted any proposals for this job yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{proposal.professionalName}</h3>
                        <p className="text-sm text-muted-foreground">{proposal.professionalEmail}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {proposal.coverLetter}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">${proposal.proposedRate.toLocaleString()}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Submitted {getTimeAgo(proposal.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={statusVariant[proposal.status]}>
                      {statusLabel[proposal.status]}
                    </Badge>
                    <Button size="sm" onClick={() => handleViewProposal(proposal)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Proposal Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Review the professional's proposal for this job
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4 py-4">
              {/* Professional Info */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedProposal.professionalName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProposal.professionalEmail}</p>
                </div>
              </div>

              {/* Proposed Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Proposed Rate
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedProposal.proposedRate.toLocaleString()}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Your Budget
                  </div>
                  <div className="text-2xl font-bold">
                    ${job?.budget.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Cover Letter
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedProposal.coverLetter}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Status
                </h4>
                <Badge variant={statusVariant[selectedProposal.status]}>
                  {statusLabel[selectedProposal.status]}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} disabled={actionLoading}>
              Close
            </Button>
            {selectedProposal && selectedProposal.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleDeclineProposal(selectedProposal.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Decline
                </Button>
                <Button
                  onClick={() => handleAcceptProposal(selectedProposal.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Accept
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
