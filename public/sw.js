/* 2M Cosmetics Dakar — Progressive Web App Service Worker */
const CACHE_NAME = '2m-cosmetics-pwa-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-touch-icon.png',
  '/logo-2m-cosmetics.png',
  '/favicon.png'
];

// URLs or patterns that must NEVER be cached (Sensitive Auth, Payment, User Orders, Admin mutations)
const SENSITIVE_PATTERNS = [
  '/auth/',
  '/rest/v1/orders',
  '/rest/v1/order_items',
  '/rest/v1/addresses',
  '/rest/v1/user_roles',
  '/rest/v1/push_subscriptions',
  '/api/payment',
  '/api/checkout',
  '/api/orders',
  '/api/push',
  '/admin'
];

// Helper to check if request is sensitive
function isSensitiveRequest(url) {
  return SENSITIVE_PATTERNS.some(pattern => url.includes(pattern));
}

// Helper to check if request is for static assets (scripts, styles, images, fonts)
function isStaticAsset(url) {
  return (
    url.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff|woff2|ttf|eot|ico)($|\?)/i) ||
    url.includes('/assets/') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  );
}

// 1. Install Event: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Intelligent multi-tier strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET requests (never cache POST, PUT, DELETE, PATCH)
  if (request.method !== 'GET') {
    return;
  }

  // Bypass chrome extensions or non-http protocols
  if (!url.startsWith('http')) {
    return;
  }

  // NEVER cache sensitive endpoints (Cart updates, Checkout, Orders, Auth tokens, Payments)
  if (isSensitiveRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Strategy A: Navigation requests (HTML pages)
  // Network-First with Cache Fallback and Offline Page Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network fails, try matching in cache (already visited pages)
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the page was never cached, return offline fallback page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('Connexion hors ligne - 2M Cosmetics', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Strategy B: Static assets (JS, CSS, images, Google Fonts)
  // Cache-First with Network Fallback and dynamic cache update
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background (stale-while-revalidate style)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Strategy C: Read-only API queries (Products, Categories, Brands, Blog)
  // Network-First with Cache Fallback so catalog is viewable offline
  if (url.includes('supabase.co') && (url.includes('/products') || url.includes('/categories') || url.includes('/brands') || url.includes('/blog_posts'))) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Default: Stale-while-revalidate / Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((networkResponse) => {
          return networkResponse;
        })
      );
    })
  );
});

// 4. Push Event: Handle incoming push notification
self.addEventListener('push', (event) => {
  let data = {
    title: '2M Cosmetics Dakar',
    body: 'Mise à jour concernant votre commande.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/compte/commandes'
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: {
      url: data.url || '/compte/commandes',
      orderId: data.orderId || null,
      timestamp: Date.now()
    },
    vibrate: [200, 100, 200],
    tag: data.tag || `2m-order-notification-${data.orderId || Date.now()}`,
    renotify: true,
    actions: [
      {
        action: 'view_order',
        title: 'Voir ma commande'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// 5. Notification Click Event: Focus or navigate to order tracking
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/compte/commandes';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // If client is already open on our site
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus();
          }
          if ('navigate' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Push Subscription Change: Refresh subscription on push service cycle
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Forward new subscription endpoint to backend if possible
        console.log('[SW] Push subscription automatically renewed:', subscription.endpoint);
      })
      .catch((err) => {
        console.error('[SW] Failed to renew push subscription:', err);
      })
  );
});

// 7. Background Sync: Retry pending offline actions safely
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-orders') {
    event.waitUntil(
      // Notify clients that sync is active
      clients.matchAll().then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGERED' });
        });
      })
    );
  }
});
