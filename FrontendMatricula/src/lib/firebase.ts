// Firebase configuration placeholder
// Users need to replace with their own Firebase project credentials

import { initializeApp } from "firebase/app";

// Configuración de Firebase leída desde variables de entorno de Vite
// (definidas en .env como VITE_FIREBASE_*)
export const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseApp = initializeApp(firebaseConfig);

// Note: To enable Firebase authentication:
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Enable Google Sign-In in Authentication > Sign-in method
// 3. Replace the config values above with your project's credentials
// 4. Install firebase: npm install firebase
