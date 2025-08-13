
"use client"

import { useEffect, useState, useActionState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from "@/context/language-provider"
import { XCircle, Loader2 } from "lucide-react";
import { signUpAction } from "@/lib/firebase/auth";

const translations = {
    es: {
        title: "Crear una cuenta",
        description: "Ingresa tus datos para comenzar tu viaje con Zenith.",
        usernameLabel: "Nombre de usuario",
        emailLabel: "Correo Electrónico",
        passwordLabel: "Contraseña",
        submitButton: "Registrarse",
        signingUpButton: "Registrando...",
        loginPrompt: "¿Ya tienes una cuenta?",
        loginLink: "Inicia sesión",
        errorTitle: "Error de Registro",
        successTitle: "Registro Exitoso",
        successDescription: "¡Tu cuenta ha sido creada! Serás redirigido al dashboard.",
        closeButton: "Cerrar",
    },
    en: {
        title: "Create an account",
        description: "Enter your details to start your journey with Zenith.",
        usernameLabel: "Username",
        emailLabel: "Email",
        passwordLabel: "Password",
        submitButton: "Sign Up",
        signingUpButton: "Signing up...",
        loginPrompt: "Already have an account?",
        loginLink: "Log in",
        errorTitle: "Registration Error",
        successTitle: "Registration Successful",
        successDescription: "Your account has been created! You will be redirected to the dashboard.",
        closeButton: "Close",
    }
}

function SignUpButton({t}: {t: typeof translations['en']}) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.signingUpButton}
                </>
            ) : (
                t.submitButton
            )}
        </Button>
    )
}

export default function RegisterPage() {
    const { language } = useLanguage();
    const t = translations[language];
    
    // The redirect on success is handled by the server action.
    // We only care about the state when there's an error message.
    const [state, formAction] = useActionState(signUpAction, { success: false, message: "" });
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

    useEffect(() => {
        // Only show the modal if the form submission was NOT successful
        // and there's a specific error message to display.
        if (state && !state.success && state.message) {
            setIsErrorModalOpen(true);
        }
    }, [state]);

    const handleCloseModal = () => {
        setIsErrorModalOpen(false);
    }

    return (
        <>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="username">{t.usernameLabel}</Label>
                            <Input id="username" name="username" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t.emailLabel}</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t.passwordLabel}</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
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

            <Dialog open={isErrorModalOpen} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
                <DialogContent>
                    <DialogHeader>
                        <div className={`flex justify-center items-center h-16 w-16 rounded-full bg-opacity-20 mx-auto mb-4 bg-destructive`}>
                             <XCircle className="h-10 w-10 text-destructive-foreground" />
                        </div>
                        <DialogTitle className="text-center font-headline text-2xl">
                            {t.errorTitle}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                             {state?.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-full" onClick={handleCloseModal}>
                                {t.closeButton}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
