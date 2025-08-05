
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component is now handled by the AuthProvider logic.
// If a user is not logged in, they will be redirected to /auth/login.
// If they are logged in, they will be redirected to /dashboard.
// This file can remain as a placeholder or be removed.
export default function Home() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);
  return null;
}
