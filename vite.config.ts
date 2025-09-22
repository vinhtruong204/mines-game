import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'https://mngs.nasisoto.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
