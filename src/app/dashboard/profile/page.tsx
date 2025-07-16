"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-provider';
import { useLanguage } from '@/context/language-provider';

const translations = {
  es: {
    title: "Perfil de Usuario",
    description: "Gestiona la información de tu cuenta.",
    changePhoto: "Cambiar Foto",
    nameLabel: "Nombre",
    emailLabel: "Correo Electrónico",
    saveChanges: "Guardar Cambios",
    toastSuccessTitle: "Perfil Actualizado",
    toastSuccessDescription: "Tus cambios han sido guardados exitosamente.",
    toastFileTooLargeTitle: "Archivo muy grande",
    toastFileTooLargeDescription: "Por favor, selecciona una imagen de menos de 2MB.",
    emailPlaceholder: "usuario@example.com",
    avatarAlt: "Perfil de usuario"
  },
  en: {
    title: "User Profile",
    description: "Manage your account information.",
    changePhoto: "Change Photo",
    nameLabel: "Name",
    emailLabel: "Email",
    saveChanges: "Save Changes",
    toastSuccessTitle: "Profile Updated",
    toastSuccessDescription: "Your changes have been saved successfully.",
    toastFileTooLargeTitle: "File Too Large",
    toastFileTooLargeDescription: "Please select an image smaller than 2MB.",
    emailPlaceholder: "user@example.com",
    avatarAlt: "User profile"
  }
};


export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];

  const { toast } = useToast();
  const { userName, avatarUrl, updateUser } = useUser();
  
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(t.emailPlaceholder); 
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(avatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(userName);
    setPreviewAvatarUrl(avatarUrl);
  }, [userName, avatarUrl]);


  const handleSaveChanges = () => {
    updateUser({ userName: name, avatarUrl: previewAvatarUrl });
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
      setPreviewAvatarUrl(newAvatarUrl);
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };


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
                <AvatarImage src={previewAvatarUrl} alt={t.avatarAlt} data-ai-hint="woman smiling" />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
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
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <Button onClick={handleSaveChanges}>{t.saveChanges}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
