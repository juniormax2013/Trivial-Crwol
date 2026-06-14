// ---------------------------------------------------------------
// CACHE MODULE — QUESTIONS CACHE
// Cachea las preguntas del juego en localStorage por idioma,
// evitando cargar el bundle completo (~850KB) en cada sesión.
// ---------------------------------------------------------------

import { DuelQuestion } from '@/lib/duel/models';
import { cacheSet, cacheGet, CacheTTL } from './local-storage-cache';

const CACHE_KEY_PREFIX = 'questions_v1';

/**
 * Guarda el pool de preguntas de un idioma en localStorage.
 * Se llama una vez al iniciar la app o cuando el caché expira.
 */
export function cacheQuestions(language: string, questions: DuelQuestion[]): void {
  const key = `${CACHE_KEY_PREFIX}_${language}`;
  cacheSet(key, questions, CacheTTL.ONE_DAY);
  console.log(`[QuestionsCache] ${questions.length} preguntas guardadas para idioma: ${language}`);
}

/**
 * Lee las preguntas de un idioma desde el caché.
 * Retorna null si el caché expiró o no existe.
 */
export function getCachedQuestions(language: string): DuelQuestion[] | null {
  const key = `${CACHE_KEY_PREFIX}_${language}`;
  const cached = cacheGet<DuelQuestion[]>(key);
  if (cached) {
    console.log(`[QuestionsCache] ✅ ${cached.length} preguntas cargadas desde caché para: ${language}`);
  }
  return cached;
}

/**
 * Obtiene preguntas por IDs usando caché local.
 * Primero intenta desde localStorage, luego busca en el array dinámico.
 * @param ids - Array de IDs de preguntas a buscar
 * @param language - Idioma preferido del usuario
 * @param allQuestions - Pool completo de preguntas (fallback)
 */
export function getQuestionsByIdsFromCache(
  ids: string[],
  language: string,
  allQuestions: DuelQuestion[]
): DuelQuestion[] {
  // 1. Intentar desde caché local
  const cachedPool = getCachedQuestions(language);
  const sourcePool = cachedPool ?? allQuestions;

  // 2. Mapear IDs a preguntas
  const resolved = ids.map(id => {
    const inPreferredLang = sourcePool.find(q => q.id === id && q.language === language);
    if (inPreferredLang) return inPreferredLang;

    // Fallback a 'ht' (Haitian Creole)
    const inHT = sourcePool.find(q => q.id === id && q.language === 'ht');
    if (inHT) return inHT;

    // Último recurso: cualquier idioma
    return sourcePool.find(q => q.id === id);
  }).filter(Boolean) as DuelQuestion[];

  console.log(`[QuestionsCache] ${resolved.length}/${ids.length} preguntas resueltas en idioma: ${language}`);
  return resolved;
}

/**
 * Inicializa el caché de preguntas para todos los idiomas.
 * Llamar una vez al iniciar la sesión del usuario.
 * Usa lazy-loading: solo carga el idioma activo.
 */
export async function initQuestionsCacheForLanguage(language: string): Promise<void> {
  if (typeof window === 'undefined') return;

  // Verificar si ya está en caché
  const existing = getCachedQuestions(language);
  if (existing) return; // Ya en caché, no hacer nada

  try {
    // Lazy-load del módulo correspondiente al idioma
    let questions: DuelQuestion[] = [];

    switch (language) {
      case 'es':
        const esModule = await import('@/lib/duel/questionsES');
        questions = (esModule as any).ALL_QUESTIONS_ES ?? [];
        break;
      case 'fr':
        const frModule = await import('@/lib/duel/questionsFR_standardized');
        questions = (frModule as any).ALL_QUESTIONS_FR ?? [];
        break;
      case 'ht':
      default:
        const htModule = await import('@/lib/duel/questionsHT_standardized');
        questions = (htModule as any).ALL_QUESTIONS_HT ?? [];
        break;
    }

    if (questions.length > 0) {
      cacheQuestions(language, questions);
    }
  } catch (error) {
    console.warn('[QuestionsCache] Error en lazy-load de preguntas:', error);
  }
}

/**
 * Obtiene el tamaño estimado del caché en KB.
 */
export function getQuestionsCacheSize(): { language: string; sizeKB: number }[] {
  if (typeof window === 'undefined') return [];
  const result: { language: string; sizeKB: number }[] = [];
  const languages = ['es', 'fr', 'ht'];
  
  for (const lang of languages) {
    const key = `bc_cache_${CACHE_KEY_PREFIX}_${lang}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      result.push({ language: lang, sizeKB: Math.round(raw.length / 1024) });
    }
  }
  return result;
}
