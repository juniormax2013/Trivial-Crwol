// ---------------------------------------------------------------
// CACHE MODULE — LOCAL STORAGE CACHE
// Utilidad base para cachear datos en localStorage con TTL.
// ---------------------------------------------------------------

const CACHE_VERSION = '1.0.0';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  version: string;
  createdAt: number;
}

/**
 * Escribe un valor en localStorage con tiempo de expiración.
 * @param key - Clave del caché
 * @param data - Datos a guardar
 * @param ttlMs - Tiempo de vida en milisegundos (default: 5 minutos)
 */
export function cacheSet<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
      version: CACHE_VERSION,
      createdAt: Date.now(),
    };
    localStorage.setItem(`bc_cache_${key}`, JSON.stringify(entry));
  } catch (error) {
    // localStorage puede estar lleno o deshabilitado
    console.warn('[Cache] Error al guardar en localStorage:', error);
  }
}

/**
 * Lee un valor del caché. Retorna null si expiró o no existe.
 * @param key - Clave del caché
 */
export function cacheGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`bc_cache_${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Verificar versión
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(`bc_cache_${key}`);
      return null;
    }

    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(`bc_cache_${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('[Cache] Error al leer de localStorage:', error);
    return null;
  }
}

/**
 * Elimina una entrada específica del caché.
 */
export function cacheDelete(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`bc_cache_${key}`);
  } catch (_) {}
}

/**
 * Limpia todas las entradas del caché de la app.
 */
export function cacheClearAll(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('bc_cache_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
    console.log(`[Cache] ${keysToDelete.length} entradas eliminadas.`);
  } catch (error) {
    console.warn('[Cache] Error al limpiar caché:', error);
  }
}

/**
 * Limpia entradas expiradas del caché (para mantenimiento).
 */
export function cachePruneExpired(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToDelete: string[] = [];
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('bc_cache_')) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const entry: CacheEntry<unknown> = JSON.parse(raw);
        if (now > entry.expiresAt) {
          keysToDelete.push(key);
        }
      } catch (_) {
        keysToDelete.push(key!);
      }
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
  } catch (error) {
    console.warn('[Cache] Error en poda de caché:', error);
  }
}

/**
 * TTL constants para uso consistente en toda la app.
 */
export const CacheTTL = {
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
