
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCvsgcUFaS0LtE3ePyi0aiOujJI6EsgWiU",
  authDomain: "zenith-mobile-fvkph.firebaseapp.com",
  databaseURL: "https://zenith-mobile-fvkph-default-rtdb.firebaseio.com",
  projectId: "zenith-mobile-fvkph",
  storageBucket: "zenith-mobile-fvkph.appspot.com",
  messagingSenderId: "1086068591785",
  appId: "1:1086068591785:web:66eda9bfb4379e7b696db8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
