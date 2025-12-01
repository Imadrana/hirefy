'use client';

import { useAuth, type UserData } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Briefcase, MessageSquare, UserSearch, Settings, User, LayoutGrid, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Client Sidebar ---
const ClientSidebar = () => {
  const pathname = usePathname();

  const menuItems: { href: string; label: string; icon: typeof User }[] = [
    { href: '/dashboard/client', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/client/post-job', label: 'Post a Job', icon: FilePlus },
    { href: '/dashboard/client/manage-jobs', label: 'Manage Jobs', icon: Briefcase },
    { href: '/dashboard/client/find-professionals', label: 'Find Professionals', icon: UserSearch },
    { href: '/dashboard/client/message', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/client/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/client/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar>
      <div className="px-4 py-6 border-b">
        <h2 className="text-lg font-bold font-headline">Client</h2>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  );
};

// --- Client Layout ---
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getRedirectPath = (data: UserData | null): string => {
    if (!data) return '/login';
    switch (data.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'professional':
        return '/dashboard/professional';
      default:
        return '/';
    }
  };

  useEffect(() => {
    if (!loading && (!userData || userData.role !== 'client')) {
      const redirectPath = getRedirectPath(userData);
      
      // Only show "Access Denied" if user has a different role (not when logging out)
      // If userData is null, they're logged out, so just redirect silently
      if (userData && userData.role !== 'client') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to view this page.',
        });
      }
      
      router.push(redirectPath);
    }
  }, [userData, loading, router, toast]);

  if (loading || !userData || userData.role !== 'client') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        <div className="p-4 md:p-8 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
