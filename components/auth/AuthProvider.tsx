'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthContextType } from '@/hooks/useAuth';

/**
 * AUTH CONTEXT
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER COMPONENT
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
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
