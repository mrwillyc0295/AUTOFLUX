import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import localFirebaseConfig from '../../firebase-applet-config.json';

// Lógica Híbrida: Prioriza variables de Vercel, si no existen intenta usar el JSON local
let config: any = {};

try {
  // Intentamos obtener el config local, si falla (como en Vercel) seguimos con los env
  config = localFirebaseConfig;
} catch (e) {
  console.warn("Local firebase-applet-config.json not found, relying on environment variables.");
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || config.measurementId || ""
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || config.firestoreDatabaseId;

let app;
try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
    throw new Error("Missing Firebase API Key");
  }
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase App initialization failed:", error);
  // Fallback app initialization with minimal config to prevent crash during build
  // dummy config that won't work but prevents crash
  app = initializeApp({ apiKey: "AIzaSy_MISSING_API_KEY_PLEASE_CONFIGURE_VERCEL" });
}

export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

// Test connection as per guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. You might be offline or the setup is incomplete.");
    } else {
      console.log("Firestore connection check initiated.");
    }
  }
}
testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null) => {
  if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: auth.currentUser ? {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified,
        isAnonymous: auth.currentUser.isAnonymous,
        providerInfo: auth.currentUser.providerData
      } : null
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};
