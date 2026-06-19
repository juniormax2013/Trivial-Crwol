import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log("Checking firestore connection...");
  const docRef = doc(db, "chats", "global_main");
  try {
    const snap = await getDoc(docRef);
    console.log("global_main exists:", snap.exists());
    if (snap.exists()) {
      console.log("global_main data:", snap.data());
    }
  } catch (e) {
    console.error("Failed to read global_main:", e);
  }
}

runTest();
