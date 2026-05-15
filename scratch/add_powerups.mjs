import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

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

async function run() {
  const querySnapshot = await getDocs(collection(db, "users"));
  for (const userDoc of querySnapshot.docs) {
    const data = userDoc.data();
    console.log(`Updating user: ${data.displayName || data.name || userDoc.id}`);
    await updateDoc(doc(db, "users", userDoc.id), {
      coins: 10000,
      crowns: 1000,
      inventory: {
        removeTwo: 10,
        hintBible: 10,
        freezeTime: 10,
        secondChance: 10
      }
    });
  }
  console.log("Done!");
  process.exit(0);
}

run().catch(console.error);
