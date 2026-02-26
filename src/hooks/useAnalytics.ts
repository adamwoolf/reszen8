// src/hooks/useAnalytics.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GA_ID } from "../utils/analytics";
import { useAuth } from "../contexts/AuthContext";

export function useAnalytics() {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    // if(!currentUser?.consents?.analytics) return

    if (window.gtag) {
      window.gtag("config", GA_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }
  }, [location, currentUser?.consents]);
}
