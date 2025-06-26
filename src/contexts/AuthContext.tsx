import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../firebase";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";
import { User } from "../models";
import useSendMail from "../hooks/useSendEmail";

interface AuthContextType {
  currentUser: User | null;
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

  const { data: users, addOrUpdate } = useFirebaseDatabase("USERS") || {};
  const { sendMail } = useSendMail();

  const clearError = useCallback(() => setError(null), []);

  // State to temporarily hold the Firebase user
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // First effect: store firebase user (no access to Firestore user info yet)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Second effect: combine Firebase user with Firestore data once both are ready
  useEffect(() => {
    if (firebaseUser && users) {
      const authEmail = firebaseUser.email?.toLowerCase();
      const matchedUser = Object.values(users).find((u: any) => u?.email?.toLowerCase() === authEmail);

      const baseUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        emailVerified: firebaseUser.emailVerified,
      };

      if (matchedUser) {
        setCurrentUser({ ...baseUser, ...matchedUser });
      } else {
        console.warn("No matching user found in Firestore for:", authEmail);
        setCurrentUser(baseUser); // fallback if needed
      }

      setLoading(false);
    }
  }, [firebaseUser, users]);

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
    } catch (err: any) {
      setError(err?.message || "Failed to log out");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      clearError();
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    error,
    clearError,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
