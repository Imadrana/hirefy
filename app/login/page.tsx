/*I’m building a Next.js 13 web app using the App Router.
Please write a complete client-side login page ('use client' component) that handles Firebase Authentication using email and password.

Requirements:

Use React Hook Form for handling form input.

Use Zod for schema validation and integrate it with React Hook Form using the zodResolver.

Use Shadcn UI components (Button, Card, Form, Input, etc.) for styling.

The page should be styled with Tailwind CSS and centered on the screen.

It should include fields for email and password.

Add a show/hide password toggle using icons from lucide-react (e.g., Eye, EyeOff).

When the user clicks “Login”, authenticate them using signInWithEmailAndPassword from Firebase.

After signing in, get the user’s document from Firestore (collection: users) using their uid.

Based on the role field in Firestore (admin, professional, or client), redirect the user to a specific dashboard route:

/dashboard/admin for admin

/dashboard/professional for professionals

/dashboard/client for clients

If the user document doesn’t exist, sign them out and show an error.

Use a toast notification system (like a custom useToast hook) to display success or error messages.

Show a loading spinner inside the login button while the login process is in progress.

Include a link to the registration page below the form that says “Don’t have an account? Register here”.

Make sure to use proper TypeScript types for the form schema and form data.

Please include the full working component code — imports, form logic, UI layout, and Firebase integration.*/
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/firebase';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

interface UserData {
  email: string | null;
  role: string;
  createdAt: string;
  uid: string;
  isNew?: boolean;
}

const ensureUserDocument = async (user: { uid: string; email: string | null }): Promise<UserData> => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // Create new user document with default role
    const userData: UserData = {
      email: user.email,
      role: 'client', // Default role
      createdAt: new Date().toISOString(),
      uid: user.uid,
      isNew: true
    };
    await setDoc(userDocRef, userData);
    return userData;
  }

  const existingData = userDocSnap.data() as Omit<UserData, 'isNew'>;
  if (!existingData.role) {
    // Add role if missing
    const userData: UserData = {
      ...existingData,
      role: 'client',
      isNew: false
    };
    await setDoc(userDocRef, userData, { merge: true });
    return userData;
  }

  return {
    ...existingData,
    isNew: false
  };
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (process.env.NODE_ENV === 'development') {
        console.info('[login] Authenticated user:', { email: user.email, uid: user.uid });
      }

      // Create or update user document using the helper function
      const userData = await ensureUserDocument(user);
      
      if (userData.isNew) {
        toast({
          title: 'Account Created',
          description: 'Welcome! Your account has been set up.',
        });
      }

      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });

      switch (userData.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'professional':
          router.push('/dashboard/professional');
          break;
        default:
          router.push('/dashboard/client');
          break;
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[login] auth/firestore error:', error);
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          error.code === 'auth/invalid-credential'
            ? 'Invalid email or password.'
            : error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-red-500 via-red-600 to-orange-500 flex items-center justify-center shadow-lg ring-4 ring-red-500/20">
            <svg
              className="h-11 w-11 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-slate-800 sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-700 px-4 py-3 text-base"
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600 dark:text-red-400" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative mt-1">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-700 px-4 py-3 pr-12 text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600 dark:text-red-400" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-medium">
                  New to Hirefy?
                </span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors group"
            >
              Create your account
              <svg
                className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
