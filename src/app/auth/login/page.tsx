
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { useLanguage } from '@/context/language-provider';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


const translations = {
  es: {
    title: "Bienvenido de Nuevo",
    description: "Inicia sesión para continuar tu viaje.",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    loginButton: 'Iniciar Sesión',
    registerPrompt: "¿No tienes una cuenta?",
    registerLink: 'Regístrate',
    emailRequired: "El correo electrónico es requerido.",
    emailInvalid: "Por favor, ingresa un correo electrónico válido.",
    passwordRequired: "La contraseña es requerida.",
    loginError: "Error al iniciar sesión",
    loginErrorDesc: "El correo electrónico o la contraseña son incorrectos."
  },
  en: {
    title: "Welcome Back",
    description: "Log in to continue your journey.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: 'Log In',
    registerPrompt: "Don't have an account?",
    registerLink: 'Sign up',
    emailRequired: "Email is required.",
    emailInvalid: "Please enter a valid email address.",
    passwordRequired: "Password is required.",
    loginError: "Login Error",
    loginErrorDesc: "The email or password you entered is incorrect."
  }
}

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z.object({
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    password: z.string().min(1, t.passwordRequired),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await signIn(values.email, values.password);
    if (error) {
      toast({
        variant: "destructive",
        title: t.loginError,
        description: t.loginErrorDesc,
      });
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <BrainCircuit className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="font-headline">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.emailLabel}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.passwordLabel}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">{t.loginButton}</Button>
          </form>
        </Form>
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
