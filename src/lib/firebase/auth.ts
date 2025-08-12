
"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from './config';
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
        const user = userCredential.user;

        // Update Firebase user profile with display name
        await updateProfile(user, { displayName: username });

        // Create a user document in Realtime Database
        const userRef = ref(db, "users/" + user.uid);
        await set(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: username,
            createdAt: new Date().toISOString()
        });
        
        // Refresh user object to get the updated profile
        await user.reload();
        
        // We need to get the refreshed user object to create the session with the correct display name
        const refreshedUser = auth.currentUser;
        if (!refreshedUser) {
            throw new Error("Could not get refreshed user after sign up.");
        }

        await createSession(refreshedUser);

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
    cookies().set('session', '', { expires: new Date(0) });
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
