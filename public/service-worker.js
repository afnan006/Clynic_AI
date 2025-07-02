// Service Worker for Push Notifications and PWA Caching
const CACHE_NAME = 'clynic-ai-v2'; // Updated cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/vite.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/badge-72x72.png',
  // Add other critical assets like fonts, images, JS bundles
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2' // Example font file
];

// Install event - caches the initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Activate event - cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serves content from cache or network
self.addEventListener('fetch', (event) => {
  // Strategy: Cache-First for static assets, Network-First for navigation
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response from cache
      if (response) {
        return response;
      }
      // No cache hit - fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache new requests if they are successful and are for static assets
        if (networkResponse.ok && networkResponse.type === 'basic' && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for network failures (e.g., offline)
        // You can serve a custom offline page here if needed
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html'); // Fallback to main page
        }
        return new Response('Network error or offline', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Clynic AI',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'default',
    data: {},
    actions: []
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.data.priority === 'urgent',
      silent: notificationData.data.priority === 'low',
      vibrate: getVibrationPattern(notificationData.data.priority),
      timestamp: Date.now()
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action) {
    // Handle action button clicks
    event.waitUntil(
      handleNotificationAction(action, data, notification)
    );
  } else {
    // Handle notification body click
    event.waitUntil(
      handleNotificationClick(data)
    );
  }
});

// Handle notification action button clicks
async function handleNotificationAction(action, data, notification) {
  console.log('Notification action:', action, data);

  // Send action response to main app
  const clients = await self.clients.matchAll({ type: 'window' });
  
  if (clients.length > 0) {
    // Send message to existing client
    clients[0].postMessage({
      type: 'NOTIFICATION_ACTION',
      notificationId: data.notificationId,
      action: action,
      data: data
    });
    
    // Focus the existing window
    clients[0].focus();
  } else {
    // Open new window
    const urlToOpen = getActionUrl(action, data);
    await self.clients.openWindow(urlToOpen);
  }

  // Handle specific actions
  switch (action) {
    case 'taken':
      // Medicine taken
      await sendActionToServer('medicine_taken', {
        notificationId: data.notificationId,
        medicine: data.medicineName,
        timestamp: new Date().toISOString()
      });
      break;

    case 'skip':
      // Medicine skipped
      await sendActionToServer('medicine_skipped', {
        notificationId: data.notificationId,
        medicine: data.medicineName,
        timestamp: new Date().toISOString()
      });
      break;

    case 'snooze':
      // Snooze reminder
      await sendActionToServer('medicine_snoozed', {
        notificationId: data.notificationId,
        medicine: data.medicineName,
        snoozeMinutes: 15,
        timestamp: new Date().toISOString()
      });
      break;

    case 'view':
      // View details - handled by URL opening
      break;

    case 'track':
      // Track package
      const trackingUrl = `https://tracking.example.com/${data.trackingNumber}`;
      await self.clients.openWindow(trackingUrl);
      break;

    default:
      console.log('Unhandled action:', action);
  }
}

// Handle notification body click
async function handleNotificationClick(data) {
  console.log('Notification body clicked:', data);

  const clients = await self.clients.matchAll({ type: 'window' });
  const urlToOpen = data.clickAction?.target || '/';

  if (clients.length > 0) {
    // Focus existing window and navigate
    const client = clients[0];
    client.focus();
    client.postMessage({
      type: 'NOTIFICATION_CLICK',
      url: urlToOpen,
      data: data
    });
  } else {
    // Open new window
    await self.clients.openWindow(urlToOpen);
  }
}

// Get URL for action
function getActionUrl(action, data) {
  switch (action) {
    case 'view':
      if (data.type === 'appointment_confirmed') {
        return `/appointments/${data.appointmentId}`;
      }
      return '/';
    
    case 'taken':
    case 'skip':
    case 'snooze':
      return '/chat';
    
    default:
      return '/';
  }
}

// Send action to server
async function sendActionToServer(actionType, actionData) {
  try {
    const response = await fetch('/api/notifications/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: actionType,
        data: actionData,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Failed to send action to server:', response.status);
    }
  } catch (error) {
    console.error('Error sending action to server:', error);
  }
}

// Get vibration pattern based on priority
function getVibrationPattern(priority) {
  switch (priority) {
    case 'low':
      return [100];
    case 'normal':
      return [200];
    case 'high':
      return [100, 100, 200];
    case 'urgent':
      return [200, 100, 200, 100, 200];
    default:
      return [200];
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-action') {
    event.waitUntil(syncNotificationActions());
  }
});

async function syncNotificationActions() {
  // Handle any queued notification actions when back online
  console.log('Syncing notification actions...');
}