'use client';

import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { db } from '../lib/firebase/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface Rating {
  id: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'client' | 'professional';
  rating: number;
  categories: Record<string, number>;
  review: string;
  createdAt: string;
}

interface ReviewsListProps {
  userId: string;
  userRole: 'client' | 'professional';
}

export default function ReviewsList({ userId, userRole }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [userId]);

  const loadReviews = async () => {
    try {
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('revieweeId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(ratingsQuery);
      const ratingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Rating[];

      setReviews(ratingsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-gray-200"><div /></CardHeader>
            <CardContent className="h-24 bg-gray-100"><div /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Star className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            Complete projects and receive ratings to build your reputation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{review.reviewerName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {review.reviewerRole === 'client' ? 'Client' : 'Professional'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    <span className="text-sm font-semibold">{review.rating}.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Project Title */}
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">Project:</p>
              <p className="font-medium">{review.projectTitle}</p>
            </div>

            {/* Category Ratings */}
            {review.categories && Object.keys(review.categories).length > 0 && (
              <div className="mb-3 space-y-2">
                <p className="text-sm font-semibold">Category Ratings:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(review.categories).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Written Review */}
            {review.review && review.review.trim() && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-1">Review:</p>
                <p className="text-sm leading-relaxed">{review.review}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
