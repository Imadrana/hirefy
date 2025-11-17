// ---------------------------------------------
// Developer Reference Notes
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar, Anandjit Kaur
// File: app/find-jobs/page.tsx
//
// Description:
// - Client-facing page where professionals can browse and filter open jobs.
// - Uses Firebase Firestore to load jobs in real time and enrich them with client info.
// - Supports text search on job titles and a simple skill filter dropdown.
// - Allows professionals to open a dialog and submit a proposal directly from a job card.
//
// Development Process & Key Learnings:
// - Practiced reading Firestore collections with onSnapshot and then sorting in memory by createdAt.
// - Implemented defensive checks when reading timestamp and client profile fields from Firestore.
// - Refined the job card layout using shadcn/ui Card, Badge, Button, Avatar, and responsive grid utilities.
// - Used React state hooks to manage searchTerm, skillFilter, dialog visibility, and proposal form fields.
// - Added basic validation in the submit handler to prevent empty proposals or invalid numeric rates.
//
// References & Resources Used:
// • Next.js App Router & Client Components: https://nextjs.org/docs/app/building-your-application/routing  
// • Firebase Firestore (realtime listeners & collections): https://firebase.google.com/docs/firestore/query-data/listen  
// • shadcn/ui Component Library (Card, Badge, Button, Dialog, Input, Textarea, Avatar): https://ui.shadcn.com  
// • Lucide React Icons (Search, Tag, DollarSign, Clock, FileText, Loader2): https://lucide.dev/icons  
// • TailwindCSS utility classes & responsive grid: https://tailwindcss.com/docs  
// ---------------------------------------------
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Tag, DollarSign, Clock, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  category: string;
  location: string;
  clientId: string;
  clientEmail: string;
  status: string;
  createdAt: any;
  clientName?: string;
  clientAvatar?: string;
}

// Helper function to calculate time ago
const getTimeAgo = (timestamp: any): string => {
  if (!timestamp) return 'Recently';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};

interface JobCardProps {
  job: Job;
  onSubmitProposal: (job: Job) => void;
}

const JobCard = ({ job, onSubmitProposal }: JobCardProps) => (
  <Card className="flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
        <Badge variant="outline">Posted {getTimeAgo(job.createdAt)}</Badge>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={job.clientAvatar} alt={job.clientName || job.clientEmail} />
          <AvatarFallback>{(job.clientName || job.clientEmail || 'C').substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardDescription className="font-medium text-foreground">
          {job.clientName || job.clientEmail}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.map((skill: string) => (
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
      <Button variant="outline" onClick={() => onSubmitProposal(job)}>
        View Details
      </Button>
      <Button onClick={() => onSubmitProposal(job)}>
        <FileText className="mr-2" />Submit Proposal
      </Button>
    </CardFooter>
  </Card>
);

export default function FindJobsPage() {
  // ... rest of your code stays exactly the same
