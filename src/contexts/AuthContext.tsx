import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../models";
import { useAuth as useAwsAuth } from "react-oidc-context";
import { AWS_DB_ENDPOINT } from "../constants";
import { useSelector } from "react-redux";
import { loadStripe, Stripe } from "@stripe/stripe-js";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: any) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  updateUser: (id: string, update: any) => void;
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
      } catch (err: any) {
        console.error("Failed to fetch user:", err);
        setCurrentUser(null);
        setError(err.message || "Failed to fetch user");
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

      console.log("PLANID", planId);
      if (planId && user && selectedPlan) {
        checkoutNewUserPlan(user, selectedPlan, selectedSubData);
        sessionStorage.removeItem("pendingPlan");
      }
    }
  }, [awsAuth.isAuthenticated, subscriptionTiers]);

  const checkoutNewUserPlan = async (user: any, selectedPlan: any, selectedSubData: any) => {
    const res = await fetch(`${AWS_DB_ENDPOINT}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "subscription",
        email: user.email,
        firstName: user["given_name"],
        lastName: user["family_name"],
        uid: user.sub,
        metadata: { uid: currentUser?.uid },
        lineItems: [{ price: selectedPlan.priceId, quantity: 1 }], // 👈 send array of line items
        subscription: selectedSubData,
      }),
    });
    const data = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
  };

  // ✅ only triggers when auth state changes, no loops

  const signOutRedirect = async () => {
    const clientId = "the72up8nv2sbq9tea7v5f0ai";
    const logoutUri = import.meta.env.VITE_BASE_URL; // must match Cognito allowed sign-out URLs
    const cognitoDomain = "https://eu-north-1yhww2guih.auth.eu-north-1.amazoncognito.com";

    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    setLoading(true);
    await awsAuth.removeUser(); // clear local state
    window.location.replace(logoutUrl); // redirect to Cognito logout
  };

  const updateUser = async (uid: string, updates: any) => {
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
      console.error("Failed to update user:", err);
      return null;
    }
  };

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    clearError,
    updateUser,
    signOutRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
