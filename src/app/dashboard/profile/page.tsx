
"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { UserIcon } from '@/components/user-icon';
import { logoutAction } from '@/lib/firebase/auth';
import { updateUserProfile, uploadProfilePicture, type UserProfile } from '@/lib/firebase/users';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/context/session-provider';


const translations = {
  es: {
    title: "Perfil de Usuario",
    description: "Gestiona la información de tu cuenta.",
    changePhoto: "Cambiar Foto",
    savingPhoto: "Guardando...",
    nameLabel: "Nombre",
    emailLabel: "Correo Electrónico",
    saveChanges: "Guardar Cambios",
    savingChanges: "Guardando...",
    signOut: "Cerrar Sesión",
    toastSuccessTitle: "Perfil Actualizado",
    toastSuccessDescription: "Tus cambios han sido guardados exitosamente.",
    toastErrorTitle: "Error",
    toastErrorDescription: "No se pudieron guardar los cambios.",
    toastFileTooLargeTitle: "Archivo muy grande",
    toastFileTooLargeDescription: "Por favor, selecciona una imagen de menos de 2MB.",
    avatarAlt: "Perfil de usuario",
    loadingProfile: "Cargando perfil..."
  },
  en: {
    title: "User Profile",
    description: "Manage your account information.",
    changePhoto: "Change Photo",
    savingPhoto: "Saving...",
    nameLabel: "Name",
    emailLabel: "Email",
    saveChanges: "Save Changes",
    savingChanges: "Saving...",
    signOut: "Sign Out",
    toastSuccessTitle: "Profile Updated",
    toastSuccessDescription: "Your changes have been saved successfully.",
    toastErrorTitle: "Error",
    toastErrorDescription: "Could not save changes.",
    toastFileTooLargeTitle: "File Too Large",
    toastFileTooLargeDescription: "Please select an image smaller than 2MB.",
    avatarAlt: "User profile",
    loadingProfile: "Loading profile..."
  }
};


export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const { session, loading: sessionLoading, updateSession } = useSession();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (session) {
        setProfile({
            displayName: session.displayName || "",
            email: session.email || "",
            photoURL: session.photoURL || null
        });
    }
  }, [session]);


  const handleSaveChanges = async () => {
    if (!profile || !session) return;
    setIsSaving(true);
    try {
        await updateUserProfile({ displayName: profile.displayName });
        await updateSession({ displayName: profile.displayName }); // Update session cookie
        toast({
            title: t.toastSuccessTitle,
            description: t.toastSuccessDescription,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: t.toastErrorTitle,
            description: t.toastErrorDescription,
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && session) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: t.toastFileTooLargeTitle,
          description: t.toastFileTooLargeDescription,
        });
        return;
      }
      setIsUploading(true);
      try {
        const newAvatarUrl = await uploadProfilePicture(file);
        setProfile(p => p ? {...p, photoURL: newAvatarUrl} : null);
        await updateSession({ photoURL: newAvatarUrl });
         toast({
            title: t.toastSuccessTitle,
            description: "Tu foto de perfil ha sido actualizada.",
        });
      } catch (error) {
         toast({
            variant: "destructive",
            title: t.toastErrorTitle,
            description: "No se pudo subir la imagen.",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSignOut = async () => {
    await logoutAction();
  }

  const isLoading = sessionLoading || !profile;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle><Skeleton className="h-8 w-48" /></CardTitle>
              <CardDescription><Skeleton className="h-5 w-72" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-36" />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.photoURL ?? undefined} alt={t.avatarAlt} />
                <AvatarFallback>
                  <UserIcon className="text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleAvatarButtonClick} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isUploading ? t.savingPhoto : t.changePhoto}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t.nameLabel}</Label>
              <Input 
                id="name" 
                value={profile.displayName} 
                onChange={(e) => setProfile(p => p ? {...p, displayName: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                disabled // Email is not editable
              />
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isSaving ? t.savingChanges : t.saveChanges}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end">
             <form action={handleSignOut}>
                <Button variant="destructive" type="submit">{t.signOut}</Button>
             </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
