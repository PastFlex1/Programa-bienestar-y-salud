
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-provider";
import { useAuth } from "@/context/auth-provider";

const translations = {
  es: {
    title: "Iniciar Sesión",
    description: "Bienvenido de nuevo. Accede a tu santuario.",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    submitButton: "Iniciar Sesión",
    loadingButton: "Iniciando...",
    noAccount: "¿No tienes una cuenta?",
    register: "Regístrate",
    errorTitle: "Error de Inicio de Sesión",
    errorDescription: "El correo electrónico o la contraseña son incorrectos. Por favor, inténtalo de nuevo.",
    successTitle: "¡Bienvenido/a!",
    successDescription: "Has iniciado sesión correctamente."
  },
  en: {
    title: "Login",
    description: "Welcome back. Access your sanctuary.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submitButton: "Login",
    loadingButton: "Logging in...",
    noAccount: "Don't have an account?",
    register: "Register",
    errorTitle: "Login Failed",
    errorDescription: "The email or password was incorrect. Please try again.",
    successTitle: "Welcome!",
    successDescription: "You have successfully logged in."
  }
};

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const formSchema = z.object({
    email: z.string().email({
      message: language === 'es' ? "Por favor, introduce un correo válido." : "Please enter a valid email.",
    }),
    password: z.string().min(1, {
      message: language === 'es' ? "La contraseña no puede estar vacía." : "Password cannot be empty.",
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
        const user = await login(values.email, values.password);
        if (user) {
            toast({ title: t.successTitle, description: t.successDescription });
            router.push("/dashboard");
        } else {
             toast({
                variant: "destructive",
                title: t.errorTitle,
                description: t.errorDescription,
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: t.errorTitle,
            description: t.errorDescription,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
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
                    <Input placeholder="nombre@ejemplo.com" {...field} />
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t.loadingButton : t.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {t.noAccount}{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            {t.register}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
