// ---------------------------------------------------------------
// FIREBASE MODULE — INITIALIZATION
// ---------------------------------------------------------------

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * FIREBASE CONFIGURATION
 * These should be populated in .env.local
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config availability
const configKeys = Object.keys(firebaseConfig) as (keyof typeof firebaseConfig)[];
const missingKeys = configKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  const errorMessage = `❌ CRITICAL: Firebase configuration missing keys: ${missingKeys.join(", ")}. 
    In production, this usually means environment variables are not set in the Firebase Console or build pipeline.
    App will likely crash on initialization.`;
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ Firebase configuration missing: ${missingKeys.join(", ")}. Please check your .env.local file.`);
  } else {
    // In production, log a very clear error to the console
    console.error(errorMessage);
    if (typeof window !== 'undefined') {
        // Optionally show an alert or a more user-friendly message if possible, 
        // but for now, the console error is the most important for debugging.
    }
  }
}

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export common services
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed-precondition (multiple tabs)');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence unimplemented');
    }
  });
}
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";

export const functions = getFunctions(app);

// Use emulator if local dev AND specifically enabled via environment variable
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    } catch(e) {
        console.error("Emulator setup error", e);
    }
}

import { getMessaging, isSupported } from "firebase/messaging";
export const getClientMessaging = async () => {
    if (typeof window === 'undefined') return null;
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};


