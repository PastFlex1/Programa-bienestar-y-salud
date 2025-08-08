
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    projectId: "zenith-mobile-fvkph",
    appId: "1:1086068591785:web:66eda9bfb4379e7b696db8",
    storageBucket: "zenith-mobile-fvkph.firebasestorage.app",
    apiKey: "AIzaSyCvsgcUFaS0LtE3ePyi0aiOujJI6EsgWiU",
    authDomain: "zenith-mobile-fvkph.firebaseapp.com",
    messagingSenderId: "1086068591785"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export const SECRET_KEY = new TextEncoder().encode(process.env.JOSE_SECRET_KEY || 'your-super-secret-key-that-is-at-least-32-bytes-long');

export { app, auth };
