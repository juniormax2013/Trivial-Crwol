// ---------------------------------------------------------------
// GAME MODULE — QUESTION CACHE (IndexedDB)
// Sistema centralizado de caché local para preguntas.
// Usa IndexedDB para manejar grandes volúmenes de datos
// y funcionar sin depender constantemente de Firebase.
// ---------------------------------------------------------------

import { DuelQuestion } from '@/lib/duel/models';
import { SacredQuestion } from '@/lib/reto-sagrado/questions';

// ─── Constants ──────────────────────────────────────────────────

const DB_NAME = 'bible_crown_cache';
const DB_VERSION = 2;
const STORE_DUEL_QUESTIONS = 'duel_questions';
const STORE_SACRED_QUESTIONS = 'sacred_questions';
const STORE_METADATA = 'cache_metadata';

const METADATA_KEY_VERSION = 'questionBankVersion';
const METADATA_KEY_LAST_SYNC = 'lastSyncAt';
const METADATA_KEY_TOTAL = 'totalQuestionsCached';

// ─── Types ──────────────────────────────────────────────────────

export interface CachedDuelQuestion extends DuelQuestion {
  cachedAt: number;
}

export interface CachedSacredQuestion extends SacredQuestion {
  cachedAt: number;
}

export interface CacheMetadata {
  questionBankVersion: number;
  lastSyncAt: number;
  totalQuestionsCached: number;
}

export type QuestionFilter = {
  language?: string;
  categoryId?: string;
  difficulty?: string;
  ids?: string[];
};

// ─── IndexedDB Initialization ────────────────────────────────────

let dbInstance: IDBDatabase | null = null;

/**
 * Opens (or reuses) the IndexedDB connection.
 * Creates object stores on first run or upgrade.
 */
export function openQuestionCacheDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('[QuestionCache] IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Duel questions store (for Crown Arena, Duels, etc.)
      if (!db.objectStoreNames.contains(STORE_DUEL_QUESTIONS)) {
        const store = db.createObjectStore(STORE_DUEL_QUESTIONS, { keyPath: 'id' });
        store.createIndex('language', 'language', { unique: false });
        store.createIndex('categoryId', 'categoryId', { unique: false });
        store.createIndex('difficulty', 'difficulty', { unique: false });
        store.createIndex('lang_cat', ['language', 'categoryId'], { unique: false });
        store.createIndex('lang_diff', ['language', 'difficulty'], { unique: false });
      }

      // Sacred questions store (for Reto Sagrado)
      if (!db.objectStoreNames.contains(STORE_SACRED_QUESTIONS)) {
        const sacredStore = db.createObjectStore(STORE_SACRED_QUESTIONS, { keyPath: 'id' });
        sacredStore.createIndex('language', 'language', { unique: false });
        sacredStore.createIndex('type', 'type', { unique: false });
        sacredStore.createIndex('difficulty', 'difficulty', { unique: false });
        sacredStore.createIndex('lang_type', ['language', 'type'], { unique: false });
      }

      // Metadata store (version, sync timestamps)
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }

      console.log('[QuestionCache] IndexedDB stores created/upgraded.');
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      console.log('[QuestionCache] ✅ IndexedDB connected (version:', DB_VERSION, ')');
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      const err = (event.target as IDBOpenDBRequest).error;
      console.error('[QuestionCache] ❌ Failed to open IndexedDB:', err);
      reject(err);
    };

    request.onblocked = () => {
      console.warn('[QuestionCache] ⚠️ IndexedDB upgrade blocked. Close other tabs.');
    };
  });
}

// ─── Internal Helpers ─────────────────────────────────────────────

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openQuestionCacheDB();
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const req = operation(store);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

function runCursorTransaction<T>(
  storeName: string,
  indexName: string | null,
  keyRange: IDBKeyRange | null,
  mapper: (record: T) => T | null
): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openQuestionCacheDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const req = keyRange ? source.openCursor(keyRange) : source.openCursor();
      const results: T[] = [];

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const mapped = mapper(cursor.value as T);
          if (mapped !== null) results.push(mapped);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── SAVE FUNCTIONS ───────────────────────────────────────────────

/**
 * Saves an array of DuelQuestions to IndexedDB.
 * Uses a bulk put operation for performance.
 */
export async function saveDuelQuestionsToCache(questions: DuelQuestion[]): Promise<void> {
  if (questions.length === 0) return;

  return new Promise(async (resolve, reject) => {
    try {
      const db = await openQuestionCacheDB();
      const tx = db.transaction(STORE_DUEL_QUESTIONS, 'readwrite');
      const store = tx.objectStore(STORE_DUEL_QUESTIONS);
      const now = Date.now();

      questions.forEach((q) => {
        store.put({ ...q, cachedAt: now });
      });

      tx.oncomplete = () => {
        console.log(`[QuestionCache] ✅ ${questions.length} duel questions saved to IndexedDB.`);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Saves an array of SacredQuestions to IndexedDB.
 */
export async function saveSacredQuestionsToCache(questions: SacredQuestion[]): Promise<void> {
  if (questions.length === 0) return;

  return new Promise(async (resolve, reject) => {
    try {
      const db = await openQuestionCacheDB();
      const tx = db.transaction(STORE_SACRED_QUESTIONS, 'readwrite');
      const store = tx.objectStore(STORE_SACRED_QUESTIONS);
      const now = Date.now();

      questions.forEach((q) => {
        store.put({ ...q, cachedAt: now });
      });

      tx.oncomplete = () => {
        console.log(`[QuestionCache] ✅ ${questions.length} sacred questions saved to IndexedDB.`);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── READ FUNCTIONS ───────────────────────────────────────────────

/**
 * Returns DuelQuestions matching the given filter.
 * Runs entirely from local IndexedDB — no Firebase call.
 */
export async function getCachedDuelQuestions(filter: QuestionFilter = {}): Promise<DuelQuestion[]> {
  try {
    const db = await openQuestionCacheDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DUEL_QUESTIONS, 'readonly');
      const store = tx.objectStore(STORE_DUEL_QUESTIONS);

      let source: IDBObjectStore | IDBIndex = store;

      // Use compound index when both language + difficulty are specified
      if (filter.language && filter.difficulty) {
        source = store.index('lang_diff');
      } else if (filter.language && filter.categoryId) {
        source = store.index('lang_cat');
      } else if (filter.language) {
        source = store.index('language');
      } else if (filter.difficulty) {
        source = store.index('difficulty');
      } else if (filter.categoryId) {
        source = store.index('categoryId');
      }

      const results: DuelQuestion[] = [];

      let keyRange: IDBKeyRange | null = null;
      if (filter.language && filter.difficulty && source === store.index('lang_diff')) {
        keyRange = IDBKeyRange.only([filter.language, filter.difficulty]);
      } else if (filter.language && filter.categoryId && source === store.index('lang_cat')) {
        keyRange = IDBKeyRange.only([filter.language, filter.categoryId]);
      } else if (filter.language && source === store.index('language')) {
        keyRange = IDBKeyRange.only(filter.language);
      } else if (filter.difficulty && source === store.index('difficulty')) {
        keyRange = IDBKeyRange.only(filter.difficulty);
      } else if (filter.categoryId && source === store.index('categoryId')) {
        keyRange = IDBKeyRange.only(filter.categoryId);
      }

      const req = keyRange ? source.openCursor(keyRange) : source.openCursor();

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const q = cursor.value as DuelQuestion;
          // Additional in-memory filter for categoryId when not used as index
          if (!filter.categoryId || q.categoryId === filter.categoryId) {
            results.push(q);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[QuestionCache] getCachedDuelQuestions error:', err);
    return [];
  }
}

/**
 * Gets specific DuelQuestions by ID array.
 * Efficient for loading questions by pre-selected IDs from a multiplayer room.
 */
export async function getCachedDuelQuestionsByIds(
  ids: string[],
  preferredLanguage?: string
): Promise<DuelQuestion[]> {
  if (ids.length === 0) return [];

  try {
    const results: DuelQuestion[] = [];
    const missingIds: string[] = [];

    for (const id of ids) {
      try {
        const q = await runTransaction<DuelQuestion | undefined>(
          STORE_DUEL_QUESTIONS,
          'readonly',
          (store) => {
            if (preferredLanguage) {
              // Try preferred language key: "id_language"
              // Since key is just id, we get all with this id via cursor
              return store.get(id) as IDBRequest<DuelQuestion | undefined>;
            }
            return store.get(id) as IDBRequest<DuelQuestion | undefined>;
          }
        );

        if (q) {
          results.push(q);
        } else {
          missingIds.push(id);
        }
      } catch {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      console.warn(`[QuestionCache] ${missingIds.length} questions not in cache:`, missingIds);
    }

    // Return in the same order as the input ids
    const ordered = ids
      .map(id => results.find(q => q.id === id))
      .filter(Boolean) as DuelQuestion[];

    return ordered;
  } catch (err) {
    console.error('[QuestionCache] getCachedDuelQuestionsByIds error:', err);
    return [];
  }
}

/**
 * Gets SacredQuestions from cache with optional filters.
 */
export async function getCachedSacredQuestions(
  language: string,
  type?: string,
  difficulty?: string
): Promise<SacredQuestion[]> {
  try {
    const db = await openQuestionCacheDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SACRED_QUESTIONS, 'readonly');
      const store = tx.objectStore(STORE_SACRED_QUESTIONS);

      let source: IDBObjectStore | IDBIndex;
      let keyRange: IDBKeyRange | null = null;

      if (type) {
        source = store.index('lang_type');
        keyRange = IDBKeyRange.only([language, type]);
      } else {
        source = store.index('language');
        keyRange = IDBKeyRange.only(language);
      }

      const results: SacredQuestion[] = [];
      const req = keyRange ? source.openCursor(keyRange) : source.openCursor();

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const q = cursor.value as SacredQuestion;
          if (!difficulty || q.difficulty === difficulty) {
            results.push(q);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[QuestionCache] getCachedSacredQuestions error:', err);
    return [];
  }
}

/**
 * Gets specific SacredQuestions by ID array from cache.
 */
export async function getCachedSacredQuestionsByIds(
  ids: string[],
  language: string
): Promise<SacredQuestion[]> {
  if (ids.length === 0) return [];

  try {
    const results: SacredQuestion[] = [];

    for (const id of ids) {
      const q = await runTransaction<SacredQuestion | undefined>(
        STORE_SACRED_QUESTIONS,
        'readonly',
        (store) => store.get(id) as IDBRequest<SacredQuestion | undefined>
      );
      if (q) results.push(q);
    }

    // Return in order
    return ids.map(id => results.find(q => q.id === id)).filter(Boolean) as SacredQuestion[];
  } catch (err) {
    console.error('[QuestionCache] getCachedSacredQuestionsByIds error:', err);
    return [];
  }
}

// ─── METADATA FUNCTIONS ───────────────────────────────────────────

interface MetadataRecord {
  key: string;
  value: string | number;
}

/**
 * Gets the local question bank version stored in IndexedDB.
 * Returns 0 if not set (forces a sync on first run).
 */
export async function getLocalQuestionBankVersion(): Promise<number> {
  try {
    const record = await runTransaction<MetadataRecord | undefined>(
      STORE_METADATA,
      'readonly',
      (store) => store.get(METADATA_KEY_VERSION) as IDBRequest<MetadataRecord | undefined>
    );
    return record ? Number(record.value) : 0;
  } catch {
    return 0;
  }
}

/**
 * Saves the local question bank version to IndexedDB.
 */
export async function setLocalQuestionBankVersion(version: number): Promise<void> {
  try {
    await runTransaction<IDBValidKey>(
      STORE_METADATA,
      'readwrite',
      (store) => store.put({ key: METADATA_KEY_VERSION, value: version })
    );
  } catch (err) {
    console.error('[QuestionCache] setLocalQuestionBankVersion error:', err);
  }
}

/**
 * Returns full metadata: version, lastSync, total cached.
 */
export async function getCacheMetadata(): Promise<CacheMetadata> {
  try {
    const [versionRec, lastSyncRec, totalRec] = await Promise.all([
      runTransaction<MetadataRecord | undefined>(STORE_METADATA, 'readonly', s => s.get(METADATA_KEY_VERSION) as IDBRequest<MetadataRecord | undefined>),
      runTransaction<MetadataRecord | undefined>(STORE_METADATA, 'readonly', s => s.get(METADATA_KEY_LAST_SYNC) as IDBRequest<MetadataRecord | undefined>),
      runTransaction<MetadataRecord | undefined>(STORE_METADATA, 'readonly', s => s.get(METADATA_KEY_TOTAL) as IDBRequest<MetadataRecord | undefined>),
    ]);

    return {
      questionBankVersion: versionRec ? Number(versionRec.value) : 0,
      lastSyncAt: lastSyncRec ? Number(lastSyncRec.value) : 0,
      totalQuestionsCached: totalRec ? Number(totalRec.value) : 0,
    };
  } catch {
    return { questionBankVersion: 0, lastSyncAt: 0, totalQuestionsCached: 0 };
  }
}

/**
 * Updates all metadata fields after a successful sync.
 */
export async function updateCacheMetadata(version: number, total: number): Promise<void> {
  try {
    const db = await openQuestionCacheDB();
    const tx = db.transaction(STORE_METADATA, 'readwrite');
    const store = tx.objectStore(STORE_METADATA);
    const now = Date.now();

    store.put({ key: METADATA_KEY_VERSION, value: version });
    store.put({ key: METADATA_KEY_LAST_SYNC, value: now });
    store.put({ key: METADATA_KEY_TOTAL, value: total });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('[QuestionCache] updateCacheMetadata error:', err);
  }
}

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────

/**
 * Checks if a set of question IDs are fully available in cache.
 * Returns { cached: string[], missing: string[] }
 */
export async function checkQuestionIdsInCache(
  ids: string[],
  store: 'duel' | 'sacred' = 'duel'
): Promise<{ cached: string[]; missing: string[] }> {
  const storeName = store === 'duel' ? STORE_DUEL_QUESTIONS : STORE_SACRED_QUESTIONS;
  const cached: string[] = [];
  const missing: string[] = [];

  for (const id of ids) {
    try {
      const rec = await runTransaction<unknown | undefined>(
        storeName,
        'readonly',
        (s) => s.get(id) as IDBRequest<unknown | undefined>
      );
      if (rec) cached.push(id);
      else missing.push(id);
    } catch {
      missing.push(id);
    }
  }

  return { cached, missing };
}

/**
 * Counts total records in each store.
 */
export async function getCacheStats(): Promise<{
  duelQuestions: number;
  sacredQuestions: number;
}> {
  try {
    const [duel, sacred] = await Promise.all([
      runTransaction<number>(STORE_DUEL_QUESTIONS, 'readonly', s => s.count()),
      runTransaction<number>(STORE_SACRED_QUESTIONS, 'readonly', s => s.count()),
    ]);
    return { duelQuestions: duel, sacredQuestions: sacred };
  } catch {
    return { duelQuestions: 0, sacredQuestions: 0 };
  }
}

/**
 * Clears all cached questions (for a full resync).
 */
export async function clearQuestionCache(): Promise<void> {
  try {
    const db = await openQuestionCacheDB();
    const tx = db.transaction(
      [STORE_DUEL_QUESTIONS, STORE_SACRED_QUESTIONS, STORE_METADATA],
      'readwrite'
    );
    tx.objectStore(STORE_DUEL_QUESTIONS).clear();
    tx.objectStore(STORE_SACRED_QUESTIONS).clear();
    tx.objectStore(STORE_METADATA).clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        dbInstance = null; // force reconnect
        console.log('[QuestionCache] 🗑️ Cache cleared.');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('[QuestionCache] clearQuestionCache error:', err);
  }
}
