import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
      });
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
      });
  };

  const logout = () => {
    return signOut(auth).then(() => {
      setCurrentUser(null);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
