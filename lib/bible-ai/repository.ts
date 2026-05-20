// ---------------------------------------------------------------
// BIBLE AI MODULE — FIRESTORE REPOSITORY
// ---------------------------------------------------------------

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { BibleAIConfig, DEFAULT_BIBLE_AI_CONFIG, DailyUsage } from './types';

const SETTINGS_COLLECTION = 'settings';
const BIBLE_AI_SETTINGS_DOC = 'bible_ai';
const AI_CONVERSATIONS_COLLECTION = 'ai_conversations';
const AI_USAGE_COLLECTION = 'ai_usage';

// ── Config ─────────────────────────────────────────────────────

/**
 * Reads the Bible AI configuration from Firestore.
 * Falls back to defaults if not found.
 */
export async function getBibleAIConfig(): Promise<BibleAIConfig> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, BIBLE_AI_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_BIBLE_AI_CONFIG, ...snap.data() } as BibleAIConfig;
    }
    return DEFAULT_BIBLE_AI_CONFIG;
  } catch (err) {
    console.error('Error fetching Bible AI config:', err);
    return DEFAULT_BIBLE_AI_CONFIG;
  }
}

/**
 * Saves the Bible AI configuration to Firestore.
 */
export async function saveBibleAIConfig(config: Partial<BibleAIConfig>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, BIBLE_AI_SETTINGS_DOC);
  await setDoc(
    docRef,
    { ...config, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

// ── Conversations ──────────────────────────────────────────────

/**
 * Creates a new AI conversation for a user.
 */
export async function createConversation(
  userId: string,
  language: string
): Promise<string> {
  const colRef = collection(
    db,
    AI_CONVERSATIONS_COLLECTION,
    userId,
    'sessions'
  );
  const docRef = await addDoc(colRef, {
    userId,
    title: 'Conversación Bíblica',
    language,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Saves a single message to a conversation.
 */
export async function saveMessage(
  userId: string,
  conversationId: string,
  message: {
    role: 'user' | 'assistant';
    content: string;
    bibleReferences?: { book: string; chapter?: number; verse?: number; text?: string }[];
    mode: 'text' | 'voice';
  }
): Promise<void> {
  const colRef = collection(
    db,
    AI_CONVERSATIONS_COLLECTION,
    userId,
    'sessions',
    conversationId,
    'messages'
  );
  await addDoc(colRef, {
    ...message,
    createdAt: new Date().toISOString(),
  });
  // Update conversation's updatedAt
  const convRef = doc(
    db,
    AI_CONVERSATIONS_COLLECTION,
    userId,
    'sessions',
    conversationId
  );
  await updateDoc(convRef, { updatedAt: new Date().toISOString() });
}

/**
 * Gets the last N conversations for a user.
 */
export async function getUserConversations(userId: string, maxResults = 10) {
  const colRef = collection(db, AI_CONVERSATIONS_COLLECTION, userId, 'sessions');
  const q = query(colRef, orderBy('updatedAt', 'desc'), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Daily Usage ────────────────────────────────────────────────

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // "2026-05-20"
}

/**
 * Gets the user's daily usage for AI queries.
 */
export async function getUserDailyUsage(userId: string): Promise<DailyUsage> {
  const today = getTodayKey();
  const docRef = doc(db, AI_USAGE_COLLECTION, userId, 'daily', today);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as DailyUsage;
  }
  return { questionsUsedToday: 0, lastRequestAt: '', date: today };
}

/**
 * Increments the user's daily usage counter.
 */
export async function incrementDailyUsage(userId: string): Promise<number> {
  const today = getTodayKey();
  const docRef = doc(db, AI_USAGE_COLLECTION, userId, 'daily', today);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const current = (snap.data().questionsUsedToday || 0) + 1;
    await updateDoc(docRef, {
      questionsUsedToday: current,
      lastRequestAt: new Date().toISOString(),
    });
    return current;
  } else {
    await setDoc(docRef, {
      questionsUsedToday: 1,
      lastRequestAt: new Date().toISOString(),
      date: today,
    });
    return 1;
  }
}
