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
  // frappe-ui imports virtual ~icons/lucide/* modules that esbuild's
  // pre-bundler can't resolve; leave them external so Vite resolves them
  // through frappe-ui's lucide plugin when serving the bundle.
  optimizeDeps: {
    // CommonJS deps imported from frappe-ui's .vue sources
    include: ['feather-icons', 'socket.io-client'],
    esbuildOptions: {
      plugins: [
        {
          name: 'external-virtual-icons',
          setup(build) {
            build.onResolve({ filter: /^~icons\// }, (args) => ({
              path: args.path,
              external: true,
            }))
          },
        },
      ],
    },
  },
})
