// ---------------------------------------------------------------
// CACHE MODULE — PLAYER DATA CACHE
// Cachea el perfil del jugador y sus estadísticas recientes
// para evitar consultas repetitivas a Firestore.
// ---------------------------------------------------------------

import { AppUserModel } from '@/lib/user/models';
import { cacheSet, cacheGet, cacheDelete, CacheTTL } from './local-storage-cache';

const KEY_USER_PROFILE = 'player_profile';
const KEY_RECENT_STATS = 'player_recent_stats';

/**
 * Guarda el perfil del usuario en el caché local.
 */
export function cacheUserProfile(uid: string, profile: AppUserModel): void {
  cacheSet(`${KEY_USER_PROFILE}_${uid}`, profile, CacheTTL.FIVE_MINUTES);
}

/**
 * Obtiene el perfil del usuario del caché local.
 */
export function getCachedUserProfile(uid: string): AppUserModel | null {
  return cacheGet<AppUserModel>(`${KEY_USER_PROFILE}_${uid}`);
}

/**
 * Elimina el perfil del usuario del caché (p. ej. al actualizarlo o cerrar sesión).
 */
export function invalidateUserProfileCache(uid: string): void {
  cacheDelete(`${KEY_USER_PROFILE}_${uid}`);
}

/**
 * Guarda las estadísticas o historial de juegos recientes en el caché.
 */
export function cacheRecentStats<T>(uid: string, stats: T): void {
  cacheSet(`${KEY_RECENT_STATS}_${uid}`, stats, CacheTTL.TEN_MINUTES);
}

/**
 * Obtiene las estadísticas recientes del caché.
 */
export function getCachedRecentStats<T>(uid: string): T | null {
  return cacheGet<T>(`${KEY_RECENT_STATS}_${uid}`);
}

/**
 * Invalida el caché de estadísticas recientes (p. ej. después de terminar una partida).
 */
export function invalidateRecentStatsCache(uid: string): void {
  cacheDelete(`${KEY_RECENT_STATS}_${uid}`);
}
