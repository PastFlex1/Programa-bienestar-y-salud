
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { MotivationalQuote } from "@/components/motivational-quote";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Don't render dashboard if not logged in or during initial load.
  }
  
  return (
    <div className="bg-background min-h-screen text-foreground font-body">
      <AppHeader />
      <main className="pb-24">{children}</main>
      <BottomNav />
      <MotivationalQuote />
    </div>
  );
}
