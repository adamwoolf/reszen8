import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { User } from "../models";
import { useAuth as useAwsAuth } from "react-oidc-context";
import { AWS_DB_ENDPOINT } from "../constants";
import { useSelector, useDispatch } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { getUser } from "../store/apiUtils";
import { TENANT_CONFIG } from "../tentantConfig";

interface UserUpdates {
  firstName?: string;
  surName?: string;
  email?: string;
  savedItems?: unknown;
  basket?: unknown;
  subscription?: Partial<User["subscription"]>;
  activity?: unknown;
  [key: string]: unknown;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  updateUser: (id: string, update: UserUpdates) => Promise<User | null>;
  signOutRedirect: () => void;
  isEnterprise: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const awsAuth = useAwsAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false); // Track if initial auth check is complete
  const [error, setError] = useState<string | null>(null);
  const subscriptionTiers = useSelector((state) => state.content.membershipTiers);
  const clearError = useCallback(() => setError(null), []);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
  const [isEnterprise, setIsEnterprise] = useState(false);
  // Clear storage when returning from logout
  useEffect(() => {
    const loggingOut = sessionStorage.getItem("logging_out");
    if (loggingOut === "true") {
      // Clear all localStorage (this removes OIDC tokens)
      localStorage.clear();

      // Clear all sessionStorage (including the logging_out flag)
      sessionStorage.clear();

      // Clear current user state
      setCurrentUser(null);
    }
  }, []);

  // Fetch app user whenever Cognito session changes
  useEffect(() => {
    const fetchUser = async () => {
      // Wait for AWS auth to finish loading before making decisions
      if (awsAuth.isLoading) {
        return;
      }

      if (!awsAuth.isAuthenticated || !awsAuth.user?.profile?.sub) {
        setCurrentUser(null);
        setInitialized(true); // Mark as initialized even if not authenticated
        return;
      }

      try {
        const res = await fetch(`${AWS_DB_ENDPOINT}/GetUser?uid=${awsAuth.user.profile.sub}`);

        if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
        const data = await res.json();
        setCurrentUser(data);
        console.log(data);
      } catch (err) {
        setCurrentUser(null);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
        setError(errorMessage);
      } finally {
        setInitialized(true); // Mark as initialized after fetch attempt
      }
    };

    fetchUser();
  }, [awsAuth.isAuthenticated, awsAuth.user?.profile?.sub, awsAuth.isLoading]);

  // // Signup new user directly to paid sub
  useEffect(() => {
    if (awsAuth.isAuthenticated) {
      console.log("authenticated");
      const user = awsAuth.user?.profile;

      const planId = sessionStorage.getItem("pendingPlan");

      const isTrial = planId === "free-trial";

      const selectedPlan = subscriptionTiers?.find((tier) => tier.id === planId);

      const selectedSubData = {
        hasCompletedTrial: isTrial ? false : true,
        meditationCredits: selectedPlan?.medCredits || selectedPlan?.meditationCredits,
        size: selectedPlan?.billing,
        subId: selectedPlan?.id,
        planName: selectedPlan?.title,
        extraBespokeMeditationCredits: 0,
        planCredits: selectedPlan?.meditationCredits,
      };

      if (planId && user && (selectedPlan || isTrial)) {
        checkoutNewUserPlan(user, selectedPlan, selectedSubData, isTrial);
        sessionStorage.removeItem("pendingPlan");
      }
    }
  }, [awsAuth.isAuthenticated, subscriptionTiers]);

  interface CognitoUserProfile {
    email?: string;
    given_name?: string;
    family_name?: string;
    sub: string;
  }

  interface SubscriptionPlan {
    id: string;
    priceId: string;
    medCredits?: number;
    billing?: string;
    title?: string;
  }

  interface SubscriptionData {
    hasCompletedTrial: boolean;
    meditationCredits?: number;
    size?: string;
    subId: string;
    planName?: string;
    extraBespokeMeditationCredits: number;
  }

  //

  const checkoutNewUserPlan = async (
    user: CognitoUserProfile,
    selectedPlan: SubscriptionPlan,
    selectedSubData: SubscriptionData,
    trialSignup: boolean,
  ) => {
    const mode = trialSignup ? "payment" : "subscription";

    const body = {
      mode,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      uid: user.sub,
      metadata: {
        uid: user.sub,
        planName: selectedPlan.title,
        meditationCredits: trialSignup ? "5" : "10",
      },
      lineItems: [{ price: selectedPlan.priceId, quantity: 1 }],
      subscription: selectedSubData,
      planId: trialSignup ? "free-trial" : selectedPlan.priceId,
    };

    const res = await fetch(`${AWS_DB_ENDPOINT}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
  };

  const signOutRedirect = useCallback(() => {
    // Set a flag in sessionStorage BEFORE redirecting
    // This will survive the redirect and tell us to clear storage when we return
    sessionStorage.setItem("logging_out", "true");

    // Use the actual client ID from the OIDC config
    const clientId = awsAuth.settings.client_id;
    const logoutUri = window.location.origin;

    // Construct the correct Cognito logout domain from the authority
    // Authority format: https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ggtKgQ7DR
    // Logout domain format: https://eu-north-1ggtkgq7dr.auth.eu-north-1.amazoncognito.com
    const authority = awsAuth.settings.authority;
    const userPoolId = authority?.split("/").pop() || "";
    const region = authority?.match(/cognito-idp\.([^.]+)/)?.[1] || "eu-north-1";
    const domainPrefix = userPoolId.toLowerCase().replace(/_/g, "");
    const cognitoDomain = `https://${domainPrefix}.auth.${region}.amazoncognito.com`;

    // Redirect to Cognito logout endpoint
    // This will clear the Cognito session and redirect back to the app
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    window.location.href = logoutUrl;
  }, [awsAuth]);

  const updateUser = useCallback(async (uid: string, updates: UserUpdates): Promise<User | null> => {
    try {
      const response = await fetch(`${AWS_DB_ENDPOINT}/UpdateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, ...updates }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.updatedUser;
    } catch (err) {
      return null;
    }
  }, []);

  // Compute loading state: we're loading if AWS is loading OR we haven't initialized yet
  const loading = awsAuth.isLoading || !initialized;

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      loading,
      error,
      clearError,
      updateUser,
      signOutRedirect,
      isEnterprise,
    }),
    [currentUser, loading, error, clearError, updateUser, signOutRedirect, isEnterprise],
  );

  function decodeJWT(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  }

  function getTenantFromQuery(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get("tenant");
  }

  // Enterprise Login
  useEffect(() => {
    if (!window.Reszen8Config) return;
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin.includes("stripe")) return;
      const tenant = getTenantFromQuery() || window.Reszen8Config.tenant; // read on mount

      const config = TENANT_CONFIG[tenant];
      if (Object.values(config).length) setIsEnterprise(true);

      if (event.data?.type === "AUTH_TOKEN") {
        if (!config.userLogin) return;
        const decoded = decodeJWT(event.data.token);
        const user = await getUser(decoded.uid);
        if (user) {
          setCurrentUser(user);
        }
        // TODO:
        // 1. Store token in memory / context
        // 2. Mark user as authenticatedp
        // 3. Skip login screen
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
