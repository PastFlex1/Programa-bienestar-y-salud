
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) {
            return; // Wait until loading is finished
        }

        const isAuthPage = pathname.startsWith('/auth');

        if (user) {
            // If user is logged in and on an auth page, redirect to dashboard
            if(isAuthPage) {
                router.replace('/dashboard');
            }
        } else {
            // If user is not logged in and not on an auth page, redirect to login
            if (!isAuthPage) {
                router.replace('/auth/login');
            }
        }

    }, [user, loading, router, pathname]);

    // This component will effectively be a loading/redirect handler.
    // The actual content is handled by the layout and sub-pages.
    return null;
}
