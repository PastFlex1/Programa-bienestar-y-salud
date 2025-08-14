
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
import { useLanguage } from "@/context/language-provider";
import { useAuth } from "@/context/auth-provider";
import { StatusDialog } from "@/components/status-dialog";

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
    errorDescription: "No se pudo crear la cuenta. Revisa los datos o puede que el correo ya esté en uso.",
    successTitle: "¡Registro Exitoso!",
    successDescription: "Tu cuenta ha sido creada. Ahora, inicia sesión."
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
    errorDescription: "Could not create account. Check your details or the email may already be in use.",
    successTitle: "Registration Successful!",
    successDescription: "Your account has been created. Now, please log in."
  }
};

export default function RegisterPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { register } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [dialogState, setDialogState] = React.useState<{ open: boolean; variant: 'success' | 'error'; title: string; description: string; }>({ open: false, variant: 'success', title: '', description: '' });

  const formSchema = z.object({
    name: z.string().min(1, { message: language === 'es' ? "El nombre es requerido." : "Name is required." }),
    email: z.string().email({ message: language === 'es' ? "Correo inválido. Debe incluir '@' y '.'" : "Invalid email. Must include '@' and '.'." }),
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
            setDialogState({ open: true, variant: 'success', title: t.successTitle, description: t.successDescription });
        } else {
            setDialogState({ open: true, variant: 'error', title: t.errorTitle, description: t.errorDescription });
        }
    } catch (error) {
        console.error(error);
        setDialogState({ open: true, variant: 'error', title: t.errorTitle, description: t.errorDescription });
    } finally {
        setIsLoading(false);
    }
  }

  const handleDialogClose = () => {
    if (dialogState.variant === 'success') {
      router.push("/auth/login");
    }
    setDialogState({ ...dialogState, open: false });
  }

  return (
    <>
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
      <StatusDialog
        open={dialogState.open}
        onOpenChange={(open) => { if (!open) handleDialogClose()}}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
        onClose={handleDialogClose}
      />
    </>
  );
}
