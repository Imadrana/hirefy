/*Create a Next.js 14 client layout file at /app/dashboard/professional/layout.tsx with 'use client' at the top. Use Tailwind CSS, React hooks, and components from @/components/ui/sidebar. Import useAuth from @/context/AuthContext, useRouter and usePathname from next/navigation, useToast from @/hooks/use-toast, and icons from lucide-react.

Build a sidebar for professional users with menu links: Dashboard, Find Jobs, My Jobs, Messages, My Profile, and Settings — each with an icon and label. The active link should be highlighted using the current pathname.

Use SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, and SidebarInset to structure the layout. Show a small header at the top of the sidebar labeled “Professional Dashboard.”

In the main ProfessionalLayout component, check authentication and role using useAuth. If the user is not logged in or not a professional, show a destructive toast saying “Access Denied” and redirect them to the correct dashboard route (/login, /dashboard/admin, or /dashboard/client).

While authentication is loading, display a centered loading spinner using the Loader2 icon. Once authenticated, render the sidebar and the page content (children) inside a responsive layout with padding and spacing. The design should be clean, modern, and consistent with a professional dashboard style.*/
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