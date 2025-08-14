
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
    title: "Iniciar Sesión",
    description: "Bienvenido de nuevo. Accede a tu santuario.",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    submitButton: "Iniciar Sesión",
    loadingButton: "Iniciando...",
    noAccount: "¿No tienes una cuenta?",
    register: "Regístrate",
    errorTitle: "Error de Inicio de Sesión",
    errorDescription: "No existe el usuario o el correo o la contraseña son incorrectos.",
    successTitle: "Inicio de sesión exitoso",
    successDescription: "Has iniciado sesión correctamente. Serás redirigido."
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
    errorDescription: "User does not exist or email/password is incorrect.",
    successTitle: "Login Successful!",
    successDescription: "You have successfully logged in. You will be redirected."
  }
};

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [dialogState, setDialogState] = React.useState<{ open: boolean; variant: 'success' | 'error'; title: string; description: string; }>({ open: false, variant: 'success', title: '', description: '' });

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
      router.push("/dashboard");
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
