'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthContextType } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import PwaInstallBanner from '@/components/play/PwaInstallBanner';

/**
 * AUTH CONTEXT
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER COMPONENT
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { showIosPwaBanner } = usePushNotifications(auth.user?.uid);

  return (
    <AuthContext.Provider value={auth}>
      {children}
      {showIosPwaBanner && <PwaInstallBanner />}
    </AuthContext.Provider>
  );
}

/**
 * EXPORT CONTEXT HOOK
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
