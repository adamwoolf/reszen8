import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { User } from "../models";
import { useAuth as useAwsAuth } from "react-oidc-context";
import { AWS_DB_ENDPOINT } from "../constants";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";

interface UserUpdates {
  firstName?: string;
  surName?: string;
  email?: string;
  savedItems?: unknown;
  basket?: unknown;
  subscription?: Partial<User["subscription"]>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const awsAuth = useAwsAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionTiers = useSelector((state) => state.content.membershipTiers);
  const clearError = useCallback(() => setError(null), []);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

  // 1️⃣ Restore Cognito session on mount (once)
  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      try {
        await awsAuth.signinSilent().catch(() => {
          // no session exists
        });
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []); // ✅ empty array ensures it runs only once

  // 2️⃣ Fetch app user whenever Cognito session changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!awsAuth.isAuthenticated || !awsAuth.user?.profile?.sub) {
        setCurrentUser(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${AWS_DB_ENDPOINT}/GetUser?uid=${awsAuth.user.profile.sub}`);
        if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        setCurrentUser(null);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [awsAuth.isAuthenticated, awsAuth.user?.profile?.sub]);

  useEffect(() => {
    setLoading(awsAuth.isLoading);
  }, [awsAuth.isLoading]);

  // // Signup new user directly to paid sub
  useEffect(() => {
    if (awsAuth.isAuthenticated) {
      const user = awsAuth.user?.profile;

      const planId = sessionStorage.getItem("pendingPlan");
      const selectedPlan = subscriptionTiers?.find((tier) => tier.id === planId);

      const selectedSubData = {
        hasCompletedTrial: true,
        meditationCredits: selectedPlan?.medCredits,
        size: selectedPlan?.billing,
        subId: selectedPlan?.id,
        planName: selectedPlan?.title,
        extraBespokeMeditationCredits: 0,
      };

      if (planId && user && selectedPlan) {
        checkoutNewUserPlan(user, selectedPlan, selectedSubData);
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

  const checkoutNewUserPlan = async (
    user: CognitoUserProfile,
    selectedPlan: SubscriptionPlan,
    selectedSubData: SubscriptionData
  ) => {
    const res = await fetch(`${AWS_DB_ENDPOINT}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "subscription",
        email: user.email,
        firstName: user.given_name,
        lastName: user.family_name,
        uid: user.sub,
        metadata: { uid: currentUser?.uid },
        lineItems: [{ price: selectedPlan.priceId, quantity: 1 }],
        subscription: selectedSubData,
      }),
    });
    const data = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
  };

  const signOutRedirect = useCallback(async () => {
    const clientId = "the72up8nv2sbq9tea7v5f0ai";
    const logoutUri = import.meta.env.VITE_BASE_URL;
    const cognitoDomain = "https://eu-north-1yhww2guih.auth.eu-north-1.amazoncognito.com";

    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    setLoading(true);
    await awsAuth.removeUser();
    window.location.replace(logoutUrl);
  }, [awsAuth]);

  const updateUser = useCallback(
    async (uid: string, updates: UserUpdates): Promise<User | null> => {
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
    },
    []
  );

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      loading,
      error,
      clearError,
      updateUser,
      signOutRedirect,
    }),
    [currentUser, loading, error, clearError, updateUser, signOutRedirect]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
