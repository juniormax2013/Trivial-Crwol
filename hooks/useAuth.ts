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
      
      if (profile.email === 'juniormax2013@gmail.com') {
        profile.jweEnergy = 999999;
        profile.jweHearts = 999999;
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
      if (profile) {
        if (profile.email === 'juniormax2013@gmail.com') {
          profile.jweEnergy = 999999;
          profile.jweHearts = 999999;
        }
        setAppUser(profile);
      }
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

    // ── MOCK USER BYPASS FOR DEVELOPMENT AND TESTING ──
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && localStorage.getItem('bc_mock_user') === 'true') {
      const mockUser: AppUserModel = {
        uid: "mock-user-id",
        email: "mock-user@example.com",
        username: "PeregrinoNoble",
        firstName: "Noble",
        lastName: "Peregrino",
        fullName: "Noble Peregrino",
        photoURL: null,
        provider: "password",
        bio: "Explorador de la palabra de Dios.",
        favoriteVerse: "Filipenses 4:13",
        favoriteCategoryId: "history",
        country: "AR",
        role: "user",
        status: "active",
        level: 5,
        xp: 450,
        coins: 100,
        gems: 20,
        crowns: 2,
        streakDays: 4,
        bestStreak: 10,
        totalGames: 15,
        totalWins: 10,
        totalLosses: 5,
        totalCorrectAnswers: 75,
        totalWrongAnswers: 25,
        accuracyRate: 75,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jweEnergy: 28,
        jweHearts: 5,
        lastJweResetDate: new Date().toISOString().split('T')[0],
        inventory: {},
        ownedFrames: [],
        ownedAvatars: [],
        activeFrame: null,
        activeAvatar: null,
        settings: {
          language: 'es',
          allowNotifications: true,
          pushNotifications: true,
          allowFriendRequests: true,
          allowChallengeInvites: true,
          answerFeedbackSound: true,
          dailyChallengeNotifications: true,
          devotionalNotifications: false,
          duelNotifications: true,
          hapticsEnabled: true,
          isProfilePublic: true,
          menuSoundEffects: true,
          rewardNotifications: true,
          showActivityStatus: true,
          showOnLeaderboards: true,
          soundEnabled: true,
          tournamentNotifications: true,
          vibrationEnabled: true,
        }
      };
      
      const mockFirebaseUser = {
        uid: "mock-user-id",
        email: "mock-user@example.com",
        displayName: "Noble Peregrino",
        photoURL: null,
        providerId: "firebase",
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => "mock-token",
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({})
      } as unknown as FirebaseUser;

      setFirebaseUser(mockFirebaseUser);
      setAppUser(mockUser);
      setLoading(false);
      return;
    }

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
              if (profile.email === 'juniormax2013@gmail.com') {
                profile.jweEnergy = 999999;
                profile.jweHearts = 999999;
              }
              
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
