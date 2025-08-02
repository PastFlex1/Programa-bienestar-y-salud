"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { useLanguage } from '@/context/language-provider';

const translations = {
  es: {
    quote: '"La paz interior comienza en el momento en que eliges no permitir que otra persona o evento controle tus emociones."',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    guest: 'Continuar como invitado',
    copyright: 'Zenith. Todos los derechos reservados.'
  },
  en: {
    quote: '"Inner peace begins the moment you choose not to allow another person or event to control your emotions."',
    login: 'Log In',
    register: 'Sign Up',
    guest: 'Continue as Guest',
    copyright: 'Zenith. All rights reserved.'
  }
}

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse-slow"></div>
          <BrainCircuit className="relative h-24 w-24 text-primary" />
        </div>
        <h1 className="text-5xl font-bold font-headline mb-2">Zenith</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-md">
          {t.quote}
        </p>
        <div className="space-y-4 w-full max-w-xs">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">{t.login}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/auth/register">{t.register}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full">
            <Link href="/dashboard">{t.guest}</Link>
          </Button>
        </div>
      </div>
      <footer className="text-sm text-muted-foreground py-4">
        <p>&copy; {new Date().getFullYear()} {t.copyright}</p>
      </footer>
    </>
  );
}
