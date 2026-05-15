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
  const collectionRef = collection(db, COLLECTION_NAME);
  let q = query(collectionRef, orderBy('id', 'asc'));

  if (filters?.categoryId && filters.categoryId !== 'all') {
    q = query(q, where('categoryId', '==', filters.categoryId));
  }
  
  if (filters?.difficulty && filters.difficulty !== 'all' as any) {
    q = query(q, where('difficulty', '==', filters.difficulty));
  }

  if (filters?.limitCount) {
    q = query(q, limit(filters.limitCount));
  }

  if (filters?.lastDoc) {
    q = query(q, startAfter(filters.lastDoc));
  }

  const snapshot = await getDocs(q);
  
  // Basic search filter (client-side for simplicity in Trivial app)
  let docs = snapshot.docs.map(doc => doc.data() as DuelQuestion);
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    docs = docs.filter(d => 
      d.questionText.toLowerCase().includes(term) || 
      d.bibleReference.toLowerCase().includes(term)
    );
  }

  return {
    questions: docs,
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
}

/**
 * SAVE OR UPDATE QUESTION
 */
export async function saveQuestion(question: DuelQuestion): Promise<void> {
  // Use composite ID to prevent language overwrites
  const docId = `${question.id}_${question.language}`;
  const questionRef = doc(db, COLLECTION_NAME, docId);
  await setDoc(questionRef, question, { merge: true });
}

/**
 * DELETE QUESTION
 */
export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

/**
 * SEEDING UTILITY
 * Imports questions from static library to Firestore
 */
export async function seedQuestionsFromStatic(staticQuestions: DuelQuestion[]): Promise<{success: number, total: number}> {
  const batch = writeBatch(db);
  let count = 0;

  for (const q of staticQuestions) {
    // Use composite ID to prevent language overwrites
    const docId = `${q.id}_${q.language}`;
    const qRef = doc(db, COLLECTION_NAME, docId);
    batch.set(qRef, q, { merge: true });
    count++;
  }

  await batch.commit();
  return { success: count, total: staticQuestions.length };
}

/**
 * FETCH QUESTIONS BY BASE IDS AND LANGUAGE
 */
export async function getQuestionsByIds(ids: string[], language: string = 'ht'): Promise<DuelQuestion[]> {
  const results: DuelQuestion[] = [];
  
  for (const id of ids) {
    // Try to get the language-specific version first
    const docId = `${id}_${language}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      results.push(snap.data() as DuelQuestion);
    } else {
      // Fallback to Haitian Creole if not found in requested language
      const fallbackId = `${id}_ht`;
      const fallbackRef = doc(db, COLLECTION_NAME, fallbackId);
      const fallbackSnap = await getDoc(fallbackRef);
      if (fallbackSnap.exists()) {
        results.push(fallbackSnap.data() as DuelQuestion);
      }
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
  const collectionRef = collection(db, COLLECTION_NAME);
  const q = query(
    collectionRef, 
    where('categoryId', '==', categoryId),
    where('difficulty', '==', difficulty),
    where('language', '==', language),
    limit(3)
  );

  const snapshot = await getDocs(q);
  // Return the base ID (stripping the language suffix if present)
  return snapshot.docs.map(doc => {
    const data = doc.data() as DuelQuestion;
    return data.id; // This is the base ID (e.g. dq-pent-001)
  });
}
