// app/lib/firebase/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  FacebookAuthProvider, 
  AuthProvider 
} from 'firebase/auth';
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (prevent multiple initializations)
const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Initialize Firebase services
export const auth = getAuth(app);

// Firestore initialization with optional emulator support
export const db = getFirestore(app);

// Analytics (only in client-side)
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : Promise.resolve(null);

// Auth Providers
export const authProviders = {
  google: new GoogleAuthProvider(),
  github: new GithubAuthProvider(),
  facebook: new FacebookAuthProvider()
};

// Configure providers
Object.values(authProviders).forEach(provider => {
  provider.setCustomParameters({
    prompt: 'select_account'
  });
});

// Development Emulator Setup
if (process.env.NODE_ENV === 'development') {
  // Uncomment and configure if using local emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

// Utility function to get specific provider
export const getAuthProvider = (providerName: keyof typeof authProviders): AuthProvider => {
  return authProviders[providerName];
};

// Optional: Create a centralized error handler for Firebase operations
export const handleFirebaseError = (error: any) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  
  console.error('Firebase Error:', {
    code: errorCode,
    message: errorMessage
  });

  // You can add more sophisticated error handling here
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    default:
      return 'An unexpected error occurred.';
  }
};