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
    if (!loading && userData && userData.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push(getRedirectPath(userData));
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
