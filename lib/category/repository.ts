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
import { 
  getCachedCategories, 
  saveCategoriesToCache, 
  deleteCachedCategory,
  getCachedDuelQuestions
} from '@/lib/game/questionCache';

const COLLECTION_NAME = 'categories';

/**
 * FETCH ALL CATEGORIES
 */
export async function getCategories(onlyActive = false): Promise<CategoryModel[]> {
  // 1. Try local IndexedDB first
  let localCats = await getCachedCategories();
  
  if (onlyActive) {
    localCats = localCats.filter(c => c.isActive);
  }

  // 2. If local is empty, sync from Firestore, save, and retry
  if (localCats.length === 0) {
    try {
      const categoriesRef = collection(db, COLLECTION_NAME);
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const fbCats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CategoryModel));

      if (fbCats.length > 0) {
        await saveCategoriesToCache(fbCats);
        localCats = await getCachedCategories();
        if (onlyActive) {
          localCats = localCats.filter(c => c.isActive);
        }
      }
    } catch (err) {
      console.error("[Category Repository] Error syncing categories from Firestore:", err);
    }
  }

  // 3. Static fallback if still empty (offline initial load)
  if (localCats.length === 0) {
    try {
      const { DUEL_CATEGORIES } = await import('@/lib/duel/seed');
      if (DUEL_CATEGORIES && DUEL_CATEGORIES.length > 0) {
        const initialCats: CategoryModel[] = DUEL_CATEGORIES.map((cat: any, index: number) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.id,
          icon: cat.categoryId || 'book-open',
          description: `Dominio espiritual de ${cat.name}.`,
          isActive: true,
          order: index + 1,
          questionCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        await saveCategoriesToCache(initialCats);
        localCats = await getCachedCategories();
        if (onlyActive) {
          localCats = localCats.filter(c => c.isActive);
        }
      }
    } catch (err) {
      console.error("[Category Repository] Failed to load static seed categories fallback:", err);
    }
  }

  return localCats;
}

/**
 * SAVE OR UPDATE CATEGORY
 */
export async function saveCategory(category: Partial<CategoryModel> & { id: string }): Promise<void> {
  const now = new Date().toISOString();
  
  const data = {
    ...category,
    updatedAt: now,
  } as CategoryModel;

  if (!category.createdAt) {
    data.createdAt = now;
  }

  // 1. Save to local IndexedDB first
  await saveCategoriesToCache([data]);

  // 2. Then save to Firestore
  try {
    const categoryRef = doc(db, COLLECTION_NAME, category.id);
    await setDoc(categoryRef, data, { merge: true });
  } catch (err) {
    console.warn("[Category Repository] Saved category locally, but failed to sync to Firestore (offline):", err);
  }
}

/**
 * DELETE CATEGORY
 */
export async function deleteCategory(id: string): Promise<void> {
  // 1. Delete from local IndexedDB first
  await deleteCachedCategory(id);

  // 2. Then delete from Firestore
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (err) {
    console.warn("[Category Repository] Deleted category locally, but failed to sync deletion to Firestore (offline):", err);
  }
}

/**
 * UPDATE QUESTION COUNT
 */
export async function updateCategoryQuestionCount(id: string, count: number): Promise<void> {
  // Update locally first
  const cachedCats = await getCachedCategories();
  const cat = cachedCats.find(c => c.id === id);
  if (cat) {
    cat.questionCount = count;
    cat.updatedAt = new Date().toISOString();
    await saveCategoriesToCache([cat]);
  }

  try {
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, {
      questionCount: count,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("[Category Repository] Updated count locally, but failed to sync to Firestore:", err);
  }
}

/**
 * SEED CATEGORIES
 * Imports default categories to Firestore
 */
export async function seedCategoriesFromStatic(staticCategories: any[]): Promise<{success: number, total: number}> {
  const initialCats: CategoryModel[] = staticCategories.map((cat: any, index: number) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.id,
    icon: cat.categoryId || 'book-open',
    description: `Dominio espiritual de ${cat.name}.`,
    isActive: true,
    order: index + 1,
    questionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 1. Save to local IndexedDB first
  await saveCategoriesToCache(initialCats);

  // 2. Then save to Firestore
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const cat of staticCategories) {
      const catRef = doc(db, COLLECTION_NAME, cat.id);
      
      const data: Partial<CategoryModel> = {
        id: cat.id,
        name: cat.name,
        slug: cat.id,
        icon: cat.categoryId || 'book-open',
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
  } catch (err) {
    console.warn("[Category Repository] Seeded categories locally in IndexedDB, but Firestore batch failed (offline).");
    return { success: staticCategories.length, total: staticCategories.length };
  }
}

/**
 * RECALCULATE ALL CATEGORY COUNTS
 * Scans all questions and updates the questionCount for each category
 */
export async function recalculateAllCategoryCounts(): Promise<{ updated: number }> {
  // Recalculate locally first
  const [cachedCats, cachedQs] = await Promise.all([
    getCachedCategories(),
    getCachedDuelQuestions()
  ]);

  const counts: Record<string, number> = {};
  cachedQs.forEach(q => {
    if (q.categoryId) {
      counts[q.categoryId] = (counts[q.categoryId] || 0) + 1;
    }
  });

  const updatedCats = cachedCats.map(cat => {
    const currentCount = counts[cat.id] || 0;
    return {
      ...cat,
      questionCount: currentCount,
      updatedAt: new Date().toISOString()
    };
  });

  await saveCategoriesToCache(updatedCats);

  // Then try to recalculate in Firestore
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const questionsRef = collection(db, 'questions');
    
    const [categoriesSnap, questionsSnap] = await Promise.all([
      getDocs(categoriesRef),
      getDocs(questionsRef)
    ]);
    
    const fbCounts: Record<string, number> = {};
    
    questionsSnap.docs.forEach(qDoc => {
      const qData = qDoc.data();
      const catId = qData.categoryId;
      if (catId) {
        fbCounts[catId] = (fbCounts[catId] || 0) + 1;
      }
    });
    
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    categoriesSnap.docs.forEach(catDoc => {
      const catId = catDoc.id;
      const currentCount = fbCounts[catId] || 0;
      const catRef = doc(db, COLLECTION_NAME, catId);
      
      batch.update(catRef, {
        questionCount: currentCount,
        updatedAt: new Date().toISOString()
      });
      updatedCount++;
    });
    
    await batch.commit();
    return { updated: updatedCount };
  } catch (err) {
    console.warn("[Category Repository] Recalculated locally, but failed to sync counts to Firestore:", err);
    return { updated: updatedCats.length };
  }
}

