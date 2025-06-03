import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // type User as FirebaseUser,
  // type UserCredential
} from "firebase/auth";
import { auth } from "../firebase";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";

interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  meditations?: [];

  // Add other user properties as needed
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: users, addOrUpdate } = useFirebaseDatabase("USERS") || [];
  const clearError = useCallback(() => setError(null), []);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          // Add any additional user properties you need
        };
        const currentFromDB = users?.find((u: User) => u.uid === firebaseUser.uid) || {};

        setCurrentUser({ ...currentFromDB, ...user });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [users]);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      await createUserWithEmailAndPassword(auth, email, password);
      // create db entry in USERS for new user
      const firebaseId = Date.now().toString();
      return addOrUpdate(firebaseId, { email, firebaseId });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create an account";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      clearError();
      await signInWithEmailAndPassword(auth, email, password);
      // Note: onAuthStateChanged will update the currentUser
    } catch (error: any) {
      const errorMessage = error.message || "Failed to log in";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Note: onAuthStateChanged will update the currentUser
    } catch (error: any) {
      const errorMessage = error.message || "Failed to log out";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    error,
    clearError,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
