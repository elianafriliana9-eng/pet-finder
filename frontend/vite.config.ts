import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'favicon.png',
        'logo.png',
        'pwa-icon.svg',
        'pwa-64x64.png',
        'pwa-128x128.png',
        'pwa-192x192.png',
        'pwa-256x256.png',
        'pwa-384x384.png',
        'pwa-512x512.png',
        'pwa-maskable-192x192.png',
        'pwa-maskable-512x512.png',
        'apple-touch-icon.png',
        'robots.txt',
        'sitemap.xml'
      ],
      manifest: {
        name: 'StreetPet — Rescue & Adopsi Hewan Jalanan',
        short_name: 'StreetPet',
        description: 'Platform Terbuka Penyelamatan, Street-Feeding, dan Adopsi Anabul Terlantar',
        theme_color: '#47acd7',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['social', 'lifestyle', 'community'],
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-256x256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Jelajah Peta Anabul',
            short_name: 'Peta',
            description: 'Buka peta real-time anabul terdekat',
            url: '/explore',
            icons: [{ src: '/logo.png', sizes: '96x96' }]
          },
          {
            name: 'Laporkan Temuan Hewan',
            short_name: 'Lapor',
            description: 'Kirim laporan titik lokasi penemuan anabul',
            url: '/report',
            icons: [{ src: '/logo.png', sizes: '96x96' }]
          },
          {
            name: 'Direktori Shelter',
            short_name: 'Shelter',
            description: 'Lihat daftar shelter terverifikasi',
            url: '/shelters',
            icons: [{ src: '/logo.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            // Cache OpenStreetMap & CartoDB Tiles for Offline Map Browsing
            urlPattern: /^https:\/\/[a-c]\.basemaps\.cartocdn\.com\/.*|^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'carto-osm-map-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Year
              }
            }
          },
          {
            // Cache Unsplash Images
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'unsplash-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 3 // 3 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache API Discovery Reports with NetworkFirst/StaleWhileRevalidate
            urlPattern: /\/api\/(reports|shelters|ads).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 15 // 15 Mins
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      }
    }
  }
})
