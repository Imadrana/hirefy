import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, ClientProfile, ProfessionalProfile } from './types';

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