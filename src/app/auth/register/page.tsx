
"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-provider"
import { signUpAction } from "@/lib/firebase/auth"

const translations = {
    es: {
        title: "Crear una cuenta",
        description: "Ingresa tus datos para comenzar tu viaje con Zenith.",
        usernameLabel: "Nombre de usuario (opcional)",
        emailLabel: "Correo Electrónico",
        passwordLabel: "Contraseña",
        submitButton: "Registrarse",
        signingUpButton: "Registrando...",
        loginPrompt: "¿Ya tienes una cuenta?",
        loginLink: "Inicia sesión",
    },
    en: {
        title: "Create an account",
        description: "Enter your details to start your journey with Zenith.",
        usernameLabel: "Username (optional)",
        emailLabel: "Email",
        passwordLabel: "Password",
        submitButton: "Sign Up",
        signingUpButton: "Signing up...",
        loginPrompt: "Already have an account?",
        loginLink: "Log in",
    }
}

function SignUpButton({t}: {t: any}) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.signingUpButton : t.submitButton}
        </Button>
    );
}

export default function RegisterPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const [state, formAction] = useActionState(signUpAction, null);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="username">{t.usernameLabel}</Label>
                        <Input id="username" name="username" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.emailLabel}</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t.passwordLabel}</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    
                    {state?.message && !state?.success && (
                        <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">
                            {state.message}
                        </p>
                    )}

                    <SignUpButton t={t} />
                </form>
                <div className="mt-6 text-center text-sm">
                    {t.loginPrompt}{" "}
                    <Link href="/auth/login" className="underline text-primary">
                        {t.loginLink}
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
