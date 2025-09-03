import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, db } from "../firebase";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";
import { User } from "../models";
import useSendMail from "../hooks/useSendEmail";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
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

  const { sendMail } = useSendMail();
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

  const signOutRedirect = () => {
    const clientId = "the72up8nv2sbq9tea7v5f0ai";
    const logoutUri = import.meta.env.VITE_BASE_URL; // or your deployed frontend URL
    const cognitoDomain = "https://eu-north-1yhww2guih.auth.eu-north-1.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
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

  // useEffect(() => {
  //   setLoading(true);

  //   if (!navigator.onLine) {
  //     const cached = localStorage.getItem(USER_CACHE_KEY);
  //     if (cached) {
  //       console.log("Offline: loading cached user", JSON.parse(cached));
  //       setCurrentUser(JSON.parse(cached));
  //     } else {
  //       console.log("Offline: no cached user, fallback to basic auth user");
  //     }
  //     return;
  //   }
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (!user) {
  //       // No user signed in
  //       localStorage.removeItem(USER_CACHE_KEY);
  //       setCurrentUser(null);
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       // Try to get the user's DB data (online)
  //       const userDoc = await getUserByUidField(user.uid);
  //       const mergedUser = userDoc ? { ...user, ...userDoc } : user;

  //       // Cache merged user for offline use
  //       localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mergedUser));

  //       setCurrentUser(mergedUser);
  //     } catch (err) {
  //       // Offline fallback: load last cached user
  //     }

  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

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
