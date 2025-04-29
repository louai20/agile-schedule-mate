import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure your path alias is set up if you use it
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add the server proxy configuration here
  server: {
    proxy: {
      // Proxy requests starting with /timefold-api
      '/timefold-api': {
        // Target the actual backend URL
        target: 'https://thick-susann-timfold-95233258.koyeb.app',
        // Change origin to true - needed for virtual hosted sites
        changeOrigin: true,
        // Rewrite the path: remove '/timefold-api' before sending to target
        rewrite: (path) => path.replace(/^\/timefold-api/, ''),
      },
      // You could add other proxies here if needed
    }
  }
})
