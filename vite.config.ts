import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // Note: Vite automatically exposes VITE_* env variables to the client via import.meta.env
    // No need to manually define them here
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://localhost:3002",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
      // Handle client-side routing
      historyApiFallback: true,
      // Allow connections from local network
      host: true,
      // Enable CORS
      cors: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      // Fix for chunk size warning
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          // manualChunks: {
          //   react: ["react", "react-dom", "react-router-dom"],
          //   stripe: ["@stripe/stripe-js", "@stripe/react-stripe-js"],
          // },
        },
      },
    },
    // Fix for HMR
    optimizeDeps: {
      exclude: ["js-big-decimal"],
    },
  };
});
