import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Briefcase, Users, DollarSign, Activity } from "lucide-react";
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


export default function ClientDashboard() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold">Client Dashboard</h1>
            <p className="text-muted-foreground">Here's an overview of your activity on Hirefy.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                title="Active Projects"
                value="3"
                description="Projects currently in progress."
            />
            <StatCard 
                icon={<FilePlus2 className="h-4 w-4 text-muted-foreground" />}
                title="Open Job Postings"
                value="1"
                description="Jobs awaiting proposals."
            />
             <StatCard 
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                title="Proposals Received"
                value="12"
                description="Total proposals this month."
            />
            <StatCard 
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                title="Total Spent"
                value="$4,250"
                description="Lifetime spending on projects."
            />
        </div>

        <Separator />
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Keep track of recent events and updates on your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium">New proposal for 'Website Redesign'.</p>
                                <p className="text-sm text-muted-foreground">From Alex D. - 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium">Milestone approved for 'Mobile App API'.</p>
                                <p className="text-sm text-muted-foreground">You paid $500 to Jane S. - 1 day ago</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium">New message regarding 'Database Migration'.</p>
                                <p className="text-sm text-muted-foreground">From Michael B. - 2 days ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle>Ready to start something new?</CardTitle>
                    <CardDescription>Get your next project off the ground in minutes.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button asChild size="lg">
                        <Link href="/dashboard/client/post-job">
                            <FilePlus2 className="mr-2 h-5 w-5"/>
                            Post a New Job
                        </Link>
                   </Button>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
