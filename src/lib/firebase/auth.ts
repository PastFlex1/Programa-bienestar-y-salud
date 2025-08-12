
"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { auth } from './config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function createSession(user: User) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = { 
        uid: user.uid, 
        isLoggedIn: true, 
        expires: expires.toISOString(),
        displayName: user.displayName,
        email: user.email 
    };
    
    // Encrypt the session and set it in a cookie
    await cookies().set('session', JSON.stringify(session), {
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
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            return { success: false, message: 'Invalid email or password.' };
        }
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
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
        
        // Update Firebase user profile with display name
        await updateProfile(userCredential.user, { displayName: username });

        // Refresh user object to get the updated profile
        await userCredential.user.reload();

        await createSession(userCredential.user);

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'This email is already in use. Please log in.' };
        }
        console.error("SignUp Error:", error);
        return { success: false, message: 'An unexpected error occurred during registration.' };
    }

    redirect('/dashboard');
}


export async function logoutAction() {
    await cookies().delete('session');
    redirect('/auth/login');
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        const parsed = JSON.parse(sessionCookie);
        if (new Date(parsed.expires) > new Date()) {
            return parsed;
        }
        return null; // Session expired
    } catch (error) {
        return null;
    }
}
