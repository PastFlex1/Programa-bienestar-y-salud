
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-provider";
import { BrainCircuit } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { UserIcon } from "./user-icon";

export function AppHeader() {
  const { userData, photoURL, loading } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground font-headline">Zenith</h1>
      </div>
       <div className="flex items-center gap-3">
        {loading ? (
            <Skeleton className="h-6 w-24" />
        ) : userData?.displayName && (
            <span className="text-sm font-medium text-foreground">{userData.displayName}</span>
        )}
        {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
        ) : (
            <Avatar>
            <AvatarImage src={photoURL ?? undefined} alt="Perfil de usuario" />
            <AvatarFallback>
                <UserIcon className="text-muted-foreground" />
            </AvatarFallback>
            </Avatar>
        )}
       </div>
    </header>
  );
}
