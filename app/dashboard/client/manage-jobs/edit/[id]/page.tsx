'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';

const jobSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters.').max(100, 'Job title cannot exceed 100 characters.'),
  description: z.string().min(50, 'Description must be at least 50 characters.').max(2000, 'Description cannot exceed 2000 characters.'),
  skills: z.string().min(2, 'Please list at least one skill.'),
  budget: z.number().min(50, 'Budget must be at least $50.').max(1000000, 'Budget cannot exceed $1,000,000.'),
  duration: z.string().min(1, 'Please select a project duration.'),
  category: z.string().min(1, 'Please select a job category.'),
  location: z.enum(['remote', 'onsite', 'hybrid']),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function EditJobPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [jobNotFound, setJobNotFound] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      budget: 0,
      duration: '',
      category: '',
      location: 'remote',
    },
  });

  useEffect(() => {
    if (!db || !user || !jobId) return;

    const fetchJob = async () => {
      setFetching(true);
      try {
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setJobNotFound(true);
          toast({
            variant: 'destructive',
            title: 'Job Not Found',
            description: 'The job you are trying to edit does not exist.',
          });
          return;
        }

        const jobData = jobSnap.data();

        // Check if user owns this job
        if (jobData.clientId !== user.uid) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have permission to edit this job.',
          });
          router.push('/dashboard/client/manage-jobs');
          return;
        }

        // Check if job is closed
        if (jobData.status === 'closed') {
          toast({
            variant: 'destructive',
            title: 'Cannot Edit',
            description: 'Closed jobs cannot be edited.',
          });
          router.push('/dashboard/client/manage-jobs');
          return;
        }

        // Populate form with existing data
        form.reset({
          title: jobData.title || '',
          description: jobData.description || '',
          skills: Array.isArray(jobData.skills) ? jobData.skills.join(', ') : '',
          budget: jobData.budget || 0,
          duration: jobData.duration || '',
          category: jobData.category || '',
          location: jobData.location || 'remote',
        });
      } catch (error: any) {
        console.error('Error fetching job:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to fetch job details.',
        });
        setJobNotFound(true);
      } finally {
        setFetching(false);
      }
    };

    fetchJob();
  }, [db, user, jobId, form, toast, router]);

  const onSubmit = async (values: JobFormValues) => {
    if (!user || !jobId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update a job.',
      });
      return;
    }

    setLoading(true);
    try {
      // Convert skills string to array
      const skillsArray = values.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        title: values.title,
        description: values.description,
        skills: skillsArray,
        budget: values.budget,
        duration: values.duration,
        category: values.category,
        location: values.location,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: 'Success!',
        description: 'Job has been updated successfully!',
      });

      setTimeout(() => {
        router.push('/dashboard/client/manage-jobs');
      }, 1000);

    } catch (error: any) {
      console.error('Error updating job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not update job. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (jobNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] space-y-4">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="text-muted-foreground">The job you are looking for does not exist or has been deleted.</p>
        <Button asChild>
          <Link href="/dashboard/client/manage-jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Jobs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <Pencil className="h-8 w-8 text-primary" /> Edit Job
          </h1>
          <p className="text-muted-foreground mt-2">Update your job posting details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client/manage-jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Make changes to your job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Senior React Developer" />
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
                      <Textarea 
                        {...field} 
                        placeholder="Describe the job responsibilities, requirements, and expectations..."
                        rows={8}
                      />
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
                    <FormControl>
                      <Input {...field} placeholder="React, TypeScript, Node.js" />
                    </FormControl>
                    <FormDescription>Separate skills with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="50"
                        step="1"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                        placeholder="1000"
                      />
                    </FormControl>
                    <FormDescription>Minimum budget is $50</FormDescription>
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
                    <FormControl>
                      <Input {...field} placeholder="1-3 months" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Blockchain">Blockchain</SelectItem>
                        <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                    <FormLabel>Work Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/client/manage-jobs')} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
