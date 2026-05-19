import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function checkUsers() {
  const querySnapshot = await getDocs(collection(db, 'users'));
  console.log("--- USUARIOS EN FIRESTORE ---");
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`UID: ${doc.id} | Name: ${data.fullName || data.username} | activeFrame: ${data.activeFrame} | ownedFrames: ${JSON.stringify(data.ownedFrames)}`);
  });
}

checkUsers().catch(console.error);
