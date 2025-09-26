'use client';

import type { User } from 'firebase/auth';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
// import { auth, db } from '@/lib/firebase/firebase';

export interface UserData {
  uid: string;
  email: string | null;
  role: 'client' | 'professional' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SIMULATE A LOGGED-IN PROFESSIONAL USER
    setLoading(true);
    const mockUser = {
      uid: 'mock-professional-uid',
      email: 'professional@hirefy.ca',
      //uid: 'mock-client-uid',
      //email: 'client@company.com',
    } as User;
    const mockUserData = {
      uid: 'mock-professional-uid',
      email: 'professional@hirefy.ca',
      role: 'professional' as const,
      //uid: 'mock-client-uid',
      //email: 'client@company.com',
      //role: 'client' as const,
    };
    
    setUser(mockUser);
    setUserData(mockUserData);
    setLoading(false);

    // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    //   setLoading(true);
    //   if (firebaseUser) {
    //     setUser(firebaseUser);
    //     const userDocRef = doc(db, 'users', firebaseUser.uid);
    //     const userDocSnap = await getDoc(userDocRef);
    //     if (userDocSnap.exists()) {
    //       setUserData(userDocSnap.data() as UserData);
    //     } else {
    //       setUserData(null);
    //     }
    //   } else {
    //     setUser(null);
    //     setUserData(null);
    //   }
    //   setLoading(false);
    // });

    // return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
