
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/context/language-provider"
import { signUp } from "@/lib/firebase/auth"
import { useToast } from "@/hooks/use-toast"

const translations = {
    es: {
        title: "Crear una cuenta",
        description: "Ingresa tus datos para comenzar tu viaje con Zenith.",
        usernameLabel: "Nombre de usuario",
        emailLabel: "Correo Electrónico",
        passwordLabel: "Contraseña",
        submitButton: "Registrarse",
        loginPrompt: "¿Ya tienes una cuenta?",
        loginLink: "Inicia sesión",
        usernameRequired: "El nombre de usuario es requerido.",
        emailRequired: "El correo electrónico es requerido.",
        emailInvalid: "Por favor, ingresa un correo electrónico válido.",
        passwordRequired: "La contraseña es requerida.",
        passwordMin: "La contraseña debe tener al menos 6 caracteres.",
        successTitle: "Cuenta creada exitosamente",
        successAction: "Continuar",
        registerError: "Error de Registro",
        emailInUse: "Este correo electrónico ya está en uso. Por favor, intenta con otro o inicia sesión.",
    },
    en: {
        title: "Create an account",
        description: "Enter your details to start your journey with Zenith.",
        usernameLabel: "Username",
        emailLabel: "Email",
        passwordLabel: "Password",
        submitButton: "Sign Up",
        loginPrompt: "Already have an account?",
        loginLink: "Log in",
        usernameRequired: "Username is required.",
        emailRequired: "Email is required.",
        emailInvalid: "Please enter a valid email address.",
        passwordRequired: "Password is required.",
        passwordMin: "Password must be at least 6 characters long.",
        successTitle: "Account created successfully",
        successAction: "Continue",
        registerError: "Registration Error",
        emailInUse: "This email is already in use. Please try another or log in.",
    }
}

export default function RegisterPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const router = useRouter();
    const { toast } = useToast();

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const formSchema = z.object({
        username: z.string().min(1, t.usernameRequired),
        email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
        password: z.string().min(6, t.passwordMin),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { user, error } = await signUp(values.email, values.password);
        if (error) {
            let description = error;
            if (error.includes("auth/email-already-in-use")) {
                description = t.emailInUse;
            }
            toast({
                variant: "destructive",
                title: t.registerError,
                description: description,
            })
        } else {
            // In a real app, you might want to update the user's profile with the username here.
            setShowSuccessDialog(true);
        }
    }

    return (
        <>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.usernameLabel}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                            <Button type="submit" className="w-full">{t.submitButton}</Button>
                        </form>
                    </Form>
                    <div className="mt-6 text-center text-sm">
                        {t.loginPrompt}{" "}
                        <Link href="/auth/login" className="underline text-primary">
                            {t.loginLink}
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                         <div className="flex justify-center items-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <AlertDialogTitle className="text-center">{t.successTitle}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => router.push('/auth/login')} className="w-full">
                            {t.successAction}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
