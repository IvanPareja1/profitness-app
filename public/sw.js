
const CACHE_NAME = 'profitness-v1.0.3';
const urlsToCache = [
  '/',
  '/login',
  '/nutrition', 
  '/add-food',
  '/progress',
  '/profile',
  '/offline',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
  
  // Notificar a los clientes que hay una nueva versión
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        message: 'Service Worker actualizado'
      });
    });
  });
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver desde cache si está disponible
        if (response) {
          return response;
        }
        
        // Clonar la petición
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Si la petición falla, mostrar página offline
          return caches.match('/offline');
        });
      })
  );
});

// Notificar actualizaciones disponibles
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Manejar actualizaciones de datos después de actualización
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_DATA_INTEGRITY') {
    // Verificar integridad de datos después de actualización
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DATA_INTEGRITY_CHECK',
          message: 'Verificando integridad de datos'
        });
      });
    });
  }
});

// Sincronización en background
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Intentar sincronizar datos pendientes
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        message: 'Sincronizando datos en background'
      });
    });
  } catch (error) {
    console.error('Error en sincronización background:', error);
  }
}

// Mostrar notificación de actualización
self.addEventListener('updatefound', () => {
  const newWorker = registration.installing;
  
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed') {
      if (navigator.serviceWorker.controller) {
        // Nueva versión disponible
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATE_AVAILABLE',
              message: 'Nueva versión disponible - Tus datos están protegidos'
            });
          });
        });
      }
    }
  });
});
