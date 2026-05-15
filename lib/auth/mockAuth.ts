// ---------------------------------------------------------------
// AUTH MODULE — MOCK AUTH STORE
// ---------------------------------------------------------------
// Manages the current active user for simulation purposes in mock mode.
// In a real app, this would wrap Firebase Auth.

import { DEMO_USER_ID, MOCK_OPPONENTS } from '../duel/seed';

const MOCK_UID_KEY = 'bc:mock_uid:v1';

// Basic EventEmitter implementation since we are in a browser-like environment
class AuthEmitter extends EventTarget {
  notify() {
    this.dispatchEvent(new Event('userChange'));
  }
}

export const authEmitter = new AuthEmitter();

/** 
 * Get current mock UID across the app. 
 * Defaults to 'demo-user'.
 */
export function getCurrentMockUid(): string {
  if (typeof window === 'undefined') return DEMO_USER_ID;
  return localStorage.getItem(MOCK_UID_KEY) || DEMO_USER_ID;
}

/** 
 * Switch to a different mock UID. 
 * Re-seeds the app context by triggering an event.
 */
export function setMockUid(uid: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_UID_KEY, uid);
  authEmitter.notify();
}

/**
 * List all available mock user IDs for switching.
 */
export function getAvailableMockUsers() {
  return [
    { uid: DEMO_USER_ID, name: 'Tú (Demo)' },
    ...MOCK_OPPONENTS.map(opp => ({ uid: opp.uid, name: opp.name }))
  ];
}
