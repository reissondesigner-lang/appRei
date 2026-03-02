const CACHE_NAME = 'my-cache-v1'; // Versão do cache

// Arquivos essenciais a serem armazenados no cache
const CACHE_URLS = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/legendas/index.html',
    BASE_PATH + '/reforco/index.html',
    BASE_PATH + '/calCaixa/index.html',
    BASE_PATH + '/icon-512.png',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/config.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Adiciona todos os arquivos essenciais ao cache
            return cache.addAll(CACHE_URLS);
        })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Remove caches antigos que não são mais necessários
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Estratégia de Cache com Fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(
        // Primeiro tenta responder do cache
        caches.match(event.request).then((cachedResponse) => {
            // Se o recurso estiver no cache, retorna do cache
            if (cachedResponse) {
                return cachedResponse;
            }
            // Se não estiver no cache, busca na rede (estratégia "network-first" para recursos dinâmicos)
            return fetch(event.request).then((response) => {
                // Verifica se a resposta é válida
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Clona a resposta para salvar no cache
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});
