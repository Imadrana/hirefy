import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type ClientProfile = {
  name?: string;
  // add other client-specific fields as needed
  [key: string]: any;
};

export type ProfessionalProfile = {
  name?: string;
  skills?: string[];
  // add other professional-specific fields as needed
  [key: string]: any;
};

export type User = {
  uid: string;
  email?: string;
  profile?: ClientProfile | ProfessionalProfile;
  createdAt?: string;
  // allow extra fields stored in Firestore
  [key: string]: any;
};

export const createUser = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      ...user,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating user', error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string, 
  profile: ClientProfile | ProfessionalProfile
) => {
  try {
    await updateDoc(doc(db, 'users', uid), { profile });
  } catch (error) {
    console.error('Error updating user profile', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data() as User : null;
  } catch (error) {
    console.error('Error getting user profile', error);
    throw error;
  }
};