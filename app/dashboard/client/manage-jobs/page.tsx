/*"Create a Next.js + TypeScript + Tailwind + Shadcn UI component called ManageJobsPage.
The component should display a list of job postings inside a card with a responsive table.
Each row must include: job title, date posted, job status (with colored badge variants), number of proposals, and an actions dropdown (View, Edit, Close Posting).
Use Shadcn components: Card, Table, Badge, Button, DropdownMenu.
Use lucide-react icons: Briefcase, MoreHorizontal, Eye, Edit, Archive, FilePlus2.
Include a header with a title, a subtitle, and a primary “Post New Job” button linking to /dashboard/client/post-job.
Status badges should map to variants: Open = default, In Progress = secondary, Completed = outline, Closed = destructive.
Use Tailwind classes for spacing and layout. Maintain the same structure and styling as a professional dashboard page.*/
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
import { Briefcase, MoreHorizontal, Eye, Edit, Trash2, Archive, FilePlus2 } from "lucide-react"
import Link from "next/link"

const jobs = [
  {
    id: "JOB001",
    title: "Senior React Developer for E-commerce Site",
    datePosted: "2024-07-15",
    status: "Open",
    proposals: 8,
  },
  {
    id: "JOB002",
    title: "Mobile App API Integration",
    datePosted: "2024-07-10",
    status: "In Progress",
    proposals: 5,
  },
  {
    id: "JOB003",
    title: "Database Migration from MySQL to PostgreSQL",
    datePosted: "2024-06-28",
    status: "Completed",
    proposals: 12,
  },
  {
    id: "JOB004",
    title: "UI/UX Design for SaaS Dashboard",
    datePosted: "2024-07-18",
    status: "Open",
    proposals: 2,
  },
    {
    id: "JOB005",
    title: "Firebase Cloud Functions Specialist",
    datePosted: "2024-06-15",
    status: "Closed",
    proposals: 7,
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  "Open": "default",
  "In Progress": "secondary",
  "Completed": "outline",
  "Closed": "destructive",
};

export default function ManageJobsPage() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <Briefcase className="h-8 w-8 text-primary" /> Manage Job Postings
                </h1>
                <p className="text-muted-foreground">View, edit, or close your active and past job postings.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/client/post-job">
                    <FilePlus2 className="mr-2" />
                    Post New Job
                </Link>
            </Button>
       </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead className="hidden md:table-cell">Date Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Proposals</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{job.datePosted}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[job.status] || "default"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{job.proposals}</TableCell>
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
                            <Eye className="mr-2"/> View Posting
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                            <Edit className="mr-2"/> Edit Posting
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Archive className="mr-2"/> Close Posting
                        </DropdownMenuItem>
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
