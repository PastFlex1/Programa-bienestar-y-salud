
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Represents the data structure for a user in Firestore
export type UserData = {
    uid: string;
    email: string;
    displayName: string;
    createdAt: any; // Firestore timestamp
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
                // User is signed in, now fetch their data from Firestore
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                } else {
                    // This case might happen if the Firestore doc creation failed
                    // or for users created before the logic was in place.
                    console.warn(`No user document found in Firestore for uid: ${user.uid}`);
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
