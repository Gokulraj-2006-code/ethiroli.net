import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { existsSync } from 'fs'

// Custom plugin to route deep links (/app/*, /auth/*, ...) to the matching
// portal html in dev mode, e.g. /app/tutor/dashboard -> /tutor.html.
const ROLE_HTML = [
  ['/activate', '/employee.html'],
  ['/app/super-admin', '/super-admin.html'],
  ['/app/manager', '/pm.html'],
  ['/app/pm', '/pm.html'],
  ['/app/hr', '/hr.html'],
  ['/auth/super-admin', '/super-admin.html'],
  ['/auth/manager', '/pm.html'],
  ['/auth/pm', '/pm.html'],
  ['/auth/hr', '/hr.html'],
  ['/auth/employee', '/employee.html'],
  ['/app/', '/employee.html'],
  ['/auth/', '/employee.html'],
  ['/intern', '/employee.html'],
  ['/employee', '/employee.html'],
  ['/manager', '/pm.html'],
  ['/hr', '/hr.html'],
  ['/super-admin', '/super-admin.html'],
  ['/dashboard', '/employee.html'],
];

const roleEntryHtml = (url) => {
  const hit = ROLE_HTML.find(([prefix]) => url.startsWith(prefix));
  return hit ? hit[1] : '/employee.html';
};

const multiPageRewritePlugin = () => ({
  name: 'multi-page-rewrite',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url ? req.url.split('?')[0] : '';
      const rolePaths = ['/activate', '/app', '/admin', '/auth', '/dashboard', '/intern', '/student', '/employee', '/finance', '/sales', '/reception', '/tutor'];
      if (rolePaths.some((path) => url.startsWith(path)) && !url.includes('.')) {
        req.url = roleEntryHtml(url);
      }
      next();
    });
  },
});

const relativePathFallbackPlugin = () => ({
  name: 'relative-path-fallback',
  resolveId(source, importer) {
    if (!importer) return null;
    const targets = ['common', 'services', 'modules', 'roles', 'store', 'components', 'styles', 'utils'];
    for (const target of targets) {
      const regex = new RegExp(`^(\\.\\.\\/)+${target}\\/(.*)`);
      const match = source.match(regex);
      if (match) {
        const directResolve = resolve(dirname(importer), source);
        const exists = existsSync(directResolve) ||
          existsSync(`${directResolve}.jsx`) ||
          existsSync(`${directResolve}.js`) ||
          existsSync(resolve(directResolve, 'index.jsx')) ||
          existsSync(resolve(directResolve, 'index.js'));
        if (!exists) {
          const canonical = resolve(process.cwd(), `src/${target}`, match[2]);
          return this.resolve(canonical, importer, { skipSelf: true });
        }
      }
    }
    return null;
  },
});

export default defineConfig({
  plugins: [react(), multiPageRewritePlugin(), relativePathFallbackPlugin()],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: true,  // WebSocket support
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Ensure credentials are sent
            proxyReq.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        }
      }
    }
  },
  build: {
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        'super-admin': resolve(process.cwd(), 'super-admin.html'),
        'hr': resolve(process.cwd(), 'hr.html'),
        'manager': resolve(process.cwd(), 'pm.html'),
        'employee': resolve(process.cwd(), 'employee.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('react-router') || id.includes('react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'vendor-redux';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('socket.io-client') || id.includes('axios')) {
              return 'vendor-network';
            }
          }
        },
      },
    },
  },
})
