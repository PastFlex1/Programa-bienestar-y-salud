
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { MotivationalQuote } from "@/components/motivational-quote";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // While loading or if there's no user (and redirecting), show a loading state
  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-48 mt-4" />
      </div>
    );
  }
  
  // If user is authenticated, render the dashboard layout
  return (
    <div className="bg-background min-h-screen text-foreground font-body">
      <AppHeader />
      <main className="pb-24">{children}</main>
      <BottomNav />
      <MotivationalQuote />
    </div>
  );
}
