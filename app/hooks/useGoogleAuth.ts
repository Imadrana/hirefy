// app/hooks/useGoogleAuth.ts
// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/hooks   File: useGoogleAuth.ts
//
// Description:
// - Custom React hook for Google Authentication with Firebase
// - Handles Google sign-in, user creation in Firestore, and role-based routing
// - Includes error handling and toast notifications
//
// Technical Understanding & Research Summary:
// - Firebase Google Auth: https://firebase.google.com/docs/auth/web/google-signin
// - signInWithPopup for desktop/web flow
// - Firestore integration for user profile storage
// -------------------------------

// app/hooks/useGoogleAuth.ts
// app/hooks/useGoogleAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase/firebase';
import { useToast } from '@/hooks/use-toast';

export const useGoogleAuth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async (defaultRole?: 'client' | 'professional') => {
    setLoading(true);
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        toast({
          title: 'Welcome Back!',
          description: `Signed in as ${user.email}`,
        });

        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else if (role === 'professional') {
          router.push('/dashboard/professional');
        } else if (role === 'client') {
          router.push('/dashboard/client');
        } else {
          router.push('/');
        }
      } else {
        if (!defaultRole) {
          toast({
            variant: 'destructive',
            title: 'Role Required',
            description: 'Please select your role before signing in with Google.',
          });
          await auth.signOut();
          setLoading(false);
          return;
        }

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: defaultRole,
          createdAt: new Date().toISOString(),
          authProvider: 'google',
        });

        toast({
          title: 'Account Created',
          description: "Let's set up your profile.",
        });

        if (defaultRole === 'client') {
          router.push('/register/client-details');
        } else if (defaultRole === 'professional') {
          router.push('/dashboard/professional');
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: 'Sign-in Cancelled',
          description: 'You closed the sign-in window.',
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast({
          variant: 'destructive',
          title: 'Popup Blocked',
          description: 'Please enable popups for this site to sign in with Google.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign-in Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};