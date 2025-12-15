// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/components/ui File: Navbar.tsx
//
// Description:
// - Front-end React (TypeScript/Next.js) component for the Hirefy Navigation Bar  
// - Manages navigation links and Firebase authentication state  
// - Shows Login/Register for guests and Dashboard/Logout for logged-in users  
// - Includes custom Hirefy SVG logo and mobile-friendly slide menu 
//
// Technical Understanding & Research Summary:
// - Researched through:
//   • Google search results on React navigation and authentication best practices  
//   • Official React documentation: https://react.dev  
//   • Next.js documentation: https://nextjs.org/docs  
//   • Firebase Authentication docs: https://firebase.google.com/docs/auth  
//   • YouTube tutorials on responsive navbars and authentication in React
//     - https://www.youtube.com/watch?v=NWEukI8KsBI  
//     - https://www.youtube.com/watch?v=6kgitEWTxac  
//     - https://firebase.google.com/docs/auth
// - Final code refined and documented with ChatGPT assistance for clarity and maintainability.  
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
// I gave ChatGPT the following prompt to help me write and understand
// this component clearly:
//
// "I need you to create a responsive navigation bar (Navbar) for my Hirefy web application,
// built with React (TypeScript/Next.js). It should manage navigation links, handle authentication
// state with Firebase, support role-based dashboard routing, and include logout functionality.
// The Navbar must include a custom logo, a dynamic user dropdown menu for authenticated users,
// and a mobile-friendly layout for smaller screens, ensuring a seamless and modern user experience."
// -------------------------------
//  Summary:
// - Language: TypeScript / TSX (React / Next.js)
// - Side: Frontend Component (Client-side)
// - Libraries Used: firebase/auth, next/link, next/navigation, shadcn/ui, lucide-react
// - Purpose: To provide a responsive navigation bar with authentication awareness,
//   dynamic role-based dashboard routing, and a modern mobile drawer menu.
// -------------------------------
//
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { db } from '../lib/firebase/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface RatingCategory {
  label: string;
  key: string;
}

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  revieweeId: string;
  revieweeName: string;
  revieweeRole: 'client' | 'professional';
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'client' | 'professional';
}

const professionalCategories: RatingCategory[] = [
  { label: 'Quality of Work', key: 'quality' },
  { label: 'Communication', key: 'communication' },
  { label: 'Timeliness', key: 'timeliness' },
  { label: 'Professionalism', key: 'professionalism' },
];

const clientCategories: RatingCategory[] = [
  { label: 'Communication', key: 'communication' },
  { label: 'Payment Timeliness', key: 'payment' },
  { label: 'Clear Requirements', key: 'requirements' },
  { label: 'Professionalism', key: 'professionalism' },
];

export default function RatingDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  revieweeId,
  revieweeName,
  revieweeRole,
  reviewerId,
  reviewerName,
  reviewerRole,
}: RatingDialogProps) {
  const { toast } = useToast();
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<{ key: string; rating: number } | null>(null);

  const categories = revieweeRole === 'professional' ? professionalCategories : clientCategories;

  const handleOverallRatingClick = (rating: number) => {
    setOverallRating(rating);
  };

  const handleCategoryRatingClick = (categoryKey: string, rating: number) => {
    setCategoryRatings(prev => ({ ...prev, [categoryKey]: rating }));
  };

  const handleSubmit = async () => {
    // Get current auth user with detailed logging
    const auth = getAuth();
    const currentUser = auth.currentUser;

    console.log('🔐 DETAILED AUTH CHECK:');
    console.log('  - Auth object exists:', !!auth);
    console.log('  - Current user exists:', !!currentUser);
    console.log('  - Current user ID:', currentUser?.uid);
    console.log('  - Current user email:', currentUser?.email);
    console.log('  - ReviewerId passed:', reviewerId);
    console.log('  - ReviewerName passed:', reviewerName);
    console.log('  - Match:', currentUser?.uid === reviewerId);
    console.log('  - Auth token:', currentUser ? 'exists' : 'missing');

    // Check if user is authenticated
    if (!currentUser) {
      console.error('❌ AUTHENTICATION FAILED: No current user found');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to submit a rating. Please log out and log back in.',
        variant: 'destructive',
      });
      return;
    }

    // Log token for debugging
    currentUser.getIdToken().then(token => {
      console.log('🎫 User has valid token:', token.substring(0, 20) + '...');
    }).catch(err => {
      console.error('❌ Token error:', err);
    });

    // Validation
    if (overallRating === 0) {
      toast({
        title: 'Error',
        description: 'Please select an overall rating',
        variant: 'destructive',
      });
      return;
    }

    // Check if all categories are rated
    const allCategoriesRated = categories.every(cat => categoryRatings[cat.key] > 0);
    if (!allCategoriesRated) {
      toast({
        title: 'Error',
        description: 'Please rate all categories',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug logging
      console.log('📝 Submitting rating with data:', {
        reviewerId,
        reviewerName,
        reviewerRole,
        revieweeId,
        revieweeName,
        revieweeRole,
        overallRating,
        categoryRatings,
      });

      // Check if already rated
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('projectId', '==', projectId),
        where('reviewerId', '==', reviewerId)
      );
      const existingRatings = await getDocs(ratingsQuery);

      if (!existingRatings.empty) {
        toast({
          title: 'Already Rated',
          description: 'You have already rated this project',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Create rating document
      const ratingData = {
        projectId,
        projectTitle,
        reviewerId,
        reviewerName,
        reviewerRole,
        revieweeId,
        revieweeName,
        revieweeRole,
        rating: overallRating,
        categories: categoryRatings,
        review: review.trim(),
        createdAt: new Date().toISOString(),
      };

      console.log('💾 About to save rating to Firestore:', ratingData);
      console.log('🔐 Current auth user ID:', reviewerId);

      await addDoc(collection(db, 'ratings'), ratingData);

      console.log('✅ Rating saved successfully!');

      // Update proposal to mark rating as given
      const proposalRef = doc(db, 'proposals', projectId);
      const proposalDoc = await getDoc(proposalRef);
      
      if (proposalDoc.exists()) {
        const updateData: any = {};
        if (reviewerRole === 'client') {
          updateData['ratingsGiven.clientRated'] = true;
        } else {
          updateData['ratingsGiven.professionalRated'] = true;
        }
        await updateDoc(proposalRef, updateData);
      }

      // Update reviewee's rating statistics
      const revieweeRef = doc(db, 'users', revieweeId);
      const revieweeDoc = await getDoc(revieweeRef);

      if (revieweeDoc.exists()) {
        const userData = revieweeDoc.data();
        const currentRatings = userData.ratings || {
          averageRating: 0,
          totalRatings: 0,
          ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };

        const newTotalRatings = currentRatings.totalRatings + 1;
        const newAverageRating =
          (currentRatings.averageRating * currentRatings.totalRatings + overallRating) / newTotalRatings;

        const newRatingsBreakdown = { ...currentRatings.ratingsBreakdown };
        newRatingsBreakdown[overallRating] = (newRatingsBreakdown[overallRating] || 0) + 1;

        await updateDoc(revieweeRef, {
          'ratings.averageRating': Number(newAverageRating.toFixed(2)),
          'ratings.totalRatings': newTotalRatings,
          'ratings.ratingsBreakdown': newRatingsBreakdown,
        });
      }

      toast({
        title: 'Success',
        description: 'Rating submitted successfully!',
      });

      // Reset form
      setOverallRating(0);
      setCategoryRatings({});
      setReview('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Error submitting rating:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to submit rating. Please try again.';
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please make sure you are logged in and have permission to rate this project.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (
    currentRating: number,
    onClick: (rating: number) => void,
    categoryKey?: string
  ) => {
    const displayRating = categoryKey
      ? hoveredCategory?.key === categoryKey
        ? hoveredCategory.rating
        : currentRating
      : hoveredStar ?? currentRating;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-8 h-8 cursor-pointer transition-all ${
              star <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onMouseEnter={() => {
              if (categoryKey) {
                setHoveredCategory({ key: categoryKey, rating: star });
              } else {
                setHoveredStar(star);
              }
            }}
            onMouseLeave={() => {
              if (categoryKey) {
                setHoveredCategory(null);
              } else {
                setHoveredStar(null);
              }
            }}
            onClick={() => onClick(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate {revieweeName}</DialogTitle>
          <DialogDescription>
            Share your experience working on &quot;{projectTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <div className="flex items-center gap-2">
              {renderStars(overallRating, handleOverallRatingClick)}
              {overallRating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {overallRating} {overallRating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Category Ratings *</Label>
            {categories.map(category => (
              <div key={category.key} className="space-y-2">
                <Label className="text-sm">{category.label}</Label>
                <div className="flex items-center gap-2">
                  {renderStars(
                    categoryRatings[category.key] || 0,
                    (rating) => handleCategoryRatingClick(category.key, rating),
                    category.key
                  )}
                  {categoryRatings[category.key] > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {categoryRatings[category.key]} {categoryRatings[category.key] === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <Label htmlFor="review" className="text-base font-semibold">
              Written Review (Optional)
            </Label>
            <Textarea
              id="review"
              placeholder={`Share your experience working with ${revieweeName}...`}
              value={review}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
