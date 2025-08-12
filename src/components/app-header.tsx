
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-provider";
import { BrainCircuit } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function AppHeader() {
  const { userData, loading } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground font-headline">Zenith</h1>
      </div>
       {loading ? (
        <Skeleton className="h-10 w-10 rounded-full" />
      ) : (
        <Avatar>
          <AvatarImage src={"https://placehold.co/100x100.png"} alt="Perfil de usuario" data-ai-hint="woman smiling" />
          <AvatarFallback>
            {userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : '👤'}
          </AvatarFallback>
        </Avatar>
      )}
    </header>
  );
}
