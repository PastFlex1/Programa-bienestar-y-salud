
"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

// This is a local-only, simulated user data structure.
export type UserData = {
    email: string | null;
    displayName: string | null;
    photoURL?: string;
};

type AuthContextType = {
    userData: UserData | null;
    loading: boolean;
    photoURL: string | null;
    updatePhotoURL: (url: string) => void;
    signUp: (data: { displayName: string, email: string }) => void;
    login: (data: { displayName: string, email: string }) => void;
    logout: () => void;
    updateUserData: (data: Partial<UserData>) => void;
};

const AuthContext = createContext<AuthContextType>({ 
    userData: null, 
    loading: true, 
    photoURL: null, 
    updatePhotoURL: () => {},
    signUp: () => {},
    login: () => {},
    logout: () => {},
    updateUserData: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    // On initial load, set loading to false. We are not fetching any data.
    useEffect(() => {
        setLoading(false);
    }, [])

    const signUp = ({ displayName, email }: { displayName: string, email: string }) => {
        const newUser: UserData = { displayName, email, photoURL: null };
        setUserData(newUser);
        setPhotoURL(null);
    };

    const login = ({ displayName, email }: { displayName: string, email: string }) => {
        const loggedInUser: UserData = { displayName, email, photoURL: photoURL }; // Persist photoURL on login
        setUserData(loggedInUser);
    };
    
    const logout = () => {
        setUserData(null);
        setPhotoURL(null);
    };

    const updatePhotoURL = (url: string) => {
        setPhotoURL(url);
        if (userData) {
            setUserData(prev => prev ? { ...prev, photoURL: url } : null);
        }
    };

    const updateUserData = (data: Partial<UserData>) => {
        setUserData(prev => prev ? { ...prev, ...data } : null);
    }
    
    const value = useMemo(() => ({ 
        userData, 
        loading, 
        photoURL, 
        updatePhotoURL,
        signUp,
        login,
        logout,
        updateUserData
    }), [userData, loading, photoURL]);

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
