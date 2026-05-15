// ---------------------------------------------------------------
// AUTH MODULE — USE MOCK AUTH HOOK
// ---------------------------------------------------------------
// Syncs current mock UID with component state and global changes.

import { useState, useEffect } from 'react';
import { getCurrentMockUid, setMockUid, authEmitter } from '@/lib/auth/mockAuth';

export function useMockAuth() {
  const [currentUid, setCurrentUid] = useState(getCurrentMockUid());

  useEffect(() => {
    const handleUserChange = () => {
      setCurrentUid(getCurrentMockUid());
    };

    authEmitter.addEventListener('userChange', handleUserChange);
    return () => {
      authEmitter.removeEventListener('userChange', handleUserChange);
    };
  }, []);

  const switchUser = (uid: string) => {
    setMockUid(uid);
    // Force direct reload if needed for large context, 
    // or just rely on state update. State is enough for this app.
  };

  return { currentUid, switchUser };
}
