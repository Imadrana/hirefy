'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/firebase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  address: z.string().min(5, { message: 'Please enter a valid address.' }),
  city: z.string().min(2, { message: 'Please enter a valid city.' }),
  province: z.string().min(2, { message: 'Please enter a valid province.' }),
  postalCode: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, { message: 'Please enter a valid Canadian postal code.' }),
  businessType: z.string().min(2, { message: 'Please specify your business type.' }),
  companyDescription: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(500, { message: 'Description cannot exceed 500 characters.' }),
});

export default function ClientDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You must be logged in to complete your profile.',
      });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      businessType: '',
      companyDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'No user is signed in.' });
      return;
    }
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profile: {
          ...values,
          isComplete: true,
        }
      }, { merge: true });

      toast({
        title: 'Profile Complete!',
        description: "Welcome to Hirefy! We're redirecting you to your dashboard.",
      });
      router.push('/dashboard/client');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
      return (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg animate-in fade-in-80">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Tell Us About Your Business</CardTitle>
          <CardDescription>Complete your client profile to start posting jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Calgary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Alberta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="T2P 1J9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Business</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tech Startup, Retail, Non-profit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Briefly describe what your company does." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full font-bold" disabled={loading || authLoading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Profile & Go to Dashboard
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}