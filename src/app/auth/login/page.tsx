
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from '@/context/language-provider';
import { useAuth } from '@/context/auth-provider';

const translations = {
  es: {
    title: "Bienvenido de Nuevo",
    description: "Inicia sesión para continuar tu viaje.",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    loginButton: 'Iniciar Sesión',
    registerPrompt: "¿No tienes una cuenta?",
    registerLink: 'Regístrate',
    loggingIn: "Iniciando sesión...",
    successTitle: "Inicio de Sesión Correcto",
    successDescription: "¡Bienvenido de nuevo! Serás redirigido.",
    errorTitle: "Error de Inicio de Sesión",
    errorDescription: "Por favor, ingresa tu correo y contraseña.",
    continueButton: "Continuar",
    closeButton: "Cerrar",
  },
  en: {
    title: "Welcome Back",
    description: "Log in to continue your journey.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: 'Log In',
    registerPrompt: "Don't have an account?",
    registerLink: 'Sign up',
    loggingIn: "Logging in...",
    successTitle: "Login Successful",
    successDescription: "Welcome back! You will be redirected.",
    errorTitle: "Login Error",
    errorDescription: "Please enter your email and password.",
    continueButton: "Continue",
    closeButton: "Close",
  }
};


export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        description: string;
    }>({ isOpen: false, type: 'error', title: '', description: ''});


  const handleLoginClick = () => {
    // Local validation for simulation purposes
    if (!email || !password) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: t.errorTitle,
        description: t.errorDescription,
      });
      return;
    }

    login({ email: email, displayName: email.split('@')[0] });
    setModalState({
        isOpen: true,
        type: 'success',
        title: t.successTitle,
        description: t.successDescription,
    });
  };

  const handleCloseModal = () => {
    const currentType = modalState.type;
    setModalState({ isOpen: false, type: 'error', title: '', description: '' });
    if (currentType === 'success') {
        router.push('/dashboard');
    }
  }


  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrainCircuit className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.passwordLabel}</Label>
              <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button onClick={handleLoginClick} className="w-full">
              {t.loginButton}
            </Button>
          </div>
          <div className="mt-6 text-center text-sm">
            {t.registerPrompt}{" "}
            <Link href="/auth/register" className="underline text-primary">
              {t.registerLink}
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={modalState.isOpen} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
          <DialogContent>
              <DialogHeader>
                  <div className="flex justify-center items-center h-16 w-16 rounded-full bg-opacity-20 mx-auto mb-4"
                        style={{ backgroundColor: modalState.type === 'success' ? 'var(--primary)' : 'var(--destructive)'}}>
                      {modalState.type === 'success' ? 
                        <CheckCircle2 className="h-10 w-10 text-primary-foreground" /> :
                        <XCircle className="h-10 w-10 text-destructive-foreground" />
                      }
                  </div>
                  <DialogTitle className="text-center font-headline text-2xl">{modalState.title}</DialogTitle>
                  <DialogDescription className="text-center">{modalState.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button className="w-full" onClick={handleCloseModal}>
                          {modalState.type === 'success' ? t.continueButton : t.closeButton}
                      </Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
