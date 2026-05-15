import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const STORE_COLLECTION = "store_items";

export interface StoreItem {
  id?: string;
  itemId: string; // The ID used in logic (e.g. 'removeTwo', 'gold_frame')
  type: 'energy' | 'hearts' | 'powers' | 'frames' | 'avatars';
  name: string;
  description: string;
  cost: number;
  icon: string;
  amount?: number; // For packs like +7 energy
  isActive: boolean;
}

export async function getStoreItems(): Promise<StoreItem[]> {
  const storeRef = collection(db, STORE_COLLECTION);
  const q = query(storeRef, orderBy("cost", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoreItem));
}

export async function createStoreItem(item: Omit<StoreItem, 'id'>): Promise<string> {
  const storeRef = collection(db, STORE_COLLECTION);
  const docRef = await addDoc(storeRef, {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateStoreItem(id: string, item: Partial<StoreItem>): Promise<void> {
  const itemRef = doc(db, STORE_COLLECTION, id);
  await updateDoc(itemRef, {
    ...item,
    updatedAt: serverTimestamp()
  });
}

export async function deleteStoreItem(id: string): Promise<void> {
  const itemRef = doc(db, STORE_COLLECTION, id);
  await deleteDoc(itemRef);
}

export async function uploadStoreIcon(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `store/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
  const storageRef = ref(storage, fileName);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
