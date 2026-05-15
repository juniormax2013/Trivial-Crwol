'use client';

import { useEffect, useRef } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { updateUser } from '@/lib/user/repository';
import { auth } from '@/lib/firebase';

export function usePresenceTracker() {
  const { user } = useAuthContext();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!user?.uid) return;

    // Capture the UID at the time the effect runs so cleanup can reference it safely
    const capturedUid = user.uid;

    // Cooldown to avoid unneeded writes (e.g. 1 minute)
    const updatePresence = (isOnline: boolean, force = false) => {
      // Safety check: don't write to Firestore if user is no longer authenticated
      if (!auth.currentUser) return;

      const now = Date.now();
      if (isOnline && !force && now - lastUpdateRef.current < 60000) {
        return;
      }
      lastUpdateRef.current = now;

      updateUser(capturedUid, {
        isOnline,
        lastActiveAt: new Date().toISOString()
      }).catch(err => {
        // Silently ignore permission errors on sign-out (expected race condition)
        if (err?.code !== 'permission-denied') {
          console.error("Failed to update presence:", err);
        }
      });
    };

    // Initial load — mark online immediately
    updatePresence(true, true);

    const handleFocus = () => updatePresence(true);
    const handleBlur = () => updatePresence(false, true);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBlur);
      // Only mark offline if still authenticated (avoids permission error on sign-out)
      if (auth.currentUser) {
        updatePresence(false, true);
      }
    };
  }, [user?.uid]);
}
