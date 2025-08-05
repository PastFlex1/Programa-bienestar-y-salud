
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="space-y-4 w-full max-w-sm">
            <div className="flex justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-6 w-72 mx-auto" />
        </div>
    </div>
);

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Una vez que sabemos el estado de autenticación, redirigimos.
            if (user) {
                router.replace('/dashboard');
            } else {
                router.replace('/auth/login');
            }
        }
    }, [user, loading, router]);

    // Muestra una pantalla de carga mientras se determina el estado.
    return <LoadingScreen />;
}
