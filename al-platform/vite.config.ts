import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split the bundle so the browser can cache the stable parts. React barely changes;
        // the SRD/authored data changes rarely; app code changes constantly. Shipping them
        // as one file means every code edit re-downloads all of it.
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("/src/data/") || id.includes("/src/bastion/registry")) return "content";
        },
      },
    },
  },
  plugins: [react()],
})
