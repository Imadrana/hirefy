'use client';

import { useAuth, type UserData } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Briefcase, MessageSquare, Search, Settings, User, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ProfessionalSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: '/dashboard/professional', label: 'Dashboard', icon: LayoutGrid },
        { href: '/dashboard/professional/find-jobs', label: 'Find Jobs', icon: Search },
        { href: '/dashboard/professional/manage-jobs', label: 'My Jobs', icon: Briefcase },
        { href: '/dashboard/professional/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/professional/profile', label: 'My Profile', icon: User },
        { href: '/dashboard/professional/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <Sidebar>
            <div className="px-4 py-6 border-b">
                <h2 className="text-lg font-bold font-headline">Professional</h2>
                <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
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
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </Sidebar>
    )
}


export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getRedirectPath = (data: UserData | null) => {
      if (!data) return '/login';
      switch (data.role) {
          case 'admin': return '/dashboard/admin';
          case 'client': return '/dashboard/client';
          default: return '/';
      }
  }

  useEffect(() => {
    if (!loading && (!userData || userData.role !== 'professional')) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push(getRedirectPath(userData));
    }
  }, [userData, loading, router, toast]);

  if (loading || !userData || userData.role !== 'professional') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <SidebarProvider>
        <ProfessionalSidebar />
        <SidebarInset>
            <div className="p-4 md:p-8 w-full">
                {children}
            </div>
        </SidebarInset>
      </SidebarProvider>
  );
}