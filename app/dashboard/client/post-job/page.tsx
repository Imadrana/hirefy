// ---------------------------------------------
// Developer Reference Notes (Revision 2)
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// File: app/manage-jobs/page.tsx
//
// High-Level Purpose:
// - Shows all jobs where the professional has already been hired (accepted proposals).
// - Acts as a “My Jobs” dashboard so users can quickly review job details and their proposal.
//
// Key Implementation Details:
// - Listens to the `proposals` collection in Firestore filtered by the current professional’s UID.
// - Filters the snapshot client-side to only keep proposals with `status === "accepted"`.
// - For each accepted proposal, loads extra job info from `jobs/{jobId}` and client info from `users/{clientId}`.
// - Combines proposal + job + client data into a single `AcceptedJob` object stored in local state.
// - Sorts jobs by `acceptedAt` (or createdAt fallback) so the most recent accepted work shows first.
// - Uses a small `getTimeAgo` helper to display “Accepted X days/weeks ago” text.
//
// UI / UX Notes:
// - Cards show job title, client, short description, a few skills, your accepted rate, and duration.
// - A badge highlights the “Accepted” status, and a “View Details” button opens a dialog.
// - The dialog summarizes budget, your rate, duration, skills, and the original cover letter you sent.
// - Loading and empty states are handled to make the page feel complete even with no jobs yet.
//
// References & Resources Used:
// • Firestore queries and snapshots: https://firebase.google.com/docs/firestore/query-data/queries  
// • Firestore document lookups (getDoc / doc): https://firebase.google.com/docs/firestore/query-data/get-data  
// • shadcn/ui components (Card, Badge, Button, Dialog): https://ui.shadcn.com  
// • Lucide React icons used here (Briefcase, Loader2, Eye, DollarSign, Clock, User, FileText): https://lucide.dev/icons  
// • TailwindCSS flex/grid layout patterns: https://tailwindcss.com/docs  
// ---------------------------------------------
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus2, DollarSign, Tag, Clock } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const jobSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters.'),
  description: z.string().min(50, 'Description must be at least 50 characters.'),
  skills: z.string().min(2, 'Please list at least one skill.'),
  budget: z.coerce.number().min(5, 'Budget must be at least $5.'),
  duration: z.string().min(1, "Please select a project duration."),
});

export default function PostJobPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      budget: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof jobSchema>) => {
    setLoading(true);
    console.log('Job posting submitted:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    toast({
      title: 'Job Posted Successfully!',
      description: 'Your job is now live and professionals can submit proposals.',
    });
    form.reset();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <FilePlus2 className="h-8 w-8 text-primary" /> Post a New Job
        </h1>
        <p className="text-muted-foreground">Fill out the details below to find the perfect IT professional for your project.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior React Developer for E-commerce Site" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the project, responsibilities, and deliverables..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                     <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                            <Input placeholder="e.g., React, Next.js, TypeScript, Firebase" {...field} className="pl-10" />
                        </FormControl>
                     </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (CAD)</FormLabel>
                       <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                            <Input type="number" placeholder="1000" {...field} className="pl-10" />
                        </FormControl>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Project Duration</FormLabel>
                        <div className="relative">
                             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select estimated duration" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Less than 1 week">Less than 1 week</SelectItem>
                                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                                <SelectItem value="1-3 months">1-3 months</SelectItem>
                                <SelectItem value="3-6 months">3-6 months</SelectItem>
                                <SelectItem value="More than 6 months">More than 6 months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto font-bold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Job
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
