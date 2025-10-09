// src/hooks/useAnalytics.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GA_ID } from "../utils/analytics";

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", GA_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
}
