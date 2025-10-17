
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, MoreHorizontal, Eye, MessageSquare, CheckCircle, FileText } from "lucide-react"

const jobs = [
  {
    id: "PROJ001",
    title: "Mobile App API Integration",
    client: "Innovate Inc.",
    status: "Active",
    paymentStatus: "Funded",
  },
  {
    id: "PROJ002",
    title: "Database Migration from MySQL to PostgreSQL",
    client: "Tech Solutions Ltd.",
    status: "Completed",
    paymentStatus: "Paid",
  },
  {
    id: "PROJ003",
    title: "Senior React Developer for E-commerce Site",
    client: "Shopify Gurus",
    status: "Proposal Submitted",
    paymentStatus: "N/A",
  },
  {
    id: "PROJ004",
    title: "UI/UX Design for SaaS Dashboard",
    client: "CloudCo",
    status: "Invitation",
    paymentStatus: "N/A",
  },
  {
    id: "PROJ005",
    title: "Cloud Infrastructure Setup",
    client: "DataDriven Corp",
    status: "Active",
    paymentStatus: "Funded",
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  "Active": "default",
  "Completed": "outline",
  "Proposal Submitted": "secondary",
  "Invitation": "destructive",
};

const paymentStatusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  "Funded": "default",
  "Paid": "outline",
  "N/A": "secondary",
};


export default function ManageJobsPage() {
  return (
    <div className="space-y-8">
       <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-primary" /> My Jobs
            </h1>
            <p className="text-muted-foreground">Manage your proposals, invitations, and active projects.</p>
       </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead>Job Status</TableHead>
                <TableHead className="hidden md:table-cell">Payment Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{job.client}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[job.status] || "default"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Badge variant={paymentStatusVariant[job.paymentStatus] || "secondary"}>{job.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Eye className="mr-2"/> View Job Details
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                            <MessageSquare className="mr-2"/> Contact Client
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === 'Invitation' && (
                            <DropdownMenuItem className="text-primary focus:text-primary focus:bg-primary/10">
                                <FileText className="mr-2"/> Submit Proposal
                            </DropdownMenuItem>
                        )}
                         {job.status === 'Active' && (
                            <DropdownMenuItem className="text-green-600 focus:text-green-600 focus:bg-green-500/10">
                                <CheckCircle className="mr-2"/> Mark as Complete
                            </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
