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

async function countUsersWithFrames() {
  const querySnapshot = await getDocs(collection(db, 'users'));
  let count = 0;
  let frameCounts = {
    gold: 0,
    fire: 0,
    crown: 0
  };

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const ownedFrames = data.ownedFrames || [];
    
    // Check if they own any frame other than 'default'
    const hasPremiumFrame = ownedFrames.some(frame => ['gold', 'fire', 'crown'].includes(frame));
    
    if (hasPremiumFrame) {
      count++;
      if (ownedFrames.includes('gold')) frameCounts.gold++;
      if (ownedFrames.includes('fire')) frameCounts.fire++;
      if (ownedFrames.includes('crown')) frameCounts.crown++;
    }
  });

  console.log(`Total users with purchased frames: ${count}`);
  console.log(`- Gold frame owners: ${frameCounts.gold}`);
  console.log(`- Fire frame owners: ${frameCounts.fire}`);
  console.log(`- Crown frame owners: ${frameCounts.crown}`);
}

countUsersWithFrames().catch(console.error);
