import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
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

const usersToUpdate = [
  {
    uid: 'pdfTlUPP7HepG0uoXVSczya7oBf1',
    name: 'Angel Salomon',
    activeFrame: 'crown',
    ownedFrames: ['crown']
  },
  {
    uid: 'uqzmZAhEbfNcWiBbfYbYQpOvTLt2',
    name: 'Norvelie Calixte',
    activeFrame: 'gold',
    ownedFrames: ['gold']
  },
  {
    uid: 'mhGJntYdmIRnlvQP7gZXfgjAXLc2',
    name: 'Vladimir Docteur',
    activeFrame: 'fire',
    ownedFrames: ['fire']
  },
  {
    uid: 'mNRuxhcEBmQ5CqJRgC4hbmGYDyN2',
    name: 'Jean rene Cezar',
    activeFrame: 'gold',
    ownedFrames: ['gold']
  },
  {
    uid: 'WzxKUo0CbAdBrXuXd81o1IjrA0q2',
    name: 'Test User',
    activeFrame: 'fire',
    ownedFrames: ['fire']
  }
];

async function updateUsersFrames() {
  console.log("Iniciando actualización de marcos cosméticos para usuarios del ranking...");

  for (const user of usersToUpdate) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        activeFrame: user.activeFrame,
        ownedFrames: user.ownedFrames,
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Usuario ${user.name} (${user.uid}) actualizado con éxito: activeFrame = ${user.activeFrame}`);
    } catch (error) {
      console.error(`❌ Error al actualizar al usuario ${user.name} (${user.uid}):`, error.message);
    }
  }

  console.log("Proceso de actualización finalizado.");
  process.exit(0);
}

updateUsersFrames().catch(console.error);
