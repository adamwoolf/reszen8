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

  // Token renewal settings
  automaticSilentRenew: true, // Automatically renew access token before it expires
  silent_redirect_uri: import.meta.env.VITE_BASE_URL, // URI for silent renewal
  accessTokenExpiringNotificationTimeInSeconds: 300, // Notify 5 minutes before expiration

  // Store user in localStorage for persistence across tabs and sessions
  userStore: new WebStorageStateStore({ store: window.localStorage }),

  // Additional settings for better session management
  loadUserInfo: true, // Load user info from the UserInfo endpoint
  monitorSession: false, // Disable session monitoring to prevent automatic logout triggers
};

// restoreOfflineUser(reduxStore.dispatch);

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <Provider store={reduxStore}>
        <App />
      </Provider>
    </AuthProvider>
  </React.StrictMode>,
);
