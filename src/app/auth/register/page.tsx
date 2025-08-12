
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-provider"
import { useAuth } from "@/context/auth-provider";
import { useToast } from "@/hooks/use-toast";

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
        errorFields: "Por favor, completa todos los campos.",
        errorPassword: "La contraseña debe tener al menos 6 caracteres."
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
        errorFields: "Please fill in all fields.",
        errorPassword: "Password must be at least 6 characters long."
    }
}


export default function RegisterPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const router = useRouter();
    const { signUp } = useAuth();
    const { toast } = useToast();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);

    const handleSignUp = () => {
        if (!username || !email || !password) {
            toast({ variant: 'destructive', title: t.errorTitle, description: t.errorFields });
            return;
        }
        if (password.length < 6) {
            toast({ variant: 'destructive', title: t.errorTitle, description: t.errorPassword });
            return;
        }

        setIsSigningUp(true);
        // Simulate async operation
        setTimeout(() => {
            signUp({ displayName: username, email });
            setIsSigningUp(false);
            router.push('/dashboard');
        }, 500);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="username">{t.usernameLabel}</Label>
                        <Input id="username" name="username" required value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.emailLabel}</Label>
                        <Input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t.passwordLabel}</Label>
                        <Input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    
                    <Button onClick={handleSignUp} className="w-full" disabled={isSigningUp}>
                        {isSigningUp ? t.signingUpButton : t.submitButton}
                    </Button>
                </div>
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
