import { db } from "./lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function checkStore() {
  const storeRef = collection(db, "store_items");
  const snapshot = await getDocs(storeRef);
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("STORE_ITEMS:", JSON.stringify(items, null, 2));
}

checkStore();
