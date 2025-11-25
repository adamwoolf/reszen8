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
  const [initialized, setInitialized] = useState(false); // Track if initial auth check is complete
  const [error, setError] = useState<string | null>(null);
  const subscriptionTiers = useSelector((state) => state.content.membershipTiers);
  const clearError = useCallback(() => setError(null), []);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

  // Fetch app user whenever Cognito session changes
  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Auth state:', {
        isAuthenticated: awsAuth.isAuthenticated,
        isLoading: awsAuth.isLoading,
        hasUser: !!awsAuth.user,
        userSub: awsAuth.user?.profile?.sub,
        initialized
      });

      // Wait for AWS auth to finish loading before making decisions
      if (awsAuth.isLoading) {
        console.log('⏳ AWS auth still loading, waiting...');
        return;
      }

      console.log('✅ AWS auth loaded, checking authentication...');

      if (!awsAuth.isAuthenticated || !awsAuth.user?.profile?.sub) {
        console.log('❌ Not authenticated or no user sub');
        setCurrentUser(null);
        setInitialized(true); // Mark as initialized even if not authenticated
        return;
      }

      console.log('✅ Authenticated, fetching user data...');
      try {
        const res = await fetch(`${AWS_DB_ENDPOINT}/GetUser?uid=${awsAuth.user.profile.sub}`);
        if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
        const data = await res.json();
        console.log('✅ User data fetched:', data?.email);
        setCurrentUser(data);
      } catch (err) {
        console.error('❌ User fetch error:', err);
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
    }),
    [currentUser, loading, error, clearError, updateUser, signOutRedirect]
  );

  console.log('📊 Context state:', { loading, initialized, isAuthenticated: awsAuth.isAuthenticated, hasUser: !!currentUser });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
