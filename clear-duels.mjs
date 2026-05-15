import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
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

async function deleteActiveDuels() {
  console.log("Checking active duels...");
  // Obtenemos todos los duelos que no estn completed:
  const statuses = ['active', 'pending'];
  
  for (const st of statuses) {
    const q = query(collection(db, 'duels'), where('status', '==', st));
    const snaps = await getDocs(q);
    console.log(`Found ${snaps.docs.length} duels with status ${st}`);
    
    for (const d of snaps.docs) {
      console.log(`Deleting duel ${d.id}...`);
      await deleteDoc(d.ref);
      
      // Intentar borrar las rondas tambin (las rondas son una subcoleccin)
      const roundsQ = query(collection(db, `duels/${d.id}/rounds`));
      const roundsSnaps = await getDocs(roundsQ);
      for (const r of roundsSnaps.docs) {
        await deleteDoc(r.ref);
      }
    }
  }
  
  console.log("Cleanup completed.");
  process.exit(0);
}

deleteActiveDuels().catch(console.error);
