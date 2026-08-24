import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '棋盘小游戏',
        short_name: '棋盘小游戏',
        description: '可离线玩耍的棋类小游戏',
        lang: 'zh-CN',
        theme_color: '#5c3d2e',
        background_color: '#1c1008',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
