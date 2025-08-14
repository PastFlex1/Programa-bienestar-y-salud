
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-provider";
import { useLanguage } from "@/context/language-provider";
import { User, Mail, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const translations = {
  es: {
    title: "Tu Perfil",
    description: "Aquí está la información de tu cuenta.",
    nameLabel: "Nombre",
    emailLabel: "Correo Electrónico",
    logoutButton: "Cerrar Sesión",
  },
  en: {
    title: "Your Profile",
    description: "Here is your account information.",
    nameLabel: "Name",
    emailLabel: "Email",
    logoutButton: "Logout",
  }
};

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  if (loading || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
           <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-10 w-full" />
              </div>
               <Skeleton className="h-10 w-36 mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <User className="h-6 w-6 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.nameLabel}</Label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" value={user.name} readOnly className="pl-10"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" value={user.email} readOnly className="pl-10" />
              </div>
            </div>
            <Button variant="destructive" onClick={logout} className="mt-4">
                <LogOut className="mr-2 h-4 w-4" />
                {t.logoutButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
