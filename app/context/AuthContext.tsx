'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/firebase';

// Enhanced User Data Interface
export interface UserData {
  uid: string;
  email: string | null;
  role: 'client' | 'professional' | 'admin';
  profile?: ClientProfile | ProfessionalProfile;
  createdAt?: string;
}

// Profile Interfaces
export interface ClientProfile {
  companyName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessType?: string;
  companyDescription?: string;
}

export interface ProfessionalProfile {
  fullName?: string;
  title?: string;
  skills?: string[];
  hourlyRate?: number;
  bio?: string;
}

// Authentication Context Interface
interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserData['role']) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: ClientProfile | ProfessionalProfile) => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
});

// Authentication Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Login method
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data() as UserData);
      } else {
        // Handle case where user document doesn't exist
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register method
  const register = async (email: string, password: string, role: UserData['role']) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userData: UserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      setUser(firebaseUser);
      setUserData(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile method
  const updateUserProfile = async (profile: ClientProfile | ProfessionalProfile) => {
    if (!user) throw new Error('No authenticated user');

    try {
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.uid), { profile });
      
      // Update local state
      setUserData(prev => prev ? { ...prev, profile } : null);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          // Handle case where user document doesn't exist
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Provide context value
  const contextValue = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};