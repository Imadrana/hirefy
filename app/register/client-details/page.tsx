// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/register/client-details File: page.tsx 
//
// Description:
// - Front-end React (TypeScript/Next.js) page for the Hirefy Client Profile form  
// - Uses React Hook Form with Zod validation for client onboarding  
// - Validates company information and saves data to Firebase Firestore  
// - Shows toast notifications for success or errors and redirects upon completion  
// - Guards unauthorized users and manages loading and routing states  
//
// Technical Understanding & Research Summary:
// - Researched through:  
//   • Google search results on React Hook Form, Zod, and Firebase integration  
//   • Official React documentation: https://react.dev  
//   • Next.js documentation: https://nextjs.org/docs  
//   • Firebase Firestore documentation: https://firebase.google.com/docs/firestore  
//   • YouTube tutorials on React Hook Form, Zod validation, and Firestore data handling  
//     - https://www.youtube.com/watch?v=cc_xmawJ8Kg 
//     - https://www.youtube.com/watch?v=awd_oYcmrRA 
// - Combined RHF, Zod, Firebase, and shadcn/ui components for a modern, secure, and scalable client profile workflow  
// - Final code refined and documented with ChatGPT assistance for clarity and maintainability. 
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
// I gave ChatGPT the following prompt to help me write and understand
// this component clearly:
//
// "I want you to create a client-side Next.js (TypeScript/React) page for my Hirefy web app
// that uses React Hook Form with Zod validation and Firebase Firestore to collect and save
// client profile details. It should include authentication checks, toast notifications,
// loading states, and a clean, modern UI built with shadcn/ui and Tailwind CSS."
// -------------------------------
//  Summary:
// - Language: TypeScript / TSX (React / Next.js)
// - Side: Frontend Component (Client-side)
// - Libraries Used: react-hook-form, zod, firebase/firestore, next/navigation, shadcn/ui, lucide-react  
// - Purpose: To collect, validate, and persist client business details securely in Firestore,
//   while managing authentication, feedback, and navigation in the Hirefy onboarding flow.
// -------------------------------

'use client'; // Next.js directive: this component renders on the client (enables hooks and browser APIs)

import { useState, useEffect } from 'react'; // React hooks for local state and lifecycle
import { useRouter } from 'next/navigation'; // Next.js router for programmatic navigation (router.push)
import { doc, setDoc } from 'firebase/firestore'; // Firestore helpers: get a doc ref and write/merge data
import { useForm } from 'react-hook-form'; // Form state/validation management
import { zodResolver } from '@hookform/resolvers/zod'; // Connects Zod schema validation into react-hook-form
import * as z from 'zod'; // Zod: runtime schema validation + TS inference
import { Button } from '@/components/ui/button'; // UI Button (design system)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Card UI primitives
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // RHF-aware form UI
import { Input } from '@/components/ui/input'; // Styled input
import { Textarea } from '@/components/ui/textarea'; // Styled textarea
import { useToast } from '@/hooks/use-toast'; // Toast notification hook
import { db } from '@/lib/firebase/firebase'; // Initialized Firebase Firestore instance
import { Loader2 } from 'lucide-react'; // Icon used for loading spinner
import { useAuth } from '@/context/AuthContext'; // Custom auth context exposing { user, loading }

// Zod schema defining/validating the client profile fields.
// - Includes Canadian postal code regex and sensible min/max constraints.
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
  const router = useRouter(); // Used to redirect (e.g., to /login or dashboard)
  const { toast } = useToast(); // Toast for success/error feedback
  const { user, loading: authLoading } = useAuth(); // Auth state from context
  const [loading, setLoading] = useState(false); // Local submission/loading state for the submit button

  // Guard route: if auth is done loading and there is no user, notify and redirect to login.
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

  // Initialize react-hook-form:
  // - resolver: runs Zod validation on submit (and onChange/onBlur depending on RHF settings)
  // - defaultValues: initial empty values for all fields
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

  // Submit handler:
  // 1) Ensure user exists
  // 2) Write the profile into Firestore under users/{uid}, merging with existing doc
  // 3) Show success toast and redirect to client dashboard
  // 4) Handle and toast errors; always clear loading state
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'No user is signed in.' });
      return;
    }
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid); // Build a reference to users/{uid}
      await setDoc(userDocRef, {
        profile: {
          ...values,
          isComplete: true, // Flag that the profile has been completed
        }
      }, { merge: true }); // Merge so we don't overwrite other user fields

      toast({
        title: 'Profile Complete!',
        description: "Welcome to Hirefy! We're redirecting you to your dashboard.",
      });
      router.push('/dashboard/client'); // Navigate to the client dashboard after success

    } catch (error: any) {
      // Surface Firestore/write errors to the user
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false); // Always stop loading regardless of success/failure
    }
  };
  
  // While auth is resolving, show a centered spinner to avoid flicker/false redirects.
  if (authLoading) {
      return (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  // Main UI card containing the form.
  // Uses shadcn/ui components for consistent styling and accessibility.
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg animate-in fade-in-80">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Tell Us About Your Business</CardTitle> {/* Form title */}
          <CardDescription>Complete your client profile to start posting jobs.</CardDescription> {/* Helper text */}
        </CardHeader>
        <CardContent>
          {/* RHF Form provider to pass form methods/context to children */}
          <Form {...form}>
            {/* Native form: handleSubmit runs Zod validation, then calls onSubmit with valid values */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Inc." {...field} /> {/* Binds value/onChange via {...field} */}
                    </FormControl>
                    <FormMessage /> {/* Displays validation error for this field */}
                  </FormItem>
                )}
              />

              {/* Address + City row (2 columns on md+) */}
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

              {/* Province + Postal Code row (2 columns on md+) */}
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
                        <Input placeholder="T2P 1J9" {...field} /> {/* Canadian postal code format */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Business Type */}
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

              {/* Company Description */}
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
              
              {/* Submit button:
                 - Disabled while loading or while auth is still resolving
                 - Shows spinner when submitting
                 - On success, Firestore is updated and user is redirected */}
              <Button type="submit" className="w-full font-bold" disabled={loading || authLoading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {/* Visual feedback during submission */}
                Complete Profile & Go to Dashboard
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
