import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'

export default defineConfig({
  plugins: [
    frappeui({
      frontendRoute: '/awan',
      frappeProxy: { port: 8080 },
      buildConfig: {
        outDir: '../awan_care/public/frontend',
        baseUrl: '/assets/awan_care/frontend/',
        indexHtmlPath: '../awan_care/www/awan.html',
      },
    }),
    vue(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
