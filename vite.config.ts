import { build, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { analyzer } from 'vite-bundle-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    svgr(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
    analyzer({
      analyzerMode: 'static',
    }),
    [{
      name: "service-worker",
      load(id) {
        if (id === "/service-worker.js") {
          return `import "@/server/"`;
        }
      },
    }]
  ],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        serverWorker: path.resolve(__dirname, 'src/server/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "serverWorker") {
            return "service-worker.js";
          }
          return 'assets/[name]-[hash].js';
        },
      }
    },
  },
});
