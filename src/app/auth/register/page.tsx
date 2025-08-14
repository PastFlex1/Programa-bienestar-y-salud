
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
    title: "Crear una Cuenta",
    description: "Empieza tu viaje hacia la calma hoy mismo.",
    nameLabel: "Nombre",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    submitButton: "Registrarse",
    loadingButton: "Registrando...",
    haveAccount: "¿Ya tienes una cuenta?",
    login: "Inicia Sesión",
    errorTitle: "Error de Registro",
    errorDescription: "Este correo ya está en uso. Por favor, intenta con otro.",
    successTitle: "¡Registro Exitoso!",
    successDescription: "Tu cuenta ha sido creada. ¡Bienvenido/a!"
  },
  en: {
    title: "Create an Account",
    description: "Start your journey to calmness today.",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    submitButton: "Register",
    loadingButton: "Registering...",
    haveAccount: "Already have an account?",
    login: "Login",
    errorTitle: "Registration Failed",
    errorDescription: "This email is already in use. Please try another.",
    successTitle: "Registration Successful!",
    successDescription: "Your account has been created. Welcome!"
  }
};

export default function RegisterPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: language === 'es' ? "El nombre es requerido." : "Name is required." }),
    email: z.string().email({ message: language === 'es' ? "Correo inválido." : "Invalid email." }),
    password: z.string().min(6, { message: language === 'es' ? "La contraseña debe tener al menos 6 caracteres." : "Password must be at least 6 characters." }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
        const user = await register(values.name, values.email, values.password);
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          {t.haveAccount}{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            {t.login}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
