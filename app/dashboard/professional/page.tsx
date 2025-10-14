/*Create a modern Next.js 14 dashboard page located at /app/dashboard/professional/page.tsx with 'use client' at the top. Use Tailwind CSS for layout and components from @/components/ui/ like Card, Button, and Separator. Import icons from lucide-react and useAuth() from @/context/AuthContext.

Display a welcome section showing the user’s name from useAuth(). Below that, add a grid of four statistic cards (Active Jobs, Invitations, Profile Views, Active Proposals) with icons and short descriptions.

If the user’s profile is incomplete (userData.profile.isComplete === false), show a red alert card with an AlertCircle icon and a “Complete Your Profile” message, including a red button linking to /dashboard/professional/profile.

After a separator, include two larger cards: one for “Recent Activity” showing sample updates with timestamps, and another encouraging the user to “Find New Jobs,” with a button linking to /dashboard/professional/find-jobs.

The design should look clean, responsive, and professional with clear spacing, rounded corners, and a friendly dashboard layout.*/
'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, User, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const StatCard = ({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) => (
  <Card>
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


export default function ProfessionalDashboard() {
  const { userData } = useAuth();
  
  // Extract user's display name from userData
  const displayName = userData?.displayName || userData?.email?.split('@')[0] || 'Professional';
  
  // Check if profile is complete (you can customize this logic)
  const profileComplete = userData?.profile?.isComplete || false;

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold">
              Welcome back, {displayName}!
            </h1>
            <p className="text-muted-foreground">Here's a summary of your activity on Hirefy.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                title="Active Jobs"
                value="2"
                description="Projects you are currently working on."
            />
            <StatCard 
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                title="Invitations"
                value="5"
                description="New invitations to apply for jobs."
            />
             <StatCard 
                icon={<User className="h-4 w-4 text-muted-foreground" />}
                title="Profile Views"
                value="42"
                description="Total views this month."
            />
            <StatCard 
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                title="Active Proposals"
                value="7"
                description="Proposals awaiting client response."
            />
        </div>
        
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
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Keep track of recent events and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium">New message from Innovate Inc.</p>
                                <p className="text-sm text-muted-foreground">Regarding 'Mobile App API' - 1 hour ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium">You were hired for 'Database Migration'.</p>
                                <p className="text-sm text-muted-foreground">By Tech Solutions Ltd. - 1 day ago</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium">New job posting matches your skills.</p>
                                <p className="text-sm text-muted-foreground">'Senior Cloud Engineer' - 2 days ago</p>
                            </div>
                        </div>
                    </div>
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