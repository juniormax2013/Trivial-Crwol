'use client';

import { useAuthContext } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePresenceTracker } from '@/hooks/usePresenceTracker';
import { useT } from '@/lib/i18n/context';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuthContext();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [forcedLoading, setForcedLoading] = useState(false);

  /**
   * FALLBACK: FORCE RENDER AFTER TIMEOUT
   * If Firebase initialization hangs, we don't want the user stuck on the splash screen indefinitely.
   */
  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      console.warn("Auth initialization taking too long. Forcing render...");
      setForcedLoading(true);
    }, 5000); // 5 second fail-safe (increased from 2s for better resilience)

    return () => clearTimeout(timer);
  }, [loading]);

  /**
   * AUTH REDIRECT LOGIC
   */
  useEffect(() => {
    // List of public routes
    const isPublicRoute = pathname === '/login' || 
                          pathname === '/register' || 
                          pathname === '/forgot-password' ||
                          pathname === '/admin' ||
                          pathname === '/test-character';

    const isMockAdmin = typeof window !== 'undefined' && localStorage.getItem('bc_mock_admin') === 'true';
    const isAdminDashboard = pathname?.startsWith('/admin/dashboard');

    if (!loading || forcedLoading) {
      if (!firebaseUser && !isPublicRoute && !(isAdminDashboard && isMockAdmin)) {
        // Save the current path to return to after login/restoration
        if (typeof window !== 'undefined' && pathname && pathname !== '/' && pathname !== '/login') {
          sessionStorage.setItem('auth_redirect_path', window.location.pathname + window.location.search);
        }
        router.push('/login');
      } else if (firebaseUser && isPublicRoute && pathname !== '/admin' && pathname !== '/test-character') {
        // Check if we have a saved path to return to
        const savedPath = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_path') : null;
        
        if (savedPath && savedPath !== '/login' && savedPath !== pathname) {
          sessionStorage.removeItem('auth_redirect_path');
          router.push(savedPath);
        } else {
          // Only redirect to home if no specific path was intended
          router.push('/');
        }
      }
    }
  }, [firebaseUser, loading, forcedLoading, router, pathname]);

  // Show loading screen while checking auth state 
  // ONLY if it's a private route and we aren't forced to render.
  const isPublicRoute = pathname === '/login' || 
                        pathname === '/register' || 
                        pathname === '/forgot-password' ||
                        pathname === '/admin' ||
                        pathname === '/test-character';

  if (loading && !forcedLoading && !isPublicRoute) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 bg-[#310065] rounded-[1.5rem] flex items-center justify-center shadow-lg animate-pulse">
          <span className="font-serif text-3xl font-black text-white">BC</span>
        </div>
        <div className="space-y-1">
          <h2 className="font-serif font-black text-[#310065] text-xl">Bible Crown</h2>
          <p className="text-[#7c7483] text-[13px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.auth.openingPaths}
          </p>
        </div>
      </div>
    );
  }

  return <GlobalPresenceWrapper>{children}</GlobalPresenceWrapper>;
}

function GlobalPresenceWrapper({ children }: { children: React.ReactNode }) {
  usePresenceTracker();
  return <>{children}</>;
}
