
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase/config";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Define the User object structure
export type User = {
    id: string; // Firestore document ID
    name: string;
    email: string;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthProviderState = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (name: string, email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (user: User) => void;
};

const initialState: AuthProviderState = {
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: () => {},
  updateUser: () => {},
};

const AuthProviderContext = React.createContext<AuthProviderState>(initialState);

const USER_STORAGE_KEY = 'zenith-auth-user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
        const usersRef = collection(db, "users");
        // NOTE: In a real app, you would hash the password. Here we store it as plain text for simplicity.
        const q = query(usersRef, where("email", "==", email), where("password", "==", pass));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No matching user found.");
            return null;
        }

        const userDoc = querySnapshot.docs[0];
        const userData: User = {
            id: userDoc.id,
            name: userDoc.data().name,
            email: userDoc.data().email,
        };

        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error("Login error:", error);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
        // Check if user already exists
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log("Email already exists.");
            return null;
        }

        // Create new user
        const docRef = await addDoc(collection(db, "users"), {
            name: name,
            email: email,
            password: pass, // Storing password in plain text. NOT FOR PRODUCTION.
            createdAt: new Date(),
        });
        
        const newUser: User = { id: docRef.id, name, email };
        // We don't set the user here, we let them log in.
        return newUser;
    } catch (error) {
        console.error("Registration error:", error);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    router.push('/auth/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthProviderContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
