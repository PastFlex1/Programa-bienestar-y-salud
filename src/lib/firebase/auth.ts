
"use server";

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { get, ref, set } from "firebase/database";
import { auth, db } from './config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type SessionPayload = {
    uid: string;
    isLoggedIn: true;
    expires: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
};

async function createSession(user: User) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const session: SessionPayload = {
        uid: user.uid,
        isLoggedIn: true,
        expires: expires.toISOString(),
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
    };

    cookies().set('session', JSON.stringify(session), {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
}

export async function updateSessionCookie(data: Partial<SessionPayload>) {
    const session = await getSession();
    if (!session) return;

    const updatedSession = { ...session, ...data };

    const expires = new Date(session.expires);
     cookies().set('session', JSON.stringify(updatedSession), {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
}


export async function loginAction(previousState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, message: 'Please enter both email and password.' };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await createSession(userCredential.user);
    } catch (error: any) {
        let message = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            message = 'Invalid email or password.';
        }
        return { success: false, message };
    }
    
    redirect('/dashboard');
}

export async function signUpAction(previousState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    if (!email || !password || !username) {
        return { success: false, message: 'Please provide all required fields.' };
    }
     if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username });

        const userRef = ref(db, "users/" + user.uid);
        await set(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: username,
            createdAt: new Date().toISOString()
        });
        
        await createSession(user);

    } catch (error: any)
     {
        let message = 'An unexpected error occurred during registration.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email is already in use. Please log in.';
        }
        console.error("[signUpAction] Firebase Error:", { code: error.code, message: error.message });
        return { success: false, message };
    }

    redirect('/dashboard');
}


export async function logoutAction() {
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/auth/login');
}

export async function getSession(): Promise<SessionPayload | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    try {
        const parsed: SessionPayload = JSON.parse(sessionCookie);
        const sessionExpires = new Date(parsed.expires);

        // If the session is expired, clear the cookie and return null
        if (sessionExpires < new Date()) {
            cookies().set('session', '', { expires: new Date(0) });
            return null;
        }

        // It's a valid session
        return parsed;

    } catch (error) {
        // If parsing fails, the cookie is invalid. Clear it.
        cookies().set('session', '', { expires: new Date(0) });
        return null;
    }
}
