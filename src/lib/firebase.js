import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyAe7SgJ7zKaKsYePbzWGAfoUmow8Phg-lU",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "salah-eddine-map.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "salah-eddine-map",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "salah-eddine-map.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "711792004045",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:711792004045:web:ad7991bb78abdb82f75284",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || "G-Z5PL2NY8C5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

