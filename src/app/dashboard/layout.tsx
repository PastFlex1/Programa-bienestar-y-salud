
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { MotivationalQuote } from "@/components/motivational-quote";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-8 w-48 mt-4" />
    </div>
);


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no hay usuario, redirigir al login.
    // Esto se ejecutará solo después de que Firebase haya verificado el estado.
    if (!loading && !user) {
      console.log('Usuario no autenticado, redirigiendo a /auth/login. Estado: ', { loading, user });
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // Mientras se verifica el estado del usuario, muestra una pantalla de carga.
  // También se muestra si no hay usuario, para evitar un parpadeo antes de la redirección.
  if (loading || !user) {
    return <LoadingScreen />;
  }
  
  // Si el usuario está autenticado, renderiza el layout del dashboard.
  return (
    <div className="bg-background min-h-screen text-foreground font-body">
      <AppHeader />
      <main className="pb-24">{children}</main>
      <BottomNav />
      <MotivationalQuote />
    </div>
  );
}
