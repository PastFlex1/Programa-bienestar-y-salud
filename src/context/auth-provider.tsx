
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from '@/lib/firebase/client';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Import auth directly for the listener

type AuthContextType = {
    user: User | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged es la forma correcta de manejar el estado de autenticación
        const unsubscribe = onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        // Esta función de limpieza es CRÍTICA.
        // Se asegura de que el listener de Firebase se desuscriba cuando el componente se desmonte.
        // Esto previene múltiples listeners y posibles bugs.
        return () => unsubscribe();
    }, []); // El array vacío [] es CRÍTICO para que este efecto se ejecute solo una vez.

    const value = { user, loading };

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
