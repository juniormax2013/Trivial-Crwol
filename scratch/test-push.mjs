import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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

async function findActiveTokens() {
  console.log("Searching for active FCM tokens in Firestore...");
  
  // Query collectionGroup fcmTokens where active == true
  const q = query(collectionGroup(db, 'fcmTokens'), where('active', '==', true));
  const snap = await getDocs(q);
  
  console.log(`Found ${snap.docs.length} active tokens:`);
  snap.docs.forEach(docSnap => {
    const data = docSnap.data();
    // The parent of fcmTokens/{tokenId} is users/{userId}
    const userId = docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : 'unknown';
    console.log(`- User ID: ${userId}`);
    console.log(`  Token: ${data.token.slice(0, 20)}...`);
    console.log(`  Platform: ${data.platform}, Lang: ${data.language}`);
    console.log(`  Doc path: ${docSnap.ref.path}`);
  });
  
  process.exit(0);
}

findActiveTokens().catch(console.error);
