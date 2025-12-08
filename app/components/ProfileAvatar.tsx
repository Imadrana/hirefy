'use client';

import { User, Camera } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
    fullName?: string;
    avatarUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    editable?: boolean;
    onEditClick?: () => void;
    className?: string;
}

export default function ProfileAvatar({
    fullName = '',
    avatarUrl,
    size = 'lg',
    editable = false,
    onEditClick,
    className
}: ProfileAvatarProps) {
    // Get initials from full name
    const getInitials = (name: string) => {
        if (!name || name.trim() === '') return 'U';
        
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const initials = getInitials(fullName);

    // Size mappings
    const sizeClasses = {
        sm: 'w-12 h-12 text-sm',
        md: 'w-20 h-20 text-xl',
        lg: 'w-32 h-32 text-4xl',
        xl: 'w-40 h-40 text-5xl'
    };

    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 40,
        xl: 48
    };

    const cameraSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-12 h-12'
    };

    const cameraIconSizes = {
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18
    };

    // Check if avatarUrl is a placeholder
    const isPlaceholder = !avatarUrl || 
                         avatarUrl.includes('placehold.co') || 
                         avatarUrl.includes('placeholder') ||
                         avatarUrl.trim() === '';

    return (
        <div className={cn('relative inline-block', className)}>
            <div className={cn(
                'rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg',
                sizeClasses[size]
            )}>
                {isPlaceholder ? (
                    // Show initials with gradient background
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        {initials}
                    </div>
                ) : (
                    // Show uploaded image
                    <Image
                        src={avatarUrl}
                        alt={fullName || 'Profile'}
                        width={iconSizes[size] * 4}
                        height={iconSizes[size] * 4}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Edit button overlay */}
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
                    <Camera className={`w-${cameraIconSizes[size]} h-${cameraIconSizes[size]}`} size={cameraIconSizes[size]} />
                </button>
            )}
        </div>
    );
}
