import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { ref, set, onDisconnect } from 'firebase/database';
import { auth, database } from '../lib/firebase';

interface AuthContextValue {
  currentUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_TIMEOUT_MS = 10_000;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start a 10-second timeout — if Firebase hasn't responded by then,
    // default to unauthenticated so the app doesn't hang on the loading screen.
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setCurrentUser(null);
    }, AUTH_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeoutId);
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Set user presence
        const userRef = ref(database, `users/${user.uid}`);
        const statusRef = ref(database, `users/${user.uid}/status`);

        // Set online status
        set(userRef, {
          email: user.email,
          status: 'online',
          lastSeen: Date.now(),
        });

        // Handle disconnect
        onDisconnect(statusRef).set('offline');
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  function login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout(): Promise<void> {
    if (currentUser) {
      const statusRef = ref(database, `users/${currentUser.uid}/status`);
      await set(statusRef, 'offline');
    }
    return signOut(auth);
  }

  function sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  }

  const value: AuthContextValue = {
    currentUser,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
