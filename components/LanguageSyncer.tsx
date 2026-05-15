'use client';

/**
 * LanguageSyncer
 * Reads the logged-in user's language preference from Firestore
 * and syncs it into the LanguageContext once on login.
 */
import { useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useSyncUserLanguage } from '@/lib/i18n/context';

export default function LanguageSyncer() {
  const { user } = useAuthContext();
  useSyncUserLanguage(user?.settings?.language);
  return null;
}
