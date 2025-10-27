'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      
      toast({
        title: 'Sign In Successful',
        description: 'You have been signed in with Google',
        variant: 'default'
      });

      // Redirect to appropriate dashboard or profile completion
      router.push('/dashboard/client');
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: error.message || 'An error occurred during sign-in',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGoogleSignIn} 
      disabled={loading}
      variant="outline"
      className="w-full"
    >
      {loading ? (
        'Signing in...'
      ) : (
        <>
          <span className="mr-2 inline-flex">
            <FcGoogle size={20} />
          </span>
          Sign in with Google
        </>
      )}
    </Button>
  );
}