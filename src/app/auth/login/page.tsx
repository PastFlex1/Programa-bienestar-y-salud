
"use client";

import { useEffect, useState, useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { BrainCircuit, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from '@/context/language-provider';
import { loginAction } from '@/lib/firebase/auth';


const translations = {
  es: {
    title: "Bienvenido de Nuevo",
    description: "Inicia sesión para continuar tu viaje.",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    loginButton: 'Iniciar Sesión',
    loggingInButton: 'Iniciando...',
    registerPrompt: "¿No tienes una cuenta?",
    registerLink: 'Regístrate',
    successTitle: "Inicio de Sesión Correcto",
    successDescription: "¡Bienvenido de nuevo! Serás redirigido.",
    errorTitle: "Error de Inicio de Sesión",
    continueButton: "Continuar",
  },
  en: {
    title: "Welcome Back",
    description: "Log in to continue your journey.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: 'Log In',
    loggingInButton: 'Logging In...',
    registerPrompt: "Don't have an account?",
    registerLink: 'Sign up',
    successTitle: "Login Successful",
    successDescription: "Welcome back! You will be redirected.",
    errorTitle: "Login Error",
    continueButton: "Continue",
  }
};

function LoginButton({t}: {t: typeof translations['en']}) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.loggingInButton}
                </>
            ) : (
                t.loginButton
            )}
        </Button>
    )
}

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [state, formAction] = useActionState(loginAction, { success: false, message: ""});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      router.push('/dashboard');
    } else {
      setIsModalOpen(true);
    }
  }, [state, router]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
            <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">{t.passwordLabel}</Label>
                <Input id="password" name="password" type="password" required />
                </div>
                <LoginButton t={t} />
            </form>
          <div className="mt-6 text-center text-sm">
            {t.registerPrompt}{" "}
            <Link href="/auth/register" className="underline text-primary">
              {t.registerLink}
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
          <DialogContent>
              <DialogHeader>
                  <div className={`flex justify-center items-center h-16 w-16 rounded-full bg-opacity-20 mx-auto mb-4 bg-destructive`}>
                    <XCircle className="h-10 w-10 text-destructive-foreground" />
                  </div>
                  <DialogTitle className="text-center font-headline text-2xl">
                    {t.errorTitle}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {state.message}
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button className="w-full" onClick={handleCloseModal}>
                          {t.continueButton}
                      </Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
