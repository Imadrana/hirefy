'use client';

import { useAuth, type UserData } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Briefcase, MessageSquare, Search, Settings, User, LayoutGrid, FilePlus2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ClientSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: '/dashboard/client', label: 'Dashboard', icon: LayoutGrid },
        { href: '/dashboard/client/post-job', label: 'Post a Job', icon: FilePlus2 },
        { href: '/dashboard/client/manage-jobs', label: 'Manage Jobs', icon: Briefcase },
        { href: '/dashboard/client/find-professionals', label: 'Find Professionals', icon: Search },
        { href: '/dashboard/client/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/client/profile', label: 'Company Profile', icon: User },
        { href: '/dashboard/client/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <Sidebar>
            <SidebarMenu>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                         <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                            tooltip={{
                                children: item.label
                            }}
                         >
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </Sidebar>
    )
}


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getRedirectPath = (data: UserData | null) => {
      if (!data) return '/login';
      switch (data.role) {
          case 'admin': return '/dashboard/admin';
          case 'professional': return '/dashboard/professional';
          default: return '/';
      }
  }

  useEffect(() => {
    if (!loading && (!userData || userData.role !== 'client')) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push(getRedirectPath(userData));
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
        <div className="flex">
            <ClientSidebar />
            <SidebarInset>
                <div className="p-4 md:p-8 w-full">
                    {children}
                </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
  );
}
