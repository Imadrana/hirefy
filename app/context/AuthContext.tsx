'use client';

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, authProviders } from '@/lib/firebase/firebase';

// User and Profile Interfaces
export interface UserData {
  uid: string;
  email: string | null;
  role: 'client' | 'professional' | 'admin';
  profile?: ClientProfile | ProfessionalProfile;
  createdAt?: string;
}

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

// Define the context type
interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserData['role']) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: ClientProfile | ProfessionalProfile) => Promise<void>;
  signInWithGoogle: (role?: 'client' | 'professional') => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Login method
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data() as UserData);
        setUser(firebaseUser);
      } else {
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

  // Google Sign-In method
  const signInWithGoogle = async (role?: 'client' | 'professional') => {
    try {
      const result = await signInWithPopup(auth, authProviders.google);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      // If user doesn't exist, create a new user document
      if (!userDocSnap.exists()) {
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: role || 'client', // Default to client if no role specified
          createdAt: new Date().toISOString(),
          profile: {
            fullName: firebaseUser.displayName || ''
          }
        };

        await setDoc(userDocRef, newUserData);
        setUserData(newUserData);
      } else {
        // User exists, get their existing data
        const existingUserData = userDocSnap.data() as UserData;
        setUserData(existingUserData);
      }

      setUser(firebaseUser);
    } catch (error) {
      console.error('Google Sign-In error:', error);
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
      await updateDoc(doc(db, 'users', user.uid), { profile });
      
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
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
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
  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
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