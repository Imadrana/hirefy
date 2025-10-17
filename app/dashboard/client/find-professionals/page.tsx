
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Star, MessageSquare, Search, SlidersHorizontal, User, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const professionals = [
  {
    id: "PROF001",
    name: "Alex Johnson",
    title: "Senior Full-Stack Developer",
    skills: ["React", "Node.js", "Firebase", "TypeScript", "Next.js"],
    rate: 95,
    rating: 4.9,
    reviews: 32,
    avatar: "https://placehold.co/100x100.png",
    bio: "10+ years of experience building scalable, high-performance web applications for enterprise clients.",
    location: "Calgary, AB"
  },
  {
    id: "PROF002",
    name: "Samantha Carter",
    title: "Mobile App Specialist (iOS & Android)",
    skills: ["Swift", "Kotlin", "React Native", "Firebase"],
    rate: 110,
    rating: 5.0,
    reviews: 25,
    avatar: "https://placehold.co/100x100.png",
    bio: "Passionate about creating intuitive and beautiful mobile experiences that solve real-world problems.",
    location: "Calgary, AB"
  },
  {
    id: "PROF003",
    name: "Michael Chen",
    title: "DevOps & Cloud Architect",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    rate: 125,
    rating: 4.8,
    reviews: 41,
    avatar: "https://placehold.co/100x100.png",
    bio: "Certified AWS architect specializing in infrastructure automation and scalable cloud solutions.",
    location: "Calgary, AB"
  },
  {
    id: "PROF004",
    name: "Emily Rodriguez",
    title: "UI/UX & Frontend Designer",
    skills: ["Figma", "React", "Tailwind CSS", "User Research"],
    rate: 80,
    rating: 4.9,
    reviews: 18,
    avatar: "https://placehold.co/100x100.png",
    bio: "Creating user-centric and visually stunning interfaces that drive engagement and conversion.",
    location: "Calgary, AB"
  },
  {
    id: "PROF005",
    name: "David Lee",
    title: "Data Scientist & Analyst",
    skills: ["Python", "SQL", "Tableau", "Machine Learning"],
    rate: 100,
    rating: 4.7,
    reviews: 22,
    avatar: "https://placehold.co/100x100.png",
    bio: "Turning complex datasets into actionable insights and predictive models to fuel business growth.",
    location: "Calgary, AB"
  }
];

const ProfessionalCard = ({ professional }: { professional: typeof professionals[0] }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start gap-4">
            <Image 
                src={professional.avatar}
                alt={professional.name}
                width={80}
                height={80}
                data-ai-hint="professional headshot"
                className="rounded-full border-2 border-primary/50"
            />
            <div className="flex-grow">
                <CardTitle className="text-xl font-bold">{professional.name}</CardTitle>
                <CardDescription className="font-medium text-primary">{professional.title}</CardDescription>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{professional.rating}</span>
                    <span>({professional.reviews} reviews)</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-4">{professional.bio}</p>
            <div className="flex flex-wrap gap-2">
                {professional.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
            </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
             <div className="text-lg font-bold">
                ${professional.rate}<span className="text-sm font-normal text-muted-foreground">/hr</span>
             </div>
             <div className="flex gap-2">
                <Button variant="ghost" size="sm"><Send className="mr-2"/>Message</Button>
                <Button asChild size="sm">
                    <Link href="#">
                        <User className="mr-2"/>View Profile
                    </Link>
                </Button>
             </div>
        </CardFooter>
    </Card>
)

export default function FindProfessionalsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('all');

    const allSkills = [...new Set(professionals.flatMap(p => p.skills))];

    const filteredProfessionals = professionals.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const skillMatch = skillFilter === 'all' || p.skills.includes(skillFilter);
        return nameMatch && skillMatch;
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <Search className="h-8 w-8 text-primary" /> Find Professionals
                </h1>
                <p className="text-muted-foreground">Browse and connect with top IT talent in Calgary.</p>
            </div>
            
            <Card>
                <CardContent className="p-4">
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Search by name..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                         <div className="relative">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.map(prof => (
                        <ProfessionalCard key={prof.id} professional={prof} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground col-span-full py-12">
                        <p className="font-semibold">No professionals found.</p>
                        <p className="text-sm">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

    