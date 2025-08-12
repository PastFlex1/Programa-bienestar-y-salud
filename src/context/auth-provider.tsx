
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
    photoURL?: string; // Add photoURL to the type
};

type AuthContextType = {
    user: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
    photoURL: string | null;
    updatePhotoURL: (url: string) => void;
};

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    userData: null, 
    loading: true, 
    photoURL: null, 
    updatePhotoURL: () => {} 
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);
                setPhotoURL(user.photoURL); // Set initial photoURL from auth
                const userRef = ref(db, `users/${user.uid}`);
                try {
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const dbData = snapshot.val() as UserData;
                        setUserData(dbData);
                        if (dbData.photoURL) { // Prefer photoURL from DB if it exists
                            setPhotoURL(dbData.photoURL);
                        }
                    } else {
                        console.warn(`No user data found in Realtime Database for uid: ${user.uid}. A default object will be used.`);
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
                setUser(null);
                setUserData(null);
                setPhotoURL(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updatePhotoURL = (url: string) => {
        setPhotoURL(url);
        // Here you would also update the photoURL in Firebase Auth and your database
        // For now, we just update the context state for a live preview effect
    };
    
    const value = useMemo(() => ({ user, userData, loading, photoURL, updatePhotoURL }), [user, userData, loading, photoURL]);

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
