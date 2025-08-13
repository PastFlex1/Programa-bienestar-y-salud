
"use server";

import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import { getSession, updateSessionCookie } from "./auth";

export type UserProfile = {
    uid: string;
    displayName: string;
    email: string | null;
    photoURL?: string | null;
    createdAt?: string;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, `users/${userId}`);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt instanceof Timestamp 
                ? data.createdAt.toDate().toISOString()
                : new Date().toISOString();

            return {
                uid: data.uid,
                displayName: data.displayName,
                email: data.email,
                photoURL: data.photoURL,
                createdAt: createdAt,
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

export async function updateUserProfile(data: { displayName?: string }): Promise<void> {
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    
    const userDocRef = doc(db, `users/${session.uid}`);
    await updateDoc(userDocRef, data);
}

export async function uploadProfilePicture(file: File): Promise<string> {
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }

    const filePath = `avatars/${session.uid}/${file.name}`;
    const fileRef = storageRef(storage, filePath);

    // Upload file
    await uploadBytes(fileRef, file);

    // Get download URL
    const photoURL = await getDownloadURL(fileRef);

    // Update user profile in DB
    const userDocRef = doc(db, `users/${session.uid}`);
    await updateDoc(userDocRef, { photoURL });
    
    // Update the session cookie
    await updateSessionCookie({ photoURL });

    return photoURL;
}

export async function createUserDocument(user: { uid: string, email?: string | null, displayName?: string | null }): Promise<void> {
    const userDocRef = doc(db, 'users', user.uid);
    const userData: UserProfile = {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? 'Anonymous User',
        createdAt: new Date().toISOString(),
        photoURL: null,
    };
    
    try {
        await setDoc(userDocRef, userData);
        console.log(`User document created for ${user.uid}`);
    } catch (error) {
        console.error(`Error creating user document for ${user.uid}:`, error);
        // We throw the error so the calling function knows something went wrong.
        throw new Error('Failed to create user document.');
    }
}
