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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { auth, db } from '../lib/firebase/firebase';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

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
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        toast({
          title: 'Login Successful',
          description: `Welcome back! Redirecting to your dashboard...`,
        });

        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else if (role === 'professional') {
          router.push('/dashboard/professional');
        } else {
          router.push('/dashboard/client');
        }
      } else {
        await auth.signOut();
        throw new Error('User data not found in database.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.code === 'auth/invalid-credential' ? 'Invalid email or password.' : (error.message || 'An unexpected error occurred.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in-80">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome Back to Hirefy</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} autoComplete="current-password" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="underline text-primary hover:text-primary/80 transition-colors">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
