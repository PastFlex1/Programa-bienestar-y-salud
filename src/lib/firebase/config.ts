
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBwgz_t1hh4ZV_GLU5IYsl3aqSr0ELrkTc",
  authDomain: "appmeditacion-751db.firebaseapp.com",
  databaseURL: "https://appmeditacion-751db-default-rtdb.firebaseio.com",
  projectId: "appmeditacion-751db",
  storageBucket: "appmeditacion-751db.appspot.com",
  messagingSenderId: "964735261053",
  appId: "1:964735261053:web:a31c5d5f667bf97fe7d414"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
