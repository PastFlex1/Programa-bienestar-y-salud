"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user-provider";
import { BrainCircuit } from "lucide-react";

export function AppHeader() {
  const { userName, avatarUrl } = useUser();
  const fallback = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground font-headline">Zenith</h1>
      </div>
      <Avatar>
        <AvatarImage src={avatarUrl} alt="Perfil de usuario" data-ai-hint="woman smiling" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </header>
  );
}
