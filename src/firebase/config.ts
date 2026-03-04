
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REPLACE_ME",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gemini-switch-2fdeg.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gemini-switch-2fdeg",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gemini-switch-2fdeg.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "516197541019",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:516197541019:web:a1f0ad5e0e31085b4a123e"
};
