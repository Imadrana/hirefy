// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/about   File: page.tsx
//
// Description:
// - Front-end React (TypeScript/TSX) page for the Hirefy About section
// - Displays company story, mission, and core values
// - Uses reusable UI components: Button, Card, and ValueCard
// - Includes responsive design using TailwindCSS utilities
// - Sections: Hero, Story (with image), Core Values, and CTA
//
// Technical Understanding & Research Summary:
// - Learned about Next.js pages structure and how files in /app folder map to routes
// - Studied TailwindCSS grid, spacing, and responsive design techniques
// - Used lucide-react for SVG icons (Building, Heart, Target, etc.)
// - Implemented reusable subcomponent (ValueCard) to avoid code duplication
// - Used Next.js Image for optimized rendering of images
//
// References / Tutorials:
// • Next.js Pages Routing: https://nextjs.org/docs/app/building-your-application/routing
// • TailwindCSS Utilities: https://tailwindcss.com/docs
// • Lucide Icons: https://lucide.dev
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "I need you to create an AboutPage for my Hirefy web application. 
// The page should include a hero section, a story section with text and an image, 
// a core values section using reusable value cards with icons, 
// and a call-to-action with a button. Use Next.js with TypeScript/TSX, 
// TailwindCSS for styling, and import UI components like Card and Button. 
// The layout should be fully responsive and visually engaging."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React + Next.js)
// - Side: Frontend Page (Client-side)
// - Libraries Used: Next.js, TailwindCSS, lucide-react
// - Purpose: Display About content for Hirefy with story, values, and CTA
// -------------------------------'use client';

import { useAuth, type UserData } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Briefcase, MessageSquare, Search, Settings, User, LayoutGrid } from 'lucide-react';
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

// --- Professional Sidebar ---
const ProfessionalSidebar = () => {
  const pathname = usePathname();

  const menuItems: { href: string; label: string; icon: typeof User }[] = [
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

// --- Professional Layout ---
export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getRedirectPath = (data: UserData | null): string => {
    if (!data) return '/login';
    switch (data.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'client':
        return '/dashboard/client';
      default:
        return '/';
    }
  };

  useEffect(() => {
    if (!loading && (!userData || userData.role !== 'professional')) {
      const redirectPath = getRedirectPath(userData);
      
      // Only show "Access Denied" if user has a different role (not when logging out)
      // If userData is null, they're logged out, so just redirect silently
      if (userData && userData.role !== 'professional') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to view this page.',
        });
      }
      
      router.push(redirectPath);
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
        <div className="p-4 md:p-8 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
                  