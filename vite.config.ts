import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { prerender } from "./scripts/prerender";
import { markdownTree } from "./scripts/markdownTree";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // the prerendered footer's year (Footer.tsx); the live page reads the clock
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: [
        '**/coverage/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/__tests__/**'
      ]
    },
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    markdownTree(),
    prerender(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    }
  },
}));
