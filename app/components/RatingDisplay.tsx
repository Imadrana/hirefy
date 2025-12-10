'use client';

import { Star } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  ratingsBreakdown?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  showBreakdown?: boolean;
}

export default function RatingDisplay({
  averageRating,
  totalRatings,
  ratingsBreakdown,
  showBreakdown = false,
}: RatingDisplayProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 3.5) return 'text-blue-500';
    if (rating >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingBadgeVariant = (rating: number): "default" | "secondary" | "destructive" | "outline" => {
    if (rating >= 4.5) return 'default';
    if (rating >= 3.5) return 'secondary';
    if (rating >= 2.5) return 'outline';
    return 'destructive';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    return 'Poor';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= Math.round(rating);
          const isHalfFilled = star === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <div key={star} className="relative">
              <Star
                className={`w-5 h-5 ${
                  isFilled || isHalfFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const calculatePercentage = (count: number) => {
    if (totalRatings === 0) return 0;
    return Math.round((count / totalRatings) * 100);
  };

  if (totalRatings === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Star className="w-5 h-5" />
        <span className="text-sm">No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Average Rating Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {renderStars(averageRating)}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
            {averageRating.toFixed(1)}
          </span>
          <Badge variant={getRatingBadgeVariant(averageRating)}>
            {getRatingLabel(averageRating)}
          </Badge>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Based on {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
      </div>

      {/* Ratings Breakdown */}
      {showBreakdown && ratingsBreakdown && (
        <div className="space-y-2 pt-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingsBreakdown[star as keyof typeof ratingsBreakdown] || 0;
            const percentage = calculatePercentage(count);

            return (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-muted-foreground text-right">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact version for profile cards
export function CompactRatingDisplay({ averageRating, totalRatings }: Omit<RatingDisplayProps, 'ratingsBreakdown' | 'showBreakdown'>) {
  if (totalRatings === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <Star className="w-4 h-4" />
        <span>No ratings</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
      </div>
      <span className="text-xs text-muted-foreground">
        ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
      </span>
    </div>
  );
}
