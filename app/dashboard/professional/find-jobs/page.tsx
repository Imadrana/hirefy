'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Briefcase, DollarSign, Search, SlidersHorizontal, Tag, Clock, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const jobs = [
  {
    id: "JOB001",
    title: "Senior React Developer for E-commerce Site",
    clientName: "Shopify Gurus",
    clientAvatar: "https://placehold.co/100x100.png",
    description: "We are seeking an experienced React developer to lead the frontend development of our new e-commerce platform. You will be responsible for building a performant, responsive, and scalable user interface.",
    skills: ["React", "TypeScript", "Next.js", "Redux"],
    budget: 8000,
    duration: "1-3 months",
    datePosted: "2 days ago",
  },
  {
    id: "JOB002",
    title: "Mobile App API Integration",
    clientName: "Innovate Inc.",
    clientAvatar: "https://placehold.co/100x100.png",
    description: "Looking for a backend specialist to integrate several third-party APIs into our existing mobile application. Must have strong experience with Node.js and RESTful services.",
    skills: ["Node.js", "API Integration", "Firebase", "REST"],
    budget: 5000,
    duration: "2-4 weeks",
    datePosted: "5 days ago",
  },
    {
    id: "JOB003",
    title: "UI/UX Design for SaaS Dashboard",
    clientName: "CloudCo",
    clientAvatar: "https://placehold.co/100x100.png",
    description: "We need a talented UI/UX designer to create a modern and intuitive interface for our SaaS product dashboard. Must provide a portfolio of previous work.",
    skills: ["Figma", "UI/UX Design", "User Research"],
    budget: 4500,
    duration: "1-2 weeks",
    datePosted: "1 day ago",
  },
  {
    id: "JOB004",
    title: "Database Migration from MySQL to PostgreSQL",
    clientName: "Tech Solutions Ltd.",
    clientAvatar: "https://placehold.co/100x100.png",
    description: "Seeking a database administrator to manage and execute a full migration of our production database from MySQL to PostgreSQL. Experience with large datasets is crucial.",
    skills: ["PostgreSQL", "MySQL", "Database Migration", "DBA"],
    budget: 6000,
    duration: "2-4 weeks",
    datePosted: "1 week ago",
  }
];

const JobCard = ({ job }: { job: typeof jobs[0] }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                <Badge variant="outline">Posted {job.datePosted}</Badge>
            </div>
            <div className="flex items-center gap-2 pt-2">
                 <Avatar className="h-8 w-8 border">
                    <AvatarImage src={job.clientAvatar} alt={job.clientName} data-ai-hint="company logo" />
                    <AvatarFallback>{job.clientName.substring(0,1)}</AvatarFallback>
                </Avatar>
                <CardDescription className="font-medium text-foreground">{job.clientName}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
            </div>
             <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>${job.budget} Budget</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{job.duration}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="#">
                    View Details
                </Link>
            </Button>
            <Button asChild>
                <Link href="#">
                    <FileText className="mr-2" />
                    Submit Proposal
                </Link>
            </Button>
        </CardFooter>
    </Card>
)

export default function FindJobsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('all');

    const allSkills = [...new Set(jobs.flatMap(p => p.skills))];

    const filteredJobs = jobs.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const skillMatch = skillFilter === 'all' || p.skills.includes(skillFilter);
        return titleMatch && skillMatch;
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <Search className="h-8 w-8 text-primary" /> Find Job Opportunities
                </h1>
                <p className="text-muted-foreground">Browse and apply for jobs posted by clients across Calgary.</p>
            </div>
            
            <Card>
                <CardContent className="p-4">
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Search by job title..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                         <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Select value={skillFilter} onValueChange={setSkillFilter}>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Filter by skill" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Skills</SelectItem>
                                    {allSkills.map(skill => (
                                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                     </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground col-span-full py-12">
                        <p className="font-semibold">No jobs found.</p>
                        <p className="text-sm">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}