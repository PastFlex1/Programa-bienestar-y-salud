
"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-provider";
import { useLanguage } from "@/context/language-provider";
import { User, Mail, LogOut, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const translations = {
  es: {
    title: "Tu Perfil",
    description: "Aquí está la información de tu cuenta.",
    nameLabel: "Nombre",
    emailLabel: "Correo Electrónico",
    logoutButton: "Cerrar Sesión",
    chooseAvatar: "Elige tu Avatar",
    updateSuccess: "Avatar actualizado correctamente.",
    updateError: "No se pudo actualizar el avatar.",
    updating: "Actualizando...",
  },
  en: {
    title: "Your Profile",
    description: "Here is your account information.",
    nameLabel: "Name",
    emailLabel: "Email",
    logoutButton: "Logout",
    chooseAvatar: "Choose Your Avatar",
    updateSuccess: "Avatar updated successfully.",
    updateError: "Could not update avatar.",
    updating: "Updating...",
  }
};

const avatars = [
    "/Fotos de perfil/Perfil1.png",
    "/Fotos de perfil/Perfil2.png",
    "/Fotos de perfil/Perfil3.png",
    "/Fotos de perfil/Perfil4.png",
    "/Fotos de perfil/Perfil5.png",
];


export default function ProfilePage() {
  const { user, logout, loading, updateUserProfile } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);


  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
        await updateUserProfile(user.id, { photoURL: avatarUrl });
        toast({ title: t.updateSuccess });
    } catch (error) {
        toast({ variant: "destructive", title: t.updateError });
        console.error(error);
    } finally {
        setIsUpdating(false);
    }
  };

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
          <CardHeader className="items-center text-center">
             <div className="relative h-24 w-24">
                {user.photoURL && user.photoURL.startsWith('/') ? (
                    <Image 
                        src={user.photoURL}
                        alt="User Avatar"
                        fill
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-12 w-12 text-primary" />
                    </div>
                )}
             </div>
            <CardTitle className="font-headline">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
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

        <Card>
            <CardHeader>
                <CardTitle>{t.chooseAvatar}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 justify-center relative">
                {isUpdating && <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {avatars.map((avatar) => (
                    <button 
                        key={avatar} 
                        onClick={() => handleAvatarSelect(avatar)}
                        disabled={isUpdating}
                        className={cn(
                            "relative h-20 w-20 rounded-full overflow-hidden transition-all duration-200 ring-2 ring-transparent hover:ring-primary focus:ring-primary focus:outline-none",
                            user.photoURL === avatar && "ring-primary ring-offset-2 ring-offset-background"
                        )}
                    >
                         <Image
                            src={avatar}
                            alt={`Avatar option`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
