// FaceLove Service Worker
// Cache version - update this to force cache refresh
const CACHE_VERSION = 'v1';
const CACHE_NAME = `facelove-${CACHE_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  // CSS files will be cached dynamically
  // JS files will be cached dynamically
];

// Cache categories with different strategies
const CACHE_STRATEGIES = {
  // Static assets: Cache-First (long-lived)
  static: {
    name: `${CACHE_NAME}-static`,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    patterns: [
      /\.js$/,
      /\.css$/,
      /\.woff2?$/,
      /\.ttf$/,
      /\.eot$/,
    ],
  },
  // Images: Cache-First with stale-while-revalidate behavior
  images: {
    name: `${CACHE_NAME}-images`,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    patterns: [
      /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
    ],
  },
  // API calls: Network-First with fallback
  api: {
    name: `${CACHE_NAME}-api`,
    maxAge: 5 * 60 * 1000, // 5 minutes
    patterns: [
      /^\/api\//,
    ],
  },
  // External resources: Network-First
  external: {
    name: `${CACHE_NAME}-external`,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    isExternal: true,
  },
};

// Install event - precache core assets
self.addEventListener('install', (event) => {
  console.log('[FaceLove SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[FaceLove SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[FaceLove SW] Pre-cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[FaceLove SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('facelove-') && name !== CACHE_NAME && !name.includes(CACHE_VERSION))
            .map((name) => {
              console.log('[FaceLove SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine strategy based on request type
  if (isAPIRequest(url)) {
    // API requests: Network-First with cache fallback
    event.respondWith(networkFirst(request, CACHE_STRATEGIES.api));
  } else if (isImageRequest(url)) {
    // Image requests: Cache-First with background update
    event.respondWith(cacheFirstWithRefresh(request, CACHE_STRATEGIES.images));
  } else if (isStaticAsset(url)) {
    // Static assets: Cache-First
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.static));
  } else if (isExternalRequest(url)) {
    // External requests: Network-First
    event.respondWith(networkFirst(request, CACHE_STRATEGIES.external));
  } else {
    // Navigation requests: Network-First with offline fallback
    if (request.mode === 'navigate') {
      event.respondWith(navigationHandler(request));
    } else {
      // Default: Stale-While-Revalidate
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Helper: Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper: Check if request is for an image
function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/.test(url.pathname);
}

// Helper: Check if request is for a static asset
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot|otf)$/.test(url.pathname);
}

// Helper: Check if request is external
function isExternalRequest(url) {
  return url.origin !== self.location.origin;
}

// Strategy: Cache-First
async function cacheFirst(request, config) {
  const cache = await caches.open(config.name);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[FaceLove SW] Cache-First failed:', error);
    throw error;
  }
}

// Strategy: Cache-First with Background Refresh (Stale-While-Revalidate for images)
async function cacheFirstWithRefresh(request, config) {
  const cache = await caches.open(config.name);
  const cachedResponse = await cache.match(request);

  // Return cached response immediately if available
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        // Update cache in background
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // If network fails and no cache, return a placeholder
      if (!cachedResponse) {
        return new Response('', { status: 404 });
      }
    });

  return cachedResponse || fetchPromise;
}

// Strategy: Network-First
async function networkFirst(request, config) {
  const cache = await caches.open(config.name);

  try {
    const networkResponse = await fetch(request);
    
    // Update cache with fresh response
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache when offline
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[FaceLove SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // For API requests, return a custom offline response
    if (isAPIRequest(new URL(request.url))) {
      return new Response(
        JSON.stringify({ error: 'Offline', message: 'Você está offline. Verifique sua conexão.' }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    throw error;
  }
}

// Strategy: Stale-While-Revalidate (default)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(`${CACHE_NAME}-dynamic`);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Handler for navigation requests
async function navigationHandler(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the response for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to cached root page
    const rootCache = await cache.match('/');
    if (rootCache) {
      return rootCache;
    }
    
    // Final fallback: return offline page
    return caches.match('/offline');
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.startsWith('facelove-')) {
          caches.delete(name);
        }
      });
    });
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[FaceLove SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
  
  if (event.tag === 'sync-reading-progress') {
    event.waitUntil(syncReadingProgress());
  }
});

// Placeholder sync functions (implement as needed)
async function syncFavorites() {
  console.log('[FaceLove SW] Syncing favorites...');
  // Implement favorite syncing logic here
}

async function syncReadingProgress() {
  console.log('[FaceLove SW] Syncing reading progress...');
  // Implement reading progress syncing logic here
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nova atualização disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'FaceLove', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

console.log('[FaceLove SW] Service worker loaded. Version:', CACHE_VERSION);
