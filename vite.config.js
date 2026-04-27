import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // PWA化 — Service Worker + manifest 自動生成（仕様書 Phase5 §2）
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '三姉妹タスク',
        short_name: '三姉妹タスク',
        description: '三姉妹と一緒に使うタスク管理アプリ',
        theme_color: '#3a7ca5',
        background_color: '#faf8f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // Firestore API — ネットワーク優先（NetworkFirst）
            urlPattern: /^https:\/\/firestore\.googleapis\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache' },
          },
          {
            // Firebase Auth / Storage API — ネットワーク優先
            urlPattern: /^https:\/\/.*\.googleapis\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' },
          },
          {
            // 静的アセット — キャッシュ優先（CacheFirst）
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'assets-cache', expiration: { maxEntries: 100 } },
          },
        ],
        // オフラインフォールバック
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  build: {
    // Firebase modular SDK は元から大きいためしきい値を引き上げる
    chunkSizeWarningLimit: 1000,
  },
})
