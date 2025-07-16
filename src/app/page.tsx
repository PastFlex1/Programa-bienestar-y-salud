
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse-slow"></div>
          <BrainCircuit className="relative h-24 w-24 text-primary" />
        </div>
        <h1 className="text-5xl font-bold font-headline mb-2">Zenith</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-md">
          "La paz interior comienza en el momento en que eliges no permitir que otra persona o evento controle tus emociones."
        </p>
        <div className="space-y-4 w-full max-w-xs">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/dashboard">Registrarse</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full">
            <Link href="/dashboard">Continuar como invitado</Link>
          </Button>
        </div>
      </div>
      <footer className="text-sm text-muted-foreground py-4">
        <p>&copy; {new Date().getFullYear()} Zenith. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
