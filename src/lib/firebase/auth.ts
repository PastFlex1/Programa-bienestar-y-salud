
"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from './config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type SessionPayload = {
    uid: string;
    isLoggedIn: true;
    expires: string;
    displayName: string | null;
    email: string | null;
};

async function createSession(user: User) {
    console.log("[createSession] Creating session for user:", { uid: user.uid, displayName: user.displayName, email: user.email });
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const session: SessionPayload = {
        uid: user.uid,
        isLoggedIn: true,
        expires: expires.toISOString(),
        displayName: user.displayName,
        email: user.email
    };

    // Note: Cookies can only be set in a Server Action or Route Handler
    await cookies().set('session', JSON.stringify(session), {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
     console.log("[createSession] Session cookie set.");
}

export async function loginAction(previousState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    console.log("[loginAction] Attempting to log in with email:", email);

    if (!email || !password) {
        const message = 'Please enter both email and password.';
        console.log("[loginAction] Failed:", message);
        return { success: false, message };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("[loginAction] Firebase sign-in successful for UID:", userCredential.user.uid);
        await createSession(userCredential.user);
    } catch (error: any) {
        let message = 'An unexpected error occurred. Please try again.';
        // Handle specific auth errors
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            message = 'Invalid email or password.';
        }
        console.error("[loginAction] Firebase Error:", { code: error.code, message: error.message });
        return { success: false, message };
    }

    console.log("[loginAction] Login successful, returning success state.");
    // Instead of redirecting, we return a success state. The client will handle the redirect.
    return { success: true, message: "Login successful" };
}

export async function signUpAction(previousState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    console.log("[signUpAction] Attempting to register with:", { email, username });


    if (!email || !password || !username) {
        const message = 'Please provide all required fields.';
        console.log("[signUpAction] Failed:", message);
        return { success: false, message };
    }
     if (password.length < 6) {
        const message = 'Password must be at least 6 characters long.';
        console.log("[signUpAction] Failed:", message);
        return { success: false, message };
    }

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("[signUpAction] User created in Firebase Auth with UID:", user.uid);

        // 2. Update the user's profile in Firebase Auth
        await updateProfile(user, { displayName: username });
        console.log("[signUpAction] Firebase Auth profile updated with displayName:", username);


        // 3. Save user data to Realtime Database
        const userRef = ref(db, "users/" + user.uid);
        await set(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: username,
            createdAt: new Date().toISOString()
        });
        console.log("[signUpAction] User data saved to Realtime Database at path:", `users/${user.uid}`);
        
        // 4. Create a session for the new user
        // The `user` object from `createUserWithEmailAndPassword` might not have the updated displayName yet,
        // so we manually pass it to our session creator.
        const userForSession = {
            ...user,
            displayName: username,
            email, // ensure email is passed
        } as User
        
        await createSession(userForSession);

    } catch (error: any) {
        let message = 'An unexpected error occurred during registration.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email is already in use. Please log in.';
        }
        console.error("[signUpAction] Firebase Error:", { code: error.code, message: error.message });
        return { success: false, message };
    }

    console.log("[signUpAction] Registration successful, redirecting to /dashboard...");
    redirect('/dashboard');
}


export async function logoutAction() {
    console.log("[logoutAction] Clearing session and redirecting to /auth/login.");
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/auth/login');
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    console.log("[getSession] Reading session cookie.");
    if (!sessionCookie) {
        console.log("[getSession] No session cookie found.");
        return null;
    }
    try {
        const parsed: SessionPayload = JSON.parse(sessionCookie);
        if (new Date(parsed.expires) > new Date()) {
            console.log("[getSession] Session valid for user:", parsed.uid);
            return parsed;
        }
        console.log("[getSession] Session expired for user:", parsed.uid);
        return null;
    } catch (error) {
        console.error("[getSession] Error parsing session cookie:", error);
        return null;
    }
}
