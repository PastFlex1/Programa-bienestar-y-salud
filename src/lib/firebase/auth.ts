
"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This is a dummy user database. In a real app, you'd fetch this from a database.
const DUMMY_USERS: { [email: string]: { name: string } } = {
    'user@example.com': { name: 'Zenith User' }
};

async function createSession(email: string) {
    const user = DUMMY_USERS[email] || { name: 'Zenith User' };

    const session = {
        isLoggedIn: true,
        email,
        name: user.name,
    };

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    cookies().set('session', JSON.stringify(session), {
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
        await signInWithEmailAndPassword(auth, email, password);
        await createSession(email);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            return { success: false, message: 'Invalid email or password.' };
        }
        console.error("Authentication Error:", error);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
    
    redirect('/dashboard');
}

export async function signUpAction(previousState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string || 'New User';

    if (!email || !password) {
        return { success: false, message: 'Please provide all required fields.' };
    }
     if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        DUMMY_USERS[email] = { name: username };
        await createSession(email);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'This email is already in use. Please log in.' };
        }
        console.error("Registration Error:", error);
        return { success: false, message: 'An unexpected error occurred during registration.' };
    }

    redirect('/dashboard');
}


export async function logoutAction() {
    cookies().delete('session');
    redirect('/auth/login');
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        return JSON.parse(sessionCookie);
    } catch (error) {
        console.error('Failed to parse session:', error);
        return null;
    }
}
