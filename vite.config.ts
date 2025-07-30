import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'GolfDuell MVP',
        short_name: 'GolfDuell',
        description: 'Asynchronous golf duels between friends',
        theme_color: '#1976D2',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
})
