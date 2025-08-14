
"use client";

import Link from "next/link";
import { BrainCircuit, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth-provider";
import { useLanguage } from "@/context/language-provider";
import Image from 'next/image';

const translations = {
  es: {
    profile: "Perfil",
    logout: "Cerrar Sesión",
  },
  en: {
    profile: "Profile",
    logout: "Logout",
  },
};


export function AppHeader() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground font-headline">Zenith</h1>
      </div>
       {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                {user.photoURL ? (
                    <Image 
                        src={user.photoURL}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profile">
                <DropdownMenuItem className="cursor-pointer">
                    {t.profile}
                </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
