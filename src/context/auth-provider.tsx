
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { ref, get } from 'firebase/database';

// Represents the data structure for a user in the Realtime Database
export type UserData = {
    uid: string;
    email: string;
    displayName: string;
    createdAt: string;
};

type AuthContextType = {
    user: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);
                // User is signed in, now fetch their data from Realtime Database
                const userRef = ref(db, `users/${user.uid}`);
                try {
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        setUserData(snapshot.val() as UserData);
                    } else {
                        // This case can happen if the user was created in Auth but not in DB
                        // Or if the data is not yet replicated. We can retry or warn.
                        console.warn(`No user data found in Realtime Database for uid: ${user.uid}. A default object will be used.`);
                        // Create a fallback userData object to prevent parts of the UI from breaking
                        setUserData({
                            uid: user.uid,
                            email: user.email || "No email",
                            displayName: user.displayName || "User",
                            createdAt: new Date().toISOString()
                        });
                    }
                } catch (error) {
                     console.error("Error fetching user data from Realtime Database:", error);
                     setUserData(null);
                }
            } else {
                // User is signed out
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const value = useMemo(() => ({ user, userData, loading }), [user, userData, loading]);

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
