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
// - “My Jobs” dashboard for professionals to see all jobs where their proposal was accepted.
// - Listens to the Firestore `proposals` collection filtered by professionalId, then narrows
//   down to proposals with status "accepted".
// - For each accepted proposal, fetches the related job from `jobs` and client details from `users`.
// - Displays each job with client name, skills, your rate, duration, and a details dialog.
//
// Development Process & Key Learnings:
// - Practiced chaining Firestore queries with additional document lookups (proposals → job → client).
// - Implemented client-side filtering on the snapshot to only keep accepted proposals.
// - Used a simple `getTimeAgo` utility to show when a job was accepted in human-friendly text.
// - Structured the layout using shadcn/ui Card, Badge, Button, and a Dialog for deeper job info.
// - Focused on good UX for the “no jobs yet” state and loading state.
//
// References & Resources Used:
// • Firestore filtered queries & real-time snapshots: https://firebase.google.com/docs/firestore/query-data/queries  
// • Firestore document reads with getDoc/doc: https://firebase.google.com/docs/firestore/query-data/get-data  
// • shadcn/ui components (Card, Badge, Button, Dialog): https://ui.shadcn.com  
// • Lucide React Icons (Briefcase, Loader2, Eye, DollarSign, Clock, User, FileText): https://lucide.dev/icons  
// • TailwindCSS for spacing, flex layouts, and responsiveness: https://tailwindcss.com/docs  
// ---------------------------------------------

'use client';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Loader2, Eye, DollarSign, FileText, User, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingProposal {
  id: string;
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
  submittedAt: any;
  status: string;
}

export default function PendingProposalsPage() {
  const [proposals, setProposals] = useState<PendingProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<PendingProposal | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Query proposals where professionalId matches current user
    const proposalsCollection = collection(db, 'proposals');
    const proposalsQuery = query(
      proposalsCollection,
      where('professionalId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      proposalsQuery,
      async (snapshot) => {
        console.log('✅ Found', snapshot.docs.length, 'pending proposals');
        
        const proposalsData: PendingProposal[] = [];

        for (const docSnap of snapshot.docs) {
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

            proposalsData.push({
              id: docSnap.id,
              jobId: proposalData.jobId,
              jobTitle: jobDetails.title || proposalData.jobTitle || 'Untitled Job',
              clientId: proposalData.clientId,
              clientName,
              clientEmail,
              proposedRate: proposalData.proposedRate,
              coverLetter: proposalData.coverLetter,
              jobDescription: jobDetails.description,
              jobBudget: jobDetails.budget,
              jobDuration: jobDetails.duration,
              jobSkills: jobDetails.skills,
              submittedAt: proposalData.submittedAt,
              status: proposalData.status,
            });
          } catch (error) {
            console.error('Error fetching job/client details:', error);
          }
        }

        setProposals(proposalsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching pending proposals:', error);
        toast({
          title: "Error",
          description: "Failed to load pending proposals.",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleViewProposal = (proposal: PendingProposal) => {
    setSelectedProposal(proposal);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (proposal: PendingProposal) => {
    setSelectedProposal(proposal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProposal = async () => {
    if (!selectedProposal) return;

    setDeletingId(selectedProposal.id);
    try {
      await deleteDoc(doc(db, 'proposals', selectedProposal.id));
      toast({
        title: "Proposal Withdrawn",
        description: "Your proposal has been successfully withdrawn.",
      });
      setDeleteDialogOpen(false);
      setSelectedProposal(null);
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to withdraw proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pending Proposals</h1>
        <p className="text-muted-foreground mt-2">
          Track your submitted proposals awaiting client response
        </p>
      </div>

      {proposals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Proposals</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any pending proposals at the moment.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/professional/find-jobs'}>
              Browse Available Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{proposal.jobTitle}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{proposal.clientName}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Rate:</span>
                    <span className="font-semibold flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {proposal.proposedRate}/hr
                    </span>
                  </div>
                  
                  {proposal.jobBudget && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Job Budget:</span>
                      <span className="font-semibold flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {proposal.jobBudget}
                      </span>
                    </div>
                  )}

                  {proposal.jobDuration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{proposal.jobDuration}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span>{formatDate(proposal.submittedAt)}</span>
                  </div>

                  {proposal.jobSkills && proposal.jobSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proposal.jobSkills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {proposal.jobSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{proposal.jobSkills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewProposal(proposal)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(proposal)}
                      disabled={deletingId === proposal.id}
                    >
                      {deletingId === proposal.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProposal?.jobTitle}</DialogTitle>
            <DialogDescription>
              Proposal Details
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Client Information
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedProposal.clientName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedProposal.clientEmail}</p>
                </div>
              </div>

              {/* Job Details */}
              {selectedProposal.jobDescription && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Job Description
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedProposal.jobDescription}
                  </p>
                </div>
              )}

              {/* Your Proposal */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Your Cover Letter
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProposal.coverLetter}
                </p>
              </div>

              {/* Proposal Details */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Proposal Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Your Rate:</span>
                    <p className="font-semibold">${selectedProposal.proposedRate}/hr</p>
                  </div>
                  {selectedProposal.jobBudget && (
                    <div>
                      <span className="text-muted-foreground">Job Budget:</span>
                      <p className="font-semibold">${selectedProposal.jobBudget}</p>
                    </div>
                  )}
                  {selectedProposal.jobDuration && (
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-semibold">{selectedProposal.jobDuration}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-semibold">{formatDate(selectedProposal.submittedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedProposal.jobSkills && selectedProposal.jobSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.jobSkills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Withdraw Proposal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this proposal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold">{selectedProposal.jobTitle}</p>
              <p className="text-sm text-muted-foreground">Client: {selectedProposal.clientName}</p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProposal}
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                'Withdraw Proposal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
