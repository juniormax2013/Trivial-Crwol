'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { db, getClientMessaging } from '@/lib/firebase';
import { useLanguage } from '@/lib/i18n/context';

export function usePushNotifications(userId: string | null | undefined) {
  const { language } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showIosPwaBanner, setShowIosPwaBanner] = useState(false);

  // 1. Detect if the user is on iOS and NOT running as standalone PWA
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isIos && !isStandalone) {
      setShowIosPwaBanner(true);
    }
  }, []);

  // 2. Register or update the token in Firestore
  const saveTokenToFirestore = useCallback(async (fcmToken: string) => {
    if (!userId) return;

    // Use a clean document ID by replacing special chars from the token
    const tokenDocId = fcmToken.replace(/[^a-zA-Z0-9]/g, '_').slice(-100);
    const tokenRef = doc(db, 'users', userId, 'fcmTokens', tokenDocId);

    try {
      await setDoc(tokenRef, {
        token: fcmToken,
        platform: 'web',
        active: true,
        language: language || 'es',
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log('FCM Token registered successfully in Firestore.');
    } catch (error) {
      console.error('Error saving FCM Token to Firestore:', error);
    }
  }, [userId, language]);

  // 3. Request permissions and get the FCM token
  const requestPermissionAndRegister = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('Push notifications are not supported in this environment.');
      return null;
    }

    try {
      // Request permission using a hybrid promise/callback approach for full browser compatibility
      let userPermission: NotificationPermission;
      try {
        const p = Notification.requestPermission();
        if (p && typeof p.then === 'function') {
          userPermission = await p;
        } else {
          userPermission = await new Promise<NotificationPermission>((resolve) => {
            Notification.requestPermission(resolve);
          });
        }
      } catch (e) {
        userPermission = await new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission(resolve);
        });
      }

      setPermission(userPermission);

      if (userPermission !== 'granted') {
        console.warn('Notification permission denied.');
        return null;
      }

      // Initialize messaging client safely
      const messaging = await getClientMessaging();
      if (!messaging) {
        console.warn('Firebase Messaging is not supported or failed to initialize.');
        return null;
      }

      // Register the service worker explicitly for FCM
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Wait for the service worker to become active if it isn't already
      if (!registration.active) {
        await new Promise<void>((resolve) => {
          const worker = registration.installing || registration.waiting;
          if (worker) {
            const stateChangeHandler = () => {
              if (worker.state === 'activated') {
                worker.removeEventListener('statechange', stateChangeHandler);
                resolve();
              }
            };
            worker.addEventListener('statechange', stateChangeHandler);
          } else {
            resolve();
          }
        });
      }
      
      // Request token with VAPID Key
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const fcmToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: vapidKey || undefined
      });

      if (fcmToken) {
        setToken(fcmToken);
        await saveTokenToFirestore(fcmToken);
        return fcmToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }, [saveTokenToFirestore]);

  // 4. Run automatic setup on mount/user change
  useEffect(() => {
    if (!userId) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      // Si ya está concedido (para registrar token) o si aún no se ha solicitado ('default'),
      // se inicia la solicitud y registro de notificaciones de manera automática.
      if (currentPermission === 'granted' || currentPermission === 'default') {
        requestPermissionAndRegister();
      }
    }
  }, [userId, requestPermissionAndRegister]);

  // 5. Update token language when the user switches app language
  useEffect(() => {
    if (userId && token) {
      saveTokenToFirestore(token);
    }
  }, [language, userId, token, saveTokenToFirestore]);

  return {
    token,
    permission,
    showIosPwaBanner,
    requestPermission: requestPermissionAndRegister,
  };
}
