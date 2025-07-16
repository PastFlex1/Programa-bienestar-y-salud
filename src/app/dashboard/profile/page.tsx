"use client";

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const [name, setName] = useState("Usuario de Zenith");
  const [email, setEmail] = useState("usuario@example.com");
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveChanges = () => {
    // En una aplicación real, aquí llamarías a una API para guardar los cambios.
    console.log("Guardando cambios:", { name, email });
    toast({
      title: "Perfil Actualizado",
      description: "Tus cambios han sido guardados exitosamente.",
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "Por favor, selecciona una imagen de menos de 2MB.",
        });
        return;
      }
      const newAvatarUrl = URL.createObjectURL(file);
      setAvatarUrl(newAvatarUrl);
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
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>Gestiona la información de tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt="Perfil de usuario" data-ai-hint="woman smiling" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleAvatarButtonClick}>Cambiar Foto</Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
