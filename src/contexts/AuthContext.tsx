import { createContext, useContext, useState, useEffect, useCallback } from "react";

import { User } from "../models";
import { useAuth as useAwsAuth } from "react-oidc-context";
import { AWS_DB_ENDPOINT } from "../constants";

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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const awsAuth = useAwsAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // NEW
  useEffect(() => {
    setLoading(true);
    // console.log(awsAuth);
    const fetchUser = async () => {
      if (awsAuth.isAuthenticated && awsAuth.user?.profile?.sub) {
        const res = await fetch(`${AWS_DB_ENDPOINT}/GetUser?uid=${awsAuth.user.profile.sub}`);
        const data = await res.json();
        // console.log(data);
        setCurrentUser(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [awsAuth]);

  const signOutRedirect = (e) => {
    e.preventDefault();
    const clientId = "the72up8nv2sbq9tea7v5f0ai";
    const logoutUri = import.meta.env.VITE_BASE_URL; // must match Cognito allowed sign-out URLs
    const cognitoDomain = "https://eu-north-1yhww2guih.auth.eu-north-1.amazoncognito.com";

    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    console.log("🔐 Logout requested");
    console.log("Logout URL:", logoutUrl);

    // Navigate to Cognito
    window.location.assign(logoutUrl);
  };

  const updateUser = async (uid: string, updates: any) => {
    try {
      const response = await fetch(`${AWS_DB_ENDPOINT}/UpdateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          ...updates, // e.g., { subscription: "premium", favourites: {...} }
        }),
      });
      console.log("RESPONSE", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Updated user:", data.updatedUser);
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
