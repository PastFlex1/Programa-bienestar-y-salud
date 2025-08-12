
"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';
import { logoutAction } from '@/lib/firebase/auth';
import { useAuth } from '@/context/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { UserIcon } from '@/components/user-icon';

const translations = {
  es: {
    title: "Perfil de Usuario",
    description: "Gestiona la información de tu cuenta.",
    changePhoto: "Cambiar Foto",
    nameLabel: "Nombre",
    emailLabel: "Correo Electrónico",
    saveChanges: "Guardar Cambios",
    signOut: "Cerrar Sesión",
    toastSuccessTitle: "Perfil Actualizado",
    toastSuccessDescription: "Tus cambios han sido guardados exitosamente.",
    toastFileTooLargeTitle: "Archivo muy grande",
    toastFileTooLargeDescription: "Por favor, selecciona una imagen de menos de 2MB.",
    emailPlaceholder: "usuario@example.com",
    avatarAlt: "Perfil de usuario",
    loadingProfile: "Cargando perfil..."
  },
  en: {
    title: "User Profile",
    description: "Manage your account information.",
    changePhoto: "Change Photo",
    nameLabel: "Name",
    emailLabel: "Email",
    saveChanges: "Save Changes",
    signOut: "Sign Out",
    toastSuccessTitle: "Profile Updated",
    toastSuccessDescription: "Your changes have been saved successfully.",
    toastFileTooLargeTitle: "File Too Large",
    toastFileTooLargeDescription: "Please select an image smaller than 2MB.",
    emailPlaceholder: "user@example.com",
    avatarAlt: "User profile",
    loadingProfile: "Loading profile..."
  }
};


export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { userData, loading: authLoading, photoURL, updatePhotoURL } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (userData) {
      setName(userData.displayName || '');
      setEmail(userData.email || '');
    }
  }, [userData]);


  const handleSaveChanges = () => {
    // Here you would typically call a function to update the user data in Firestore/RTDB
    // including uploading the new photo if one was selected and getting its new URL.
    toast({
      title: t.toastSuccessTitle,
      description: t.toastSuccessDescription,
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: t.toastFileTooLargeTitle,
          description: t.toastFileTooLargeDescription,
        });
        return;
      }
      const newAvatarUrl = URL.createObjectURL(file);
      updatePhotoURL(newAvatarUrl); // Update the global state
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (authLoading) {
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
                <AvatarImage src={photoURL ?? undefined} alt={t.avatarAlt} />
                <AvatarFallback>
                  <UserIcon className="text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleAvatarButtonClick}>{t.changePhoto}</Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t.nameLabel}</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                disabled
              />
            </div>
            <Button onClick={handleSaveChanges}>{t.saveChanges}</Button>
          </CardContent>
          <CardFooter className="flex justify-end">
             <form action={logoutAction}>
                <Button variant="destructive" type="submit">{t.signOut}</Button>
             </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
