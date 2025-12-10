'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RatingDisplay from '@/components/RatingDisplay';
import ReviewsList from '@/components/ReviewsList';
import { Loader2 } from 'lucide-react';

interface UserRatings {
  averageRating: number;
  totalRatings: number;
  ratingsBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function UserRatingsPage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<UserRatings | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'professional' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRatings = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
          setRatings(userData.ratings || {
            averageRating: 0,
            totalRatings: 0,
            ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          });
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRatings();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userRole) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please log in to view ratings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Ratings & Reviews</h1>

      {/* Rating Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rating Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings && (
            <RatingDisplay
              averageRating={ratings.averageRating}
              totalRatings={ratings.totalRatings}
              ratingsBreakdown={ratings.ratingsBreakdown}
              showBreakdown={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews from {userRole === 'client' ? 'Professionals' : 'Clients'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewsList userId={user.uid} userRole={userRole} />
        </CardContent>
      </Card>
    </div>
  );
}
