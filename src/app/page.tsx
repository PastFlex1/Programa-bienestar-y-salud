
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();

    useEffect(() => {
        // Redirect to the login page by default
        router.replace('/auth/login');
    }, [router]);

    return <LoadingScreen />;
}
