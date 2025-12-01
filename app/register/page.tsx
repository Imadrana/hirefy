'use client';

/// ChatGPT Prompt Used
//prompt use to make the register page.tsx 
//Create a Next.js registration page using React and Firebase that allows users to sign up with email and password. Use react-hook-form with Zod validation for the form. The form should include:

//- Email input (must be valid email)
//- Password input (minimum 6 characters) with a show/hide toggle
//- Role selection as radio buttons: "client" or "professional"

//After successful registration:
//- Store user info (uid, email, role, createdAt) in Firestore
//- Redirect clients to "/register/client-details"
//- Redirect professionals to "/dashboard/professional"

Include:
//- Tailwind CSS styled components inside a centered card
//- Toast notifications for success or errors
//- Loading indicator on the submit button
//- A link to the login page if the user already has an account

//Use lucide-react icons for the password toggle and loader. Generate a complete functional React component file.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/firebase';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['client', 'professional'], {
    message: 'You need to select a role.',
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
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
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: values.role,
        createdAt: new Date().toISOString(),
        authProvider: 'email',
      });

      toast({
        title: 'Account Created',
        description: "Let's set up your profile.",
      });
      
      if (values.role === 'client') {
        router.push('/register/client-details');
      } else if (values.role === 'professional') {
        router.push('/register/professional-details');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : (error.message || 'An unexpected error occurred.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const selectedRole = form.getValues('role');
      
      if (!selectedRole) {
        toast({
          variant: 'destructive',
          title: 'Role Required',
          description: 'Please select your role before signing up with Google.',
        });
        return;
      }

      if (selectedRole !== 'client' && selectedRole !== 'professional') {
        toast({
          variant: 'destructive',
          title: 'Invalid Role',
          description: 'Please select either Client or Professional role.',
        });
        return;
      }

      await signInWithGoogle(selectedRole);
    } catch (error) {
      console.error('Google sign-up error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: 'An error occurred during Google sign-up. Please try again.',
      });
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join Calgary's #1 IT talent marketplace
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-slate-800 sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      I am a...
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="mt-2 space-y-3"
                      >
                        <label
                          htmlFor="client"
                          className="relative flex cursor-pointer rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm focus:outline-none hover:border-red-500 dark:hover:border-red-500 transition-colors has-[:checked]:border-red-500 has-[:checked]:ring-2 has-[:checked]:ring-red-500"
                        >
                          <RadioGroupItem value="client" id="client" className="mt-0.5" />
                          <span className="ml-3 flex flex-col">
                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                              Client
                            </span>
                            <span className="block text-sm text-gray-500 dark:text-gray-400">
                              Looking to hire for a project
                            </span>
                          </span>
                        </label>
                        <label
                          htmlFor="professional"
                          className="relative flex cursor-pointer rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm focus:outline-none hover:border-red-500 dark:hover:border-red-500 transition-colors has-[:checked]:border-red-500 has-[:checked]:ring-2 has-[:checked]:ring-red-500"
                        >
                          <RadioGroupItem value="professional" id="professional" className="mt-0.5" />
                          <span className="ml-3 flex flex-col">
                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                              IT Professional
                            </span>
                            <span className="block text-sm text-gray-500 dark:text-gray-400">
                              Looking for work opportunities
                            </span>
                          </span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600 dark:text-red-400" />
                  </FormItem>
                )}
              />
              
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
                          autoComplete="new-password"
                          placeholder="••••••••"
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
                  disabled={loading || googleLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
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
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors group"
            >
              Already have an account? Sign in
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
