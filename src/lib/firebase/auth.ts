
"use server";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './config';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET_KEY = process.env.JOSE_SECRET_KEY || new TextEncoder().encode('your-super-secret-key-that-is-at-least-32-bytes-long');

// This is a dummy user database. In a real app, you'd fetch this from a database.
const DUMMY_USERS = {
    'user@example.com': { name: 'Zenith User' }
};

export async function loginAction(previousState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { message: 'Please enter both email and password.' };
    }

    try {
        // Step 1: Verify credentials with Firebase
        await signInWithEmailAndPassword(auth, email, password);

        // Step 2: Create a session (JWT)
        const user = DUMMY_USERS[email as keyof typeof DUMMY_USERS] || { name: 'Zenith User' };
        
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

        // Step 3: Set the session token in a secure cookie
        cookies().set('session', sessionToken, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            return { message: 'Invalid email or password.' };
        }
        console.error("Authentication Error:", error);
        return { message: 'An unexpected error occurred. Please try again.' };
    }

    // Step 4: Redirect to a protected route on success
    redirect('/dashboard/journal');
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
