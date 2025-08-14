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

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: any) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, firstName: string, surName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  resetPassword: (email: string) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addOrUpdate } = useFirebaseDatabase("USERS") || {};
  const { sendMail } = useSendMail();
  const clearError = useCallback(() => setError(null), []);

  const USER_CACHE_KEY = "currentUserDoc";

  async function getUserByUidField(uid: string) {
    const usersRef = ref(db, "USERS");
    const q = query(usersRef, orderByChild("uid"), equalTo(uid));

    try {
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        const firstKey = Object.keys(usersObj)[0];
        console.log(firstKey);
        return usersObj[firstKey];
      }
    } catch (err) {
      console.warn("Firebase get() failed, probably offline:", err);
    }

    // Fallback to cached merged user
    const cached = localStorage.getItem(USER_CACHE_KEY);
    console.log("offline fallback cache:", cached);
    return cached ? JSON.parse(cached) : null;
  }

  useEffect(() => {
    setLoading(true);

    if (!navigator.onLine) {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        console.log("Offline: loading cached user", JSON.parse(cached));
        setCurrentUser(JSON.parse(cached));
      } else {
        console.log("Offline: no cached user, fallback to basic auth user");
      }
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user signed in
        localStorage.removeItem(USER_CACHE_KEY);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Try to get the user's DB data (online)
        const userDoc = await getUserByUidField(user.uid);
        const mergedUser = userDoc ? { ...user, ...userDoc } : user;

        // Cache merged user for offline use
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mergedUser));

        setCurrentUser(mergedUser);
      } catch (err) {
        // Offline fallback: load last cached user
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = useCallback(
    async (email: string, password: string, firstName: string, surName: string) => {
      try {
        setLoading(true);
        clearError();

        await createUserWithEmailAndPassword(auth, email, password);

        const firebaseId = Date.now().toString();
        await addOrUpdate?.(firebaseId, {
          email,
          firebaseId,
          firstName,
          surName,
          subscription: {
            hasCompletedTrial: false,
            subscription: "free-trial",
            duration: 7,
            startDate: Date.now(),
          },
          purchasedItems: [{ name: "Free Trial", price: 0, purchasedDate: Date.now() }],
        });

        sendMail(`Welcome, ${firstName} ${surName}`, "Welcome to your RESZEN8 Free Trial!", email);
        sendMail(
          `${firstName} just started a free trial`,
          `New user: ${firstName} ${surName} (${email})`,
          "connect@reszen8.com"
        );
      } catch (err: any) {
        setError(err?.message || "Failed to create an account");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addOrUpdate, sendMail]
  );

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      clearError();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err?.message || "Failed to log in");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
      localStorage.removeItem("offlineUser");
    } catch (err: any) {
      setError(err?.message || "Failed to log out");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      clearError();
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err?.message || "Failed to send password reset email");
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    login,
    signup,
    logout,
    loading,
    error,
    clearError,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
