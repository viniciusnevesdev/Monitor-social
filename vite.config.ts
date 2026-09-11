import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'beta-icon-v1.4.0-beta.2-favicon.png',
          'beta-icon-v1.4.0-beta.2-apple.png',
          'beta-icon-v1.4.0-beta.2-192.png',
          'beta-icon-v1.4.0-beta.2-512.png',
          'beta-icon-v1.4.0-beta.2-maskable.png',
        ],
        manifest: {
          id: '/',
          name: 'Monitor de Interações Sociais',
          short_name: 'SocialSync',
          description: 'PWA de monitoramento de interações sociais, cálculo de intimidade e priorização de contatos negligenciados.',
          theme_color: '#3685f5',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/beta-icon-v1.4.0-beta.2-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/beta-icon-v1.4.0-beta.2-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/beta-icon-v1.4.0-beta.2-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
