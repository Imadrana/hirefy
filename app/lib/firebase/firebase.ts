//// ChatGPT Prompt Used
//“Write a firebase.js file for a Next.js app.
//Import Firebase modules (initializeApp, getApps, getApp, getAuth, and getFirestore).
//Import firebaseConfig from a config.js file.
//Initialize the Firebase app only if it’s not already initialized, and then export auth and db for authentication and Firestore.”

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
