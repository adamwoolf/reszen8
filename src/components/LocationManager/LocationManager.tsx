import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLocationAllowed } from "../../store/contentSlice";
import LocationBlocked from "../../pages/LocationBlocked/LocationBlocked";

/**
 * Detects the user's country code using ipwhois.io
 * @returns {Promise<string | null>} ISO country code (e.g., "GB") or null on failure
 */
/**
 * Detects the user's country code using ipwhois.io and caches it in sessionStorage
 * @returns {Promise<string | null>} ISO country code (e.g., "GB") or null on failure
 */
export const getUserCountry = async (): Promise<string | null> => {
  try {
    // 1️⃣ Check sessionStorage first
    const cachedCountry = sessionStorage.getItem("countryCode");
    if (cachedCountry) {
      console.log("Using cached country code:", cachedCountry);
      return cachedCountry;
    }

    // 2️⃣ Fetch from ipwhois.io
    const res = await fetch("https://ipwhois.app/json/");
    if (!res.ok) throw new Error(`IPWHOIS request failed: ${res.status}`);

    const data = await res.json();
    const countryCode = data?.country_code || null;

    // 3️⃣ Store in sessionStorage
    if (countryCode) {
      sessionStorage.setItem("countryCode", countryCode);
    }

    console.log("Detected country code:", countryCode);
    return countryCode;
  } catch (err) {
    console.error("Failed to detect country via IPWHOIS:", err);
    return null;
  }
};

const LocationManager = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allowed, setAllowed] = useState<boolean | null>(null); // null = not checked yet

  useEffect(() => {
    const checkLocation = async () => {
      let countryCode = await getUserCountry();

      console.log("Detected country code:", countryCode);

      if (countryCode !== "GB" && !window.location.href.includes("localhost")) {
        setAllowed(false);
        dispatch(setLocationAllowed(false));
        // navigate("./location-blocked");
      } else {
        setAllowed(true);
        dispatch(setLocationAllowed(true));
      }
    };

    checkLocation();
  }, [dispatch, navigate]);

  if (!allowed) return <LocationBlocked />;

  return <div>{children}</div>;
};

export default LocationManager;
