'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Star, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { db } from '../lib/firebase/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import RatingDialog from './RatingDialog';

interface Proposal {
  id: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  status: string;
  completionStatus?: {
    clientCompleted: boolean;
    professionalCompleted: boolean;
    clientCompletedAt?: string;
    professionalCompletedAt?: string;
  };
  ratingsGiven?: {
    clientRated: boolean;
    professionalRated: boolean;
  };
}

interface ProjectCompletionProps {
  proposal: Proposal;
  userRole: 'client' | 'professional';
  userId: string;
  userName: string;
  onUpdate: () => void;
}

export default function ProjectCompletion({
  proposal,
  userRole,
  userId,
  userName,
  onUpdate,
}: ProjectCompletionProps) {
  const { toast } = useToast();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(proposal.completionStatus);
  const [ratingsGiven, setRatingsGiven] = useState(proposal.ratingsGiven);

  useEffect(() => {
    setCompletionStatus(proposal.completionStatus);
    setRatingsGiven(proposal.ratingsGiven);
  }, [proposal]);

  const isUserCompleted = userRole === 'client' 
    ? completionStatus?.clientCompleted 
    : completionStatus?.professionalCompleted;

  const isOtherPartyCompleted = userRole === 'client'
    ? completionStatus?.professionalCompleted
    : completionStatus?.clientCompleted;

  const isBothCompleted = completionStatus?.clientCompleted && completionStatus?.professionalCompleted;

  const hasUserRated = userRole === 'client'
    ? ratingsGiven?.clientRated
    : ratingsGiven?.professionalRated;

  const canRate = isBothCompleted && !hasUserRated;

  const handleMarkComplete = async () => {
    setIsProcessing(true);

    try {
      const proposalRef = doc(db, 'proposals', proposal.id);
      const proposalDoc = await getDoc(proposalRef);

      if (!proposalDoc.exists()) {
        throw new Error('Proposal not found');
      }

      const currentData = proposalDoc.data();
      const currentCompletion = currentData.completionStatus || {
        clientCompleted: false,
        professionalCompleted: false,
      };

      const updateData: any = {
        completionStatus: {
          ...currentCompletion,
        },
      };

      if (userRole === 'client') {
        updateData.completionStatus.clientCompleted = true;
        updateData.completionStatus.clientCompletedAt = new Date().toISOString();
      } else {
        updateData.completionStatus.professionalCompleted = true;
        updateData.completionStatus.professionalCompletedAt = new Date().toISOString();
      }

      await updateDoc(proposalRef, updateData);

      toast({
        title: 'Success',
        description: 'Project marked as completed!',
      });

      setCompletionStatus(updateData.completionStatus);
      setShowCompleteDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error marking project as complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark project as complete. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (isBothCompleted) {
      return <Badge className="bg-green-500">Completed by Both</Badge>;
    }
    if (isUserCompleted) {
      return <Badge className="bg-blue-500">You Completed</Badge>;
    }
    if (isOtherPartyCompleted) {
      return <Badge className="bg-yellow-500">Awaiting Your Completion</Badge>;
    }
    return <Badge variant="outline">In Progress</Badge>;
  };

  const revieweeId = userRole === 'client' ? proposal.professionalId : proposal.clientId;
  const revieweeName = userRole === 'client' ? proposal.professionalName : proposal.clientName;
  const revieweeRole = userRole === 'client' ? 'professional' : 'client';

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {isBothCompleted && hasUserRated && (
          <Badge className="bg-purple-500">
            <Star className="w-3 h-3 mr-1" />
            Rated
          </Badge>
        )}
      </div>

      {/* Completion Info */}
      {(isUserCompleted || isOtherPartyCompleted) && (
        <div className="space-y-2 text-sm">
          {completionStatus?.clientCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Client marked as complete</span>
            </div>
          )}
          {completionStatus?.professionalCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Professional marked as complete</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isUserCompleted && (
          <Button
            onClick={() => setShowCompleteDialog(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Complete
          </Button>
        )}

        {canRate && (
          <Button
            onClick={() => setShowRatingDialog(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Rate {revieweeRole === 'professional' ? 'Professional' : 'Client'}
          </Button>
        )}

        {isBothCompleted && hasUserRated && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>You have rated this project</span>
          </div>
        )}
      </div>

      {/* Waiting for other party message */}
      {isUserCompleted && !isOtherPartyCompleted && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            Waiting for {revieweeRole === 'professional' ? 'the professional' : 'the client'} to mark the project as complete. 
            You&apos;ll be able to rate them once both parties have marked the project as completed.
          </div>
        </div>
      )}

      {/* Complete Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Project as Complete</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this project as completed? This confirms that the work has been finished to your satisfaction.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkComplete} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Completion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        projectId={proposal.id}
        projectTitle={proposal.jobTitle}
        revieweeId={revieweeId}
        revieweeName={revieweeName}
        revieweeRole={revieweeRole}
        reviewerId={userId}
        reviewerName={userName}
        reviewerRole={userRole}
      />
    </div>
  );
}
