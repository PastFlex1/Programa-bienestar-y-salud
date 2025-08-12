
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-provider';
import { useAuth } from '@/context/auth-provider';
import { useState } from 'react';

const translations = {
  es: {
    title: "Bienvenido de Nuevo",
    description: "Inicia sesión para continuar tu viaje.",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    loginButton: 'Iniciar Sesión',
    registerPrompt: "¿No tienes una cuenta?",
    registerLink: 'Regístrate',
    loginError: "Error de inicio de sesión",
    loggingIn: "Iniciando sesión...",
  },
  en: {
    title: "Welcome Back",
    description: "Log in to continue your journey.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: 'Log In',
    registerPrompt: "Don't have an account?",
    registerLink: 'Sign up',
    loginError: "Login Error",
    loggingIn: "Logging in...",
  }
};


export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');

  const handleLoginClick = () => {
    // With local auth, we can just "log in" the user with the provided email.
    // In a real scenario, you'd validate password etc.
    login({ email: email, displayName: email.split('@')[0] });
    router.push('/dashboard');
  };

  return (
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
            <Input id="password" name="password" type="password" />
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
  );
}
