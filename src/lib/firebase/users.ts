
"use server";

import { ref, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./config";
import { updateProfile } from "firebase/auth";
import { getSession, updateSessionCookie } from "./auth";

export type UserProfile = {
    displayName: string;
    email: string;
    photoURL?: string | null;
    createdAt?: string;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = ref(db, `users/${userId}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return snapshot.val() as UserProfile;
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
    const user = auth.currentUser;
    if (!user) {
        // This case should ideally not happen if a session exists,
        // but it's good practice to check.
        throw new Error("User not authenticated");
    }

    // Update Firebase Auth profile
    await updateProfile(user, data);

    // Update Realtime Database profile
    const userDbRef = ref(db, `users/${user.uid}`);
    await update(userDbRef, data);
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

    // Update user profile in Auth and DB
    const userDbRef = ref(db, `users/${session.uid}`);
    
    await update(userDbRef, { photoURL });
    
    const authUser = auth.currentUser;
    if (authUser) {
      await updateProfile(authUser, { photoURL });
    }

    // Update the session cookie
    await updateSessionCookie({ photoURL });

    return photoURL;
}
