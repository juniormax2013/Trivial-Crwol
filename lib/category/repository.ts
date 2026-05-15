// ---------------------------------------------------------------
// CATEGORY MODULE — REPOSITORY
// ---------------------------------------------------------------

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  updateDoc,
  serverTimestamp, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CategoryModel } from './models';

const COLLECTION_NAME = 'categories';

/**
 * FETCH ALL CATEGORIES
 */
export async function getCategories(onlyActive = false): Promise<CategoryModel[]> {
  const categoriesRef = collection(db, COLLECTION_NAME);
  let q = query(categoriesRef, orderBy('order', 'asc'));
  
  if (onlyActive) {
    q = query(categoriesRef, where('isActive', '==', true), orderBy('order', 'asc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CategoryModel));
}

/**
 * SAVE OR UPDATE CATEGORY
 */
export async function saveCategory(category: Partial<CategoryModel> & { id: string }): Promise<void> {
  const categoryRef = doc(db, COLLECTION_NAME, category.id);
  const now = new Date().toISOString();
  
  const data = {
    ...category,
    updatedAt: now,
  };

  if (!category.createdAt) {
    data.createdAt = now;
  }

  await setDoc(categoryRef, data, { merge: true });
}

/**
 * DELETE CATEGORY
 */
export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

/**
 * UPDATE QUESTION COUNT
 */
export async function updateCategoryQuestionCount(id: string, count: number): Promise<void> {
  const categoryRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(categoryRef, {
    questionCount: count,
    updatedAt: new Date().toISOString()
  });
}

/**
 * SEED CATEGORIES
 * Imports default categories to Firestore
 */
export async function seedCategoriesFromStatic(staticCategories: any[]): Promise<{success: number, total: number}> {
  const batch = writeBatch(db);
  let count = 0;

  for (const cat of staticCategories) {
    const catRef = doc(db, COLLECTION_NAME, cat.id);
    
    // Convert short format to full CategoryModel
    const data: Partial<CategoryModel> = {
      id: cat.id,
      name: cat.name,
      slug: cat.id,
      icon: cat.categoryId || 'book-open', // Fallback
      description: `Dominio espiritual de ${cat.name}.`,
      isActive: true,
      order: count + 1,
      questionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    batch.set(catRef, data, { merge: true });
    count++;
  }

  await batch.commit();
  return { success: count, total: staticCategories.length };
}

/**
 * RECALCULATE ALL CATEGORY COUNTS
 * Scans all questions and updates the questionCount for each category
 */
export async function recalculateAllCategoryCounts(): Promise<{ updated: number }> {
  const categoriesRef = collection(db, COLLECTION_NAME);
  const questionsRef = collection(db, 'questions');
  
  const [categoriesSnap, questionsSnap] = await Promise.all([
    getDocs(categoriesRef),
    getDocs(questionsRef)
  ]);
  
  const counts: Record<string, number> = {};
  
  // Count questions per category
  questionsSnap.docs.forEach(qDoc => {
    const qData = qDoc.data();
    const catId = qData.categoryId;
    if (catId) {
      counts[catId] = (counts[catId] || 0) + 1;
    }
  });
  
  const batch = writeBatch(db);
  let updatedCount = 0;
  
  // Update each category in the database
  categoriesSnap.docs.forEach(catDoc => {
    const catId = catDoc.id;
    const currentCount = counts[catId] || 0;
    const catRef = doc(db, COLLECTION_NAME, catId);
    
    batch.update(catRef, {
      questionCount: currentCount,
      updatedAt: new Date().toISOString()
    });
    updatedCount++;
  });
  
  await batch.commit();
  return { updated: updatedCount };
}
