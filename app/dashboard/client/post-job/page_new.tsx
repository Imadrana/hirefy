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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';

const jobSchema = z.object({
  title: z.string()
    .min(5, { message: 'Job title must be at least 5 characters.' })
    .max(100, { message: 'Job title cannot exceed 100 characters.' }),
  description: z.string()
    .min(50, { message: 'Description must be at least 50 characters.' })
    .max(2000, { message: 'Description cannot exceed 2000 characters.' }),
  skills: z.string()
    .min(2, { message: 'Please list at least one skill.' }),
  budget: z.string()
    .min(1, { message: 'Budget is required.' })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 50, {
      message: 'Budget must be at least $50.',
    }),
  duration: z.string()
    .min(1, { message: 'Please enter project duration.' }),
  category: z.string()
    .min(1, { message: 'Please select a job category.' }),
  location: z.enum(['remote', 'onsite', 'hybrid'], {
    message: 'Please select a work location type.',
  }),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const { toast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && (!user || userData?.role !== 'client')) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only clients can post jobs.',
      });
      router.push('/dashboard/client');
    }
  }, [user, userData, authLoading, router, toast]);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      budget: '',
      duration: '',
      category: '',
      location: 'remote',
    },
  });

  const onSubmit = async (values: JobFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to post a job.',
      });
      return;
    }

    setLoading(true);
    try {
      // Convert budget to number
      const budgetNumber = Number(values.budget);

      // Convert skills string to array
      const skillsArray = values.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const jobData = {
        title: values.title,
        description: values.description,
        skills: skillsArray,
        budget: budgetNumber,
        duration: values.duration,
        category: values.category,
        location: values.location,
        clientId: user.uid,
        clientEmail: user.email,
        status: 'open',
        applicants: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'jobs'), jobData);

      toast({
        title: 'Success!',
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your job has been posted successfully!</span>
          </div>
        ),
      });

      // Reset form and redirect to manage jobs page
      form.reset();
      setTimeout(() => {
        router.push('/dashboard/client/manage-jobs');
      }, 1500);

    } catch (error: any) {
      console.error('Error posting job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not post job. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <FilePlus2 className="h-8 w-8 text-primary" />
            Post a New Job
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to post your job listing
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/client')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide detailed information about the position you're hiring for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Job Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior React Developer"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your job posting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category & Location Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <option value="web-development">Web Development</option>
                          <option value="mobile-development">Mobile Development</option>
                          <option value="software-engineering">Software Engineering</option>
                          <option value="devops">DevOps</option>
                          <option value="data-science">Data Science</option>
                          <option value="cybersecurity">Cybersecurity</option>
                          <option value="ui-ux-design">UI/UX Design</option>
                          <option value="cloud-computing">Cloud Computing</option>
                          <option value="it-support">IT Support</option>
                          <option value="other">Other</option>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Location *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <option value="remote">Remote</option>
                          <option value="onsite">On-site</option>
                          <option value="hybrid">Hybrid</option>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Job Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the project, responsibilities, requirements..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0} / 2000 characters (minimum 50)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skills */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., React, TypeScript, Node.js, AWS"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate skills with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget & Duration Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (CAD) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="5000"
                            className="pl-7"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Project budget in Canadian dollars
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Duration *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1-3 months, 6 weeks"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Estimated time to complete
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={loading}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
