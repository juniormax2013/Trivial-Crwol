importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyB_70KHU20O7p-EyZkh6wZ5QRRVozeKyrY",
  authDomain: "trivial-app-bcrown.firebaseapp.com",
  projectId: "trivial-app-bcrown",
  storageBucket: "trivial-app-bcrown.firebasestorage.app",
  messagingSenderId: "183847665190",
  appId: "1:183847665190:web:b07ff624551506360e30e7"
});

const messaging = firebase.messaging();

// Custom background message handler (optional, standard FCM behavior will display notifications)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
});

// Handle notification click to focus or open correct routes
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  if (data.type === 'daily_challenge_available' || data.screen === 'daily_challenge') {
    targetUrl = '/daily-challenge';
  } else if (data.type === 'duel_invitation' || data.screen === 'duel_invitation') {
    const targetId = data.matchId || data.invitationId || data.duelId;
    if (targetId) {
      targetUrl = `/arena/duels/${targetId}`;
    } else {
      targetUrl = '/arena/duels';
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there is already a window open with the same target path
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        let clientPath = new URL(client.url).pathname;
        if (clientPath === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
