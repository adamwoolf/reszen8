import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reduxStore } from "./store/reduxStore";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

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

export function restoreOfflineUser(dispatch: any) {
  if (!navigator.onLine) {
    const saved = localStorage.getItem("offlineUser");
    if (saved) {
      const userData = JSON.parse(saved);
      // Set your Redux/Zustand state here
      dispatch({
        type: "auth/loginSuccess",
        payload: userData,
      });
    }
  }
}

restoreOfflineUser(reduxStore.dispatch);

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={reduxStore}>
      <App />
    </Provider>
  </React.StrictMode>
);
