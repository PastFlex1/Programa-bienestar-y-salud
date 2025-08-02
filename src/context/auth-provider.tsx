
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

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Show a full-page loading skeleton while we verify the user's auth state.
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <div className="space-y-4 w-full max-w-sm">
                    <div className="flex justify-center">
                        <Skeleton className="h-24 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-6 w-72 mx-auto" />
                    <div className="space-y-2 pt-8">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    const isAuthPage = pathname.startsWith('/auth');
    const isDashboardPage = pathname.startsWith('/dashboard');

    // If no user is logged in, and they are trying to access a protected page (dashboard), redirect to login.
    if (!user && isDashboardPage) {
        router.push('/auth/login');
        return null; // Return null or a loading indicator to prevent rendering children during redirect
    } 
    // If a user is logged in, and they are on an auth page or the root page, redirect to dashboard.
    else if (user && (isAuthPage || pathname === '/')) {
        router.push('/dashboard');
        return null; // Return null or a loading indicator to prevent rendering children during redirect
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
