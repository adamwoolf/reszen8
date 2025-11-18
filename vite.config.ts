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
      chunkSizeWarningLimit: 500, // Restore proper limit to catch large chunks
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            react: ["react", "react-dom", "react-router-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            stripe: ["@stripe/stripe-js", "@stripe/react-stripe-js"],
            aws: ["aws-amplify", "@aws-amplify/ui-react", "@aws-sdk/client-cognito-identity-provider"],
            ui: ["framer-motion", "@mui/icons-material", "@heroicons/react", "react-icons", "@mdi/react"],
            contentful: ["contentful"],
            utils: ["axios", "uuid", "marked", "howler"],
          },
        },
      },
    },
    // Fix for HMR
    optimizeDeps: {
      exclude: ["js-big-decimal"],
    },
  };
});
