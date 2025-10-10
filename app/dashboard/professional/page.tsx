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
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold">Professional Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a summary of your activity on Hirefy.</p>
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
        
        <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="flex flex-row items-center gap-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                    <CardTitle>Complete Your Profile!</CardTitle>
                    <CardDescription className="text-destructive/80">Your profile is only 75% complete. A complete profile gets 3x more views.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button asChild variant="destructive">
                    <Link href="/dashboard/professional/profile">Update Profile Now</Link>
                </Button>
            </CardContent>
        </Card>

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
