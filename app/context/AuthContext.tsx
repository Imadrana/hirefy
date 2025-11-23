'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Auth, User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth as importedAuth, db as importedDb } from '@/lib/firebase/firebase';

// ===============================
// Types
// ===============================

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

export interface UserData {
  uid: string;
  email: string | null;
  role: 'client' | 'professional' | 'admin';
  profile?: ClientProfile | ProfessionalProfile;
  createdAt?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserData['role']) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: ClientProfile | ProfessionalProfile) => Promise<void>;
}

// ===============================
// Context
// ===============================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===============================
// AuthProvider
// ===============================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Client-only Firebase references
  const auth: Auth | null = typeof window !== 'undefined' ? importedAuth : null;
  const db: Firestore | null = typeof window !== 'undefined' ? importedDb : null;

  // -------------------------------
  // Login
  // -------------------------------
  const login = async (email: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase not initialized');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) throw new Error('User data not found');

    setUser(firebaseUser);
    setUserData(userDoc.data() as UserData);
  };

  // -------------------------------
  // Register
  // -------------------------------
  const register = async (email: string, password: string, role: UserData['role']) => {
    if (!auth || !db) throw new Error('Firebase not initialized');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUser: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

    setUser(firebaseUser);
    setUserData(newUser);
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  // -------------------------------
  // Update Profile
  // -------------------------------
  const updateUserProfile = async (profile: ClientProfile | ProfessionalProfile) => {
    if (!user || !db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'users', user.uid), { profile });
    setUserData(prev => (prev ? { ...prev, profile } : null));
  };

  // -------------------------------
  // Auth Listener (client-only)
  // -------------------------------
  useEffect(() => {
    if (!auth || !db) return;
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          setUserData(userDoc.exists() ? (userDoc.data() as UserData) : null);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  // -------------------------------
  // Context Value
  // -------------------------------
  const contextValue: AuthContextType = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// -------------------------------
// Custom Hook
// -------------------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
