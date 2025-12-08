//reference 
/*Create a Next.js 14 client layout file at /app/dashboard/admin/layout.tsx with 'use client' at the top. Use React hooks, Tailwind CSS, and import useAuth from @/context/AuthContext, useRouter from next/navigation, useToast from @/hooks/use-toast, and the Loader2 icon from lucide-react.

The layout should check if the user is authenticated and has the role of admin. If the user is missing or has a different role, show a destructive toast message “Access Denied” and redirect them to the correct page based on their role (/dashboard/client, /dashboard/professional, or /login).

While authentication is still loading, or the user role is invalid, display a full-height loading spinner centered on the screen using Tailwind classes (flex items-center justify-center min-h-[calc(100vh-4rem)]).

Once authenticated and verified as an admin, render the children content normally. Keep the structure simple, efficient, and aligned with the overall dashboard layout logic.*/
'use client';

import { useAuth, type UserData } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getRedirectPath = (data: UserData | null) => {
      if (!data) return '/login';
      switch (data.role) {
          case 'client': return '/dashboard/client';
          case 'professional': return '/dashboard/professional';
          default: return '/';
      }
  }

  useEffect(() => {
    if (!loading && (!userData || userData.role !== 'admin')) {
      const redirectPath = getRedirectPath(userData);
      
      // Only show "Access Denied" if user has a different role (not when logging out)
      // If userData is null, they're logged out, so just redirect silently
      if (userData && userData.role !== 'admin') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to view this page.',
        });
      }
      
      router.push(redirectPath);
    }
  }, [userData, loading, router, toast]);

  if (loading || !userData || userData.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
