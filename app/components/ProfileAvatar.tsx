'use client';
// Marks this component as a Client Component (required for interactivity, events, hooks)

import { User, Camera } from 'lucide-react';
// Icon components used for default avatar and edit overlay button

import Image from 'next/image';
// Next.js optimized Image component (automatic lazy loading, optimization)

import { cn } from '@/lib/utils';
// Utility function for safely combining conditional Tailwind class names

/**
 * ProfileAvatarProps
 * ------------------
 * Props definition for the ProfileAvatar component
 */
interface ProfileAvatarProps {
    fullName?: string;            // Full name of the user (used to generate initials)
    avatarUrl?: string;           // URL of uploaded profile image
    size?: 'sm' | 'md' | 'lg' | 'xl'; // Predefined avatar sizes
    editable?: boolean;           // Enables edit overlay button when true
    onEditClick?: () => void;     // Callback when edit button is clicked
    className?: string;           // Optional additional CSS classes
}

/**
 * ProfileAvatar Component
 * -----------------------
 * Displays:
 * - User initials with gradient background (fallback)
 * - OR uploaded profile image
 * - Optional edit button overlay
 */
export default function ProfileAvatar({
    fullName = '',
    avatarUrl,
    size = 'lg',
    editable = false,
    onEditClick,
    className
}: ProfileAvatarProps) {

    /**
     * getInitials
     * ------------
     * Extracts initials from the user's full name
     * - Single word → first letter
     * - Multiple words → first + last initials
     * - Empty value → defaults to "U"
     */
    const getInitials = (name: string) => {
        if (!name || name.trim() === '') return 'U';
        
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Computed initials used when no avatar image exists
    const initials = getInitials(fullName);

    /**
     * Size mappings
     * -------------
     * Centralized configuration for avatar dimensions and font sizing
     */
    const sizeClasses = {
        sm: 'w-12 h-12 text-sm',
        md: 'w-20 h-20 text-xl',
        lg: 'w-32 h-32 text-4xl',
        xl: 'w-40 h-40 text-5xl'
    };

    // Image size scaling (used to generate higher resolution images)
    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 40,
        xl: 48
    };

    // Camera button container size
    const cameraSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-12 h-12'
    };

    // Camera icon SVG size
    const cameraIconSizes = {
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18
    };

    /**
     * Placeholder detection
     * ---------------------
     * Determines whether to show initials instead of image
     * Covers:
     * - Missing URL
     * - Known placeholder services
     * - Empty string values
     */
    const isPlaceholder = !avatarUrl || 
                         avatarUrl.includes('placehold.co') || 
                         avatarUrl.includes('placeholder') ||
                         avatarUrl.trim() === '';

    return (
        <div className={cn('relative inline-block', className)}>
            {/* Avatar container */}
            <div
                className={cn(
                    'rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg',
                    sizeClasses[size]
                )}
            >
                {isPlaceholder ? (
                    // Fallback: show initials with gradient background
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        {initials}
                    </div>
                ) : (
                    // Display uploaded avatar image
                    <Image
                        src={avatarUrl}
                        alt={fullName || 'Profile'}
                        width={iconSizes[size] * 4}
                        height={iconSizes[size] * 4}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Edit avatar button overlay */}
            {editable && (
                <button
                    type="button"
                    onClick={onEditClick}
                    className={cn(
                        'absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors',
                        cameraSizes[size]
                    )}
                    aria-label="Change profile picture"
                >
                    <Camera
                        className={`w-${cameraIconSizes[size]} h-${cameraIconSizes[size]}`}
                        size={cameraIconSizes[size]}
                    />
                </button>
            )}
        </div>
    );
}
