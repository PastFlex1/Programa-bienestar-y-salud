
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';


const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-48 mt-4" />
    </div>
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y ya hay un usuario, redirigirlo al dashboard.
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Muestra una pantalla de carga mientras se verifica el estado de autenticación
  // o si el usuario existe (lo que significa que está a punto de ser redirigido).
  if (loading || user) {
     return <LoadingScreen />;
  }

  // Si no está cargando y no hay usuario, renderiza las páginas de autenticación.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10"></div>
        {children}
    </div>
  );
}
