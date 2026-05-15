// ---------------------------------------------------------------
// AUTH MODULE — USE AUTH HOOK
// ---------------------------------------------------------------

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUserModel } from '@/lib/user/models';
import { getUser, createUser, checkAndResetJweResources, mapUserDoc } from '@/lib/user/repository';

/**
 * AUTH STATE INTERFACE
 */
export interface AuthContextType {
  user: AppUserModel | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * HOOK: USE AUTH
 */
export function useAuth(): AuthContextType {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * LOAD USER PROFILE FROM FIRESTORE
   */
  const loadProfile = useCallback(async (uid: string, email: string | null, displayName: string | null, photoURL: string | null, providerId: string | null) => {
    try {
      let profile = await getUser(uid);
      
      // If profile doesn't exist (e.g. first login), create it
      if (!profile) {
        // Attempt name extraction from displayName
        let firstName = "";
        let lastName = "";
        if (displayName) {
          const names = displayName.trim().split(" ");
          firstName = names[0];
          lastName = names.slice(1).join(" ");
        }

        profile = await createUser({
          uid,
          email,
          firstName,
          lastName,
          fullName: displayName || "Noble Peregrino",
          photoURL,
          provider: providerId || "password"
        });
      }
      
      setAppUser(profile);
      setError(null);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError("No se pudo cargar el perfil del usuario.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * REFRESH USER PROFILE DATA
   */
  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const profile = await getUser(firebaseUser.uid);
      if (profile) setAppUser(profile);
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  }, [firebaseUser]);

  /**
   * SIGN OUT HELPER
   */
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setAppUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Error al cerrar sesión.");
    }
  }, []);

  /**
   * OBSERVE AUTH AND PROFILE CHANGES
   */
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setFirebaseUser(firebaseUser);
      
      // Cleanup previous profile listener if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        try {
          // Check if profile exists; if missing or incomplete, create/patch it
          const initialProfile = await getUser(firebaseUser.uid);
          const needsHealing = initialProfile && (
            !initialProfile.fullName || 
            initialProfile.fullName === "Noble Peregrino" || 
            !initialProfile.role
          );

          if (!initialProfile || needsHealing) {
            // Attempt name extraction from displayName
            let firstName = initialProfile?.firstName || "";
            let lastName = initialProfile?.lastName || "";
            
            if (!firstName && firebaseUser.displayName) {
              const names = firebaseUser.displayName.trim().split(" ");
              firstName = names[0];
              lastName = names.slice(1).join(" ");
            }

            const patchData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              firstName,
              lastName,
              fullName: firebaseUser.displayName || initialProfile?.fullName || "Noble Peregrino",
              photoURL: firebaseUser.photoURL || initialProfile?.photoURL,
              provider: firebaseUser.providerData[0]?.providerId || initialProfile?.provider || "password",
              role: initialProfile?.role || 'user'
            };

            if (!initialProfile) {
              await createUser(patchData);
            } else {
              // Self-heal incomplete profile
              const { updateUser } = await import('@/lib/user/repository');
              await updateUser(firebaseUser.uid, patchData);
            }
          }

          // Track whether we have already synced the login-screen language
          // selection from localStorage → Firestore for this session.
          let langSynced = false;

          unsubscribeProfile = onSnapshot(doc(db, "users", firebaseUser.uid), async (docSnap: any) => {
            if (docSnap.exists()) {
              const profile = mapUserDoc(docSnap.data());
              
              // ── Jwe Bib la daily reset ────────────────────────────────
              if (profile.lastJweResetDate) {
                checkAndResetJweResources(firebaseUser.uid, profile.lastJweResetDate);
              }

              // ── Language priority fix ──────────────────────────────────
              // If the user selected a language on the login screen,
              // it lives in localStorage. Sync it to Firestore (once)
              // so the LanguageSyncer always reads the right language.
              if (!langSynced) {
                langSynced = true;
                try {
                  const LANG_KEY = 'app-language'; // must match context.tsx
                  const localLang = (typeof window !== 'undefined')
                    ? (localStorage.getItem(LANG_KEY) as 'es' | 'ht' | 'fr' | null)
                    : null;
                  const firestoreLang = profile.settings?.language;
                  if (localLang && localLang !== firestoreLang && ['es','ht','fr'].includes(localLang)) {
                    const { updateDoc, doc: fsDoc } = await import('firebase/firestore');
                    const { db: fsDb } = await import('@/lib/firebase');
                    await updateDoc(fsDoc(fsDb, 'users', firebaseUser.uid), {
                      'settings.language': localLang,
                      updatedAt: new Date().toISOString(),
                    });
                    // Update the local profile object so state reflects it immediately
                    profile.settings = { ...profile.settings, language: localLang };
                  }
                } catch (e) {
                  // Non-critical — just log
                  console.warn('Could not sync language to Firestore:', e);
                }
              }
              // ─────────────────────────────────────────────────────────

              setAppUser(profile);
              setError(null);
            }
            setLoading(false);
          }, (err: any) => {
            // permission-denied is expected when the user signs out —
            // Firebase may fire the listener error before the auth state
            // change propagates, so we silently cancel and clear state.
            if (err?.code === 'permission-denied') {
              if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
              }
              setAppUser(null);
              setLoading(false);
              return;
            }
            console.error("Profile listen error:", err);
            setError("Error al sincronizar el perfil.");
            setLoading(false);
          });

        } catch (err) {
          console.error("Auth initialization error:", err);
          setError("Error al inicializar la sesión.");
          setLoading(false);
        }
      } else {
        setAppUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return {
    user: appUser,
    firebaseUser,
    loading,
    error,
    signOut,
    refreshUser
  };
}
