const CACHE_NAME = 'hustlecenter-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/admin.html',
  '/admin-links.html',
  '/appeals.html',
  '/article.html',
  '/blog.html',
  '/browse.html',
  '/categories.html',
  '/community-guidelines.html',
  '/contact.html',
  '/cookie-policy.html',
  '/customer-dashboard.html',
  '/dashboard.html',
  '/disclaimer.html',
  '/forgot-password.html',
  '/founders-story.html',
  '/help.html',
  '/how-it-works.html',
  '/list-your-service.html',
  '/login.html',
  '/offline.html',
  '/paia.html',
  '/partners.html',
  '/playground.html',
  '/popia.html',
  '/privacy.html',
  '/provider.html',
  '/report.html',
  '/request.html',
  '/reset-password.html',
  '/signup.html',
  '/submit-story.html',
  '/terms.html',
  '/trust.html',
  '/verify-email.html',
  '/pwa.js',
  '/manifest.json',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/apple-touch-icon.png',
  '/hustlecenter-logo-512.png',
  '/whatsapp-preview.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});