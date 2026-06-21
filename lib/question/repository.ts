// ---------------------------------------------------------------
// QUESTION MODULE — REPOSITORY
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
  limit,
  startAfter,
  QueryDocumentSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DuelQuestion, Difficulty } from '@/lib/duel/models';
import { 
  getCachedDuelQuestions, 
  saveDuelQuestionsToCache, 
  saveQuestionToCache, 
  deleteCachedQuestion 
} from '@/lib/game/questionCache';

const COLLECTION_NAME = 'questions';

/**
 * FETCH QUESTIONS WITH FILTERS
 */
export async function getQuestions(filters?: {
  categoryId?: string;
  difficulty?: Difficulty;
  searchTerm?: string;
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot;
}) {
  // 1. Try local IndexedDB cache first
  let localQs = await getCachedDuelQuestions({
    categoryId: filters?.categoryId === 'all' ? undefined : filters?.categoryId,
    difficulty: (filters?.difficulty as any) === 'all' ? undefined : filters?.difficulty
  });

  // Apply search filter locally
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    localQs = localQs.filter(d => 
      d.questionText.toLowerCase().includes(term) || 
      d.bibleReference.toLowerCase().includes(term)
    );
  }

  // 2. If local cache is empty, pull all questions from Firestore, save them, and try again
  if (localQs.length === 0) {
    try {
      const collectionRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(collectionRef);
      const fbQs = snapshot.docs.map(doc => doc.data() as DuelQuestion);
      
      if (fbQs.length > 0) {
        await saveDuelQuestionsToCache(fbQs);
        // Try fetching locally again
        localQs = await getCachedDuelQuestions({
          categoryId: filters?.categoryId === 'all' ? undefined : filters?.categoryId,
          difficulty: (filters?.difficulty as any) === 'all' ? undefined : filters?.difficulty
        });
        if (filters?.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          localQs = localQs.filter(d => 
            d.questionText.toLowerCase().includes(term) || 
            d.bibleReference.toLowerCase().includes(term)
          );
        }
      }
    } catch (err) {
      console.error("[Question Repository] Offline or failed to sync questions from Firestore:", err);
    }
  }

  // 3. If still empty (e.g. fresh app with no Firestore data), load static seeds to cache
  if (localQs.length === 0) {
    try {
      const { ALL_DUEL_QUESTIONS } = await import('@/lib/duel/seed');
      if (ALL_DUEL_QUESTIONS && ALL_DUEL_QUESTIONS.length > 0) {
        await saveDuelQuestionsToCache(ALL_DUEL_QUESTIONS);
        localQs = await getCachedDuelQuestions({
          categoryId: filters?.categoryId === 'all' ? undefined : filters?.categoryId,
          difficulty: (filters?.difficulty as any) === 'all' ? undefined : filters?.difficulty
        });
        if (filters?.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          localQs = localQs.filter(d => 
            d.questionText.toLowerCase().includes(term) || 
            d.bibleReference.toLowerCase().includes(term)
          );
        }
      }
    } catch (err) {
      console.error("[Question Repository] Failed to load static seed fallback:", err);
    }
  }

  return {
    questions: localQs,
    lastDoc: undefined
  };
}

/**
 * SAVE OR UPDATE QUESTION
 */
export async function saveQuestion(question: DuelQuestion): Promise<void> {
  const docId = `${question.id}_${question.language}`;
  
  // 1. Save to local IndexedDB first
  await saveQuestionToCache({ ...question, id: docId }, 'duel');

  // 2. Then save to Firebase Firestore
  try {
    const questionRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(questionRef, question, { merge: true });
  } catch (err) {
    console.warn("[Question Repository] Saved locally, but failed to sync to Firestore (offline):", err);
  }
}

/**
 * DELETE QUESTION
 */
export async function deleteQuestion(id: string): Promise<void> {
  // 1. Delete from local IndexedDB first
  await deleteCachedQuestion(id, 'duel');

  // 2. Then delete from Firestore
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    // Also try to delete with the base id if it has a language suffix
    const parts = id.split('_');
    if (parts.length > 1) {
      await deleteCachedQuestion(parts[0], 'duel');
    }
  } catch (err) {
    console.warn("[Question Repository] Deleted locally, but failed to delete from Firestore (offline):", err);
  }
}

/**
 * SEEDING UTILITY
 * Imports questions from static library to Firestore
 */
export async function seedQuestionsFromStatic(staticQuestions: DuelQuestion[]): Promise<{success: number, total: number}> {
  // 1. Save to local IndexedDB first
  const normalizedStatic = staticQuestions.map(q => ({
    ...q,
    id: q.id.includes('_') ? q.id : `${q.id}_${q.language}`
  }));
  await saveDuelQuestionsToCache(normalizedStatic);

  // 2. Save to Firestore
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const q of staticQuestions) {
      const docId = `${q.id}_${q.language}`;
      const qRef = doc(db, COLLECTION_NAME, docId);
      batch.set(qRef, q, { merge: true });
      count++;
    }

    await batch.commit();
    return { success: count, total: staticQuestions.length };
  } catch (err) {
    console.warn("[Question Repository] Seeded locally in IndexedDB, but Firestore batch failed (offline).");
    return { success: staticQuestions.length, total: staticQuestions.length };
  }
}

/**
 * FETCH QUESTIONS BY BASE IDS AND LANGUAGE
 */
export async function getQuestionsByIds(ids: string[], language: string = 'ht'): Promise<DuelQuestion[]> {
  // Try to load from IndexedDB first
  const docIds = ids.map(id => id.includes('_') ? id : `${id}_${language}`);
  const cached = await getCachedDuelQuestions({ ids: docIds });
  if (cached.length === ids.length) {
    return cached;
  }

  const results: DuelQuestion[] = [];
  
  for (const id of ids) {
    const docId = id.includes('_') ? id : `${id}_${language}`;
    // Check cache
    const cachedQs = await getCachedDuelQuestions({ ids: [docId] });
    if (cachedQs.length > 0) {
      results.push(cachedQs[0]);
      continue;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, docId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data() as DuelQuestion;
        results.push(data);
        await saveQuestionToCache(data, 'duel');
      } else {
        // Fallback to Haitian Creole if not found in requested language
        const fallbackId = `${id}_ht`;
        const fallbackRef = doc(db, COLLECTION_NAME, fallbackId);
        const fallbackSnap = await getDoc(fallbackRef);
        if (fallbackSnap.exists()) {
          const data = fallbackSnap.data() as DuelQuestion;
          results.push(data);
          await saveQuestionToCache(data, 'duel');
        }
      }
    } catch (err) {
      console.error("[Question Repository] Error fetching question by ID from Firestore:", err);
    }
  }
  
  return results;
}

/**
 * GET QUESTION IDS FOR DUEL ROUND
 */
export async function getQuestionIdsForCategoryAndDifficulty(
  categoryId: string, 
  difficulty: Difficulty, 
  language: string = 'ht'
): Promise<string[]> {
  // Try from local IndexedDB first
  const localQs = await getCachedDuelQuestions({
    categoryId,
    difficulty,
    language
  });

  if (localQs.length >= 3) {
    // Return shuffled subset of 3 IDs
    const shuffled = [...localQs].sort(() => Math.random() - 0.5).slice(0, 3);
    return shuffled.map(q => q.id.split('_')[0]); // return base ID
  }

  try {
    const collectionRef = collection(db, COLLECTION_NAME);
    const q = query(
      collectionRef, 
      where('categoryId', '==', categoryId),
      where('difficulty', '==', difficulty),
      where('language', '==', language),
      limit(3)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as DuelQuestion;
      return data.id;
    });
  } catch (err) {
    console.error("[Question Repository] Error getting question IDs from Firestore:", err);
    // Return whatever we have locally
    return localQs.slice(0, 3).map(q => q.id.split('_')[0]);
  }
}

