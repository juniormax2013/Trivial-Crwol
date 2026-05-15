// Minimal Service Worker for PWA eligibility
const CACHE_NAME = 'bible-crown-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
});

// Basic fetch listener is required for "Add to Home Screen" prompt to appear
self.addEventListener('fetch', (event) => {
  // We can leave this empty or implement simple caching later
  // Browsers just need the event listener to exist
});
