import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseConfig | null {
  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = env.VITE_FIREBASE_APP_ID;

  if (apiKey && apiKey !== 'MY_FIREBASE_API_KEY' && projectId) {
    return {
      apiKey,
      authDomain: authDomain || '',
      projectId,
      storageBucket: storageBucket || '',
      messagingSenderId: messagingSenderId || '',
      appId: appId || '',
    };
  }
  return null;
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function initFirebase(): { app: FirebaseApp | null; db: Firestore | null; isConfigured: boolean } {
  const config = getFirebaseConfig();
  if (!config) {
    return { app: null, db: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApps()[0];
    }
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, db: dbInstance, isConfigured: true };
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
    return { app: null, db: null, isConfigured: false };
  }
}
