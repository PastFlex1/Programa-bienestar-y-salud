
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from '@/lib/firebase/client';
import type { User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type AuthContextType = {
    user: User | null;
};

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        const isAuthPage = pathname.startsWith('/auth');

        if (!user && !isAuthPage) {
            router.push('/auth/login');
        } else if (user && isAuthPage) {
            router.push('/dashboard');
        }

    }, [user, loading, router]);

    if (loading) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <div className="space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-72" />
                    <div className="space-y-2 pt-8">
                        <Skeleton className="h-12 w-80" />
                        <Skeleton className="h-12 w-80" />
                        <Skeleton className="h-12 w-80" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user }}>
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
