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
// -------------------------------
//Updated admin/proffessional/page.tsx
'use client';

import { useAuth, type UserData } from '@/context/AuthContext'; // Ensure 'type UserData' is available if used elsewhere
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, User, Activity, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from 'react'; // Import React for explicit type usage
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

// Define the interface for StatCard props for cleaner TypeScript
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
    href?: string;
}

// Refactored StatCard component with explicit FC typing
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description, href }) => {
  const cardContent = (
    <Card className={href ? 'hover:shadow-md transition-shadow cursor-pointer h-full' : 'h-full'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
  
  return href ? (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};

interface DashboardStats {
  activeJobs: number;
  totalJobs: number;
  pendingProposals: number;
  acceptedProposals: number;
}

interface RecentActivity {
  id: string;
  type: 'proposal' | 'job' | 'message';
  title: string;
  description: string;
  timestamp: any;
}

export default function ProfessionalDashboard() {
  const { userData, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalJobs: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Extract user's display name, safely defaulting if parts are null
  const displayName = (() => {
    if (!userData) return 'Professional';
    if ('displayName' in userData && typeof (userData as any).displayName === 'string') {
      return (userData as any).displayName;
    }
    if ('name' in userData && typeof (userData as any).name === 'string') {
      return (userData as any).name;
    }
    if ('profile' in userData && userData.profile && 'fullName' in userData.profile && typeof (userData.profile as any).fullName === 'string') {
      return (userData.profile as any).fullName;
    }
    if ('email' in userData && typeof userData.email === 'string') {
      return userData.email.split('@')[0];
    }
    return 'Professional';
  })();
  
  // Check if profile is complete. Use a runtime type guard to handle unions where only some profiles have isComplete.
  let profileComplete = false;
  if (userData?.profile && 'isComplete' in userData.profile) {
    profileComplete = (userData.profile as { isComplete: boolean }).isComplete ?? false;
  }

  // Fetch dashboard statistics
  useEffect(() => {
    if (!user) return;

    // Fetch proposals
    const proposalsQuery = query(
      collection(db, 'proposals'),
      where('professionalId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(proposalsQuery, (snapshot) => {
      const proposals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pendingProposals = proposals.filter((prop: any) => prop.status === 'pending').length;
      const acceptedProposals = proposals.filter((prop: any) => prop.status === 'accepted').length;

      setStats(prev => ({
        ...prev,
        totalJobs: acceptedProposals,
        activeJobs: acceptedProposals,
        pendingProposals,
        acceptedProposals,
      }));

      // Create recent activities from proposals
      const proposalActivities: RecentActivity[] = proposals
        .slice(0, 5)
        .map((prop: any) => ({
          id: prop.id,
          type: 'proposal' as const,
          title: prop.status === 'accepted' 
            ? `You were hired for '${prop.jobTitle}'`
            : `Proposal submitted for '${prop.jobTitle}'`,
          description: prop.status === 'accepted'
            ? `Proposal accepted`
            : `Status: ${prop.status}`,
          timestamp: prop.updatedAt || prop.createdAt,
        }));

      setRecentActivities(proposalActivities);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold">
              Welcome back, {displayName}! 
            </h1>
            <p className="text-muted-foreground">Here's a summary of your activity on Hirefy.</p>
        </div>

        {/* --- Stats Grid --- */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                  icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                  title="Active Jobs"
                  value={stats.activeJobs.toString()}
                  description="Projects you are currently working on."
                  href="/dashboard/professional/manage-jobs"
              />
              <StatCard 
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  title="Total Jobs"
                  value={stats.totalJobs.toString()}
                  description="Total accepted proposals."
                  href="/dashboard/professional/manage-jobs"
              />
              <StatCard 
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                  title="Accepted Proposals"
                  value={stats.acceptedProposals.toString()}
                  description="Proposals that were accepted."
                  href="/dashboard/professional/manage-jobs"
              />
              <StatCard 
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                  title="Pending Proposals"
                  value={stats.pendingProposals.toString()}
                  description="Proposals awaiting client response."
                  href="/dashboard/professional/find-jobs"
              />
          </div>
        )}
        
        {/* --- Profile Completion Alert --- */}
        {!profileComplete && (
          <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="flex flex-row items-center gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <div>
                      <CardTitle>Complete Your Profile!</CardTitle>
                      <CardDescription className="text-destructive/80">Your profile is incomplete. A complete profile gets 3x more views and job invitations.</CardDescription>
                  </div>
              </CardHeader>
              <CardContent>
                  <Button asChild variant="destructive">
                      <Link href="/dashboard/professional/profile">Update Profile Now</Link>
                  </Button>
              </CardContent>
          </Card>
        )}

        <Separator />
        
        {/* --- Activity and CTA Section --- */}
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Keep track of recent events and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentActivities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No recent activity yet.</p>
                        <p className="text-sm mt-1">Start by submitting proposals!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                          {recentActivities.map((activity) => (
                            <Link 
                              key={activity.id} 
                              href="/dashboard/professional/manage-jobs"
                              className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <Activity className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {activity.description} - {getTimeAgo(activity.timestamp)}
                                    </p>
                                </div>
                            </Link>
                          ))}
                      </div>
                    )}
                </CardContent>
            </Card>
             <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle>Ready to find your next project?</CardTitle>
                    <CardDescription>Browse the latest opportunities on Hirefy.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button asChild size="lg">
                        <Link href="/dashboard/professional/find-jobs">
                            <Search className="mr-2 h-5 w-5"/>
                            Find New Jobs
                        </Link>
                   </Button>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}