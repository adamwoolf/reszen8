import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reduxStore } from "./store/reduxStore";
import { Provider } from "react-redux";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_BASE_URL,
  response_type: "code",
  scope: "phone openid email profile",
  automaticSilentRenew: true,
  // Store user in localStorage instead of sessionStorage for persistence across tabs
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then((registration) => {
//         console.log("Service Worker registered with scope:", registration.scope);
//       })
//       .catch((err) => {
//         console.error("Service Worker registration failed:", err);
//       });
//   });
// }

// export function restoreOfflineUser(dispatch: any) {
//   if (!navigator.onLine) {
//     const saved = localStorage.getItem("offlineUser");
//     if (saved) {
//       const userData = JSON.parse(saved);
//       // Set your Redux/Zustand state here
//       dispatch({
//         type: "auth/loginSuccess",
//         payload: userData,
//       });
//     }
//   }
// }

// restoreOfflineUser(reduxStore.dispatch);

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <Provider store={reduxStore}>
        <App />
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);
