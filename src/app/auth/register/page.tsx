
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from "@/context/language-provider"
import { useAuth } from "@/context/auth-provider";
import { CheckCircle2, XCircle } from "lucide-react";

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
        errorPassword: "La contraseña debe tener al menos 6 caracteres.",
        successTitle: "Registro Exitoso",
        successDescription: "¡Tu cuenta ha sido creada! Serás redirigido.",
        closeButton: "Cerrar",
        continueButton: "Continuar"
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
        errorPassword: "Password must be at least 6 characters long.",
        successTitle: "Registration Successful",
        successDescription: "Your account has been created! You will be redirected.",
        closeButton: "Close",
        continueButton: "Continue"
    }
}


export default function RegisterPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const router = useRouter();
    const { signUp } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);
    
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        description: string;
    }>({ isOpen: false, type: 'error', title: '', description: ''});


    const handleSignUp = () => {
        if (!username || !email || !password) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: t.errorTitle,
                description: t.errorFields
            });
            return;
        }
        if (password.length < 6) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: t.errorTitle,
                description: t.errorPassword
            });
            return;
        }

        setIsSigningUp(true);
        // Simulate async operation
        setTimeout(() => {
            signUp({ displayName: username, email });
            setIsSigningUp(false);
            setModalState({
                isOpen: true,
                type: 'success',
                title: t.successTitle,
                description: t.successDescription
            });
        }, 500);
    };

    const handleCloseModal = () => {
        const currentType = modalState.type;
        setModalState({ isOpen: false, type: 'error', title: '', description: '' });
        if (currentType === 'success') {
            router.push('/dashboard');
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

            <Dialog open={modalState.isOpen} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-opacity-20 mx-auto mb-4"
                             style={{ backgroundColor: modalState.type === 'success' ? 'var(--primary)' : 'var(--destructive)'}}>
                           {modalState.type === 'success' ? 
                             <CheckCircle2 className="h-10 w-10 text-primary-foreground" /> :
                             <XCircle className="h-10 w-10 text-destructive-foreground" />
                           }
                        </div>
                        <DialogTitle className="text-center font-headline text-2xl">{modalState.title}</DialogTitle>
                        <DialogDescription className="text-center">{modalState.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-full" onClick={handleCloseModal}>
                                {modalState.type === 'success' ? t.continueButton : t.closeButton}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
