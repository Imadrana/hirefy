'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Briefcase, Users, DollarSign, Activity, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ClientProfile } from '@/lib/firebase/firestone/type';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

const StatCard = ({
  icon,
  title,
  value,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  href?: string;
}) => {
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
  openJobs: number;
  totalProposals: number;
  acceptedProposals: number;
}

interface RecentActivity {
  id: string;
  type: 'proposal' | 'job' | 'message';
  title: string;
  description: string;
  timestamp: any;
}

export default function ClientDashboard() {
  const { userData, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    openJobs: 0,
    totalProposals: 0,
    acceptedProposals: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Narrow type to client safely
  const isClient = userData?.role === "client" && userData.profile;
  const clientProfile = isClient ? (userData.profile as ClientProfile) : undefined;

  // Safe extraction of companyName
  const companyName =
    clientProfile?.companyName ||
    (userData && 'displayName' in userData ? (userData as any).displayName : undefined) ||
    userData?.email?.split("@")[0] ||
    "Client";

  // Check if profile is complete
  const profileComplete = !!((clientProfile as any)?.isComplete);

  // Fetch dashboard statistics
  useEffect(() => {
    if (!user) return;

    // Fetch jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('clientId', '==', user.uid)
    );

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeJobs = jobs.filter((job: any) => job.status === 'active').length;
      const openJobs = jobs.filter((job: any) => job.status === 'open' || job.status === 'active').length;

      setStats(prev => ({
        ...prev,
        activeJobs,
        openJobs,
      }));
    });

    // Fetch proposals
    const proposalsQuery = query(
      collection(db, 'proposals'),
      where('clientId', '==', user.uid)
    );

    const unsubscribeProposals = onSnapshot(proposalsQuery, (snapshot) => {
      const proposals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalProposals = proposals.length;
      const acceptedProposals = proposals.filter((prop: any) => prop.status === 'accepted').length;

      setStats(prev => ({
        ...prev,
        totalProposals,
        acceptedProposals,
      }));

      // Create recent activities from proposals
      const proposalActivities: RecentActivity[] = proposals
        .slice(0, 5)
        .map((prop: any) => ({
          id: prop.id,
          type: 'proposal' as const,
          title: `New proposal for '${prop.jobTitle}'`,
          description: `From ${prop.professionalName}`,
          timestamp: prop.createdAt,
        }));

      setRecentActivities(proposalActivities);
      setLoading(false);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeProposals();
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
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-headline font-bold">
          Welcome back, {companyName}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your activity on Hirefy.
        </p>
      </div>

      {/* Stats */}
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
            description="Jobs currently active."
            href="/dashboard/client/manage-jobs"
          />
          <StatCard
            icon={<FilePlus2 className="h-4 w-4 text-muted-foreground" />}
            title="Open Job Postings"
            value={stats.openJobs.toString()}
            description="Jobs awaiting proposals."
            href="/dashboard/client/manage-jobs"
          />
          <StatCard
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            title="Proposals Received"
            value={stats.totalProposals.toString()}
            description="Total proposals received."
            href="/dashboard/client/manage-jobs"
          />
          <StatCard
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            title="Accepted Proposals"
            value={stats.acceptedProposals.toString()}
            description="Proposals you've accepted."
            href="/dashboard/client/manage-jobs"
          />
        </div>
      )}

      {/* Profile completion notice */}
      {!profileComplete && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <CardTitle className="text-orange-900">
                Complete Your Company Profile
              </CardTitle>
              <CardDescription className="text-orange-700">
                Add more details about your company to attract the best IT professionals.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-100"
            >
              <Link href="/register/client-details">Complete Profile Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Recent Activity & New Job */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Keep track of recent events and updates on your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity yet.</p>
                <p className="text-sm mt-1">Start by posting a job!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <Link 
                    key={activity.id} 
                    href="/dashboard/client/manage-jobs"
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
            <CardTitle>Ready to start something new?</CardTitle>
            <CardDescription>
              Get your next project off the ground in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/dashboard/client/post-job">
                <FilePlus2 className="mr-2 h-5 w-5" />
                Post a New Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
