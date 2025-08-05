
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { getSession } from '@/lib/firebase/auth'; // We'll create this function

type User = {
  isLoggedIn: boolean;
  email: string;
  name: string;
} | null;

type AuthContextType = {
    user: User;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const session = await getSession();
                if (session) {
                    setUser({
                        isLoggedIn: true,
                        email: session.email as string,
                        name: session.name as string
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch session", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    const value = useMemo(() => ({ user, loading }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
