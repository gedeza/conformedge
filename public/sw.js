const CACHE_NAME = "conformedge-v1"
const OFFLINE_URL = "/offline.html"

const PRECACHE_URLS = [
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/images/logo-icon.png",
  "/images/C_Edge_Logo.png",
  OFFLINE_URL,
]

// Install — precache static assets + offline fallback
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Fetch — network-first for API/pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip Clerk auth requests
  if (url.hostname.includes("clerk")) return

  // Skip API routes (always fresh)
  if (url.pathname.startsWith("/api/")) return

  // Static assets — cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Pages — network-first with offline fallback for navigation
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    )
    return
  }

  // Other GET requests — network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response
      })
      .catch(() => caches.match(request))
  )
})
