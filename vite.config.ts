import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
// import vitePluginRequire from "vite-plugin-require";

export default defineConfig({
  plugins: [react()],
});
// // https://vite.dev/config/
// export default defineConfig(({ mode }) => {
//   // Load env file based on `mode` in the current directory.
//   const env = loadEnv(mode, process.cwd(), '');

//   return {
//     plugins: [react()],
//     resolve: {
//       alias: {
//         '@': fileURLToPath(new URL('./src', import.meta.url))
//       }
//     },
//     // Expose .env variables to the client
//     define: {
//       'process.env': {
//         VITE_STRIPE_PUBLIC_KEY: JSON.stringify(env.VITE_STRIPE_PUBLIC_KEY),
//         VITE_OPENAI_API_KEY: JSON.stringify(env.VITE_OPENAI_API_KEY)
//       }
//     },
//     server: {
//       port: 5173,
//       strictPort: true,
//       proxy: {
//         '/api': {
//           target: 'http://localhost:3001',
//           changeOrigin: true,
//           secure: false,
//           rewrite: (path) => path.replace(/^\/api/, '/api')
//         }
//       },
//       // Handle client-side routing
//       historyApiFallback: true,
//       // Allow connections from local network
//       host: true,
//       // Enable CORS
//       cors: true
//     },
//     build: {
//       outDir: 'dist',
//       sourcemap: true,
//       // Fix for chunk size warning
//       chunkSizeWarningLimit: 1600,
//       rollupOptions: {
//         output: {
//           manualChunks: {
//             react: ['react', 'react-dom', 'react-router-dom'],
//             stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
//           }
//         }
//       }
//     },
//     // Fix for HMR
//     optimizeDeps: {
//       exclude: ['js-big-decimal']
//     }
//   };
// });
