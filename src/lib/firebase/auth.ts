
"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './config';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET_KEY = process.env.JOSE_SECRET_KEY || new TextEncoder().encode('your-super-secret-key-that-is-at-least-32-bytes-long');

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
    const sessionToken = await new SignJWT(session)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expires)
        .sign(SECRET_KEY);

    cookies().set('session', sessionToken, {
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

    if (!email || !password) {
        return { success: false, message: 'Please provide all required fields.' };
    }
     if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // You could add the new user to your dummy database here if needed
        // DUMMY_USERS[email] = { name: formData.get('username') as string || 'New User' };
        
        return { success: true, message: 'Account created successfully! You can now log in.' };

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'This email is already in use. Please log in.' };
        }
        console.error("Registration Error:", error);
        return { success: false, message: 'An unexpected error occurred during registration.' };
    }
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
        const { payload } = await jwtVerify(sessionCookie, SECRET_KEY, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        console.error('Failed to verify session:', error);
        return null;
    }
}
