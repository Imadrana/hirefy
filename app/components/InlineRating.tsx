'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineRatingProps {
  userId: string;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function InlineRating({ 
  userId, 
  className = '', 
  showCount = true,
  size = 'sm' 
}: InlineRatingProps) {
  const [rating, setRating] = useState<{ average: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      if (!userId || !db) return;
      
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const ratings = userData.ratings;
          
          if (ratings && ratings.totalRatings > 0) {
            setRating({
              average: ratings.averageRating || 0,
              total: ratings.totalRatings || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [userId]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const starSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (loading) {
    return null;
  }

  if (!rating || rating.total === 0) {
    return (
      <div className={cn('inline-flex items-center gap-1 text-muted-foreground', sizeClasses[size], className)}>
        <Star className={cn('text-muted-foreground', starSizes[size])} />
        <span className="text-muted-foreground text-xs">
          No ratings yet
        </span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1 text-muted-foreground', sizeClasses[size], className)}>
      <Star className={cn('fill-yellow-400 text-yellow-400', starSizes[size])} />
      <span className="font-semibold text-foreground">
        {rating.average.toFixed(1)}
      </span>
      {showCount && (
        <span className="text-muted-foreground">
          ({rating.total})
        </span>
      )}
    </div>
  );
}
