import { initializeApp as initWebApp, getApps as getWebApps, getApp as getWebApp, type FirebaseApp } from "firebase/app";
import { getFirestore as getWebFirestore, doc, getDoc, setDoc, type Firestore as WebFirestore } from "firebase/firestore";
import { initializeApp as initAdminApp, getApps as getAdminApps, cert as adminCert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, type Firestore as AdminFirestore } from "firebase-admin/firestore";
import { parseStore } from "@/lib/menu";
import type { Store } from "@/lib/types";

const COLLECTION_NAME = "stores";
const DOCUMENT_ID = "abriyservi";

// Detect if Firebase configuration is provided in env
export function isFirebaseConfigured(): boolean {
  // Check Admin SDK credentials
  if (
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY)
  ) {
    return true;
  }

  // Check Web SDK credentials
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

  return Boolean(projectId && apiKey);
}

// Get or initialize Admin Firestore instance
function getAdminFirestoreInstance(): AdminFirestore | null {
  try {
    const existing = getAdminApps();
    if (existing.length > 0) {
      return getAdminFirestore();
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount: ServiceAccount;
      try {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        const jsonStr = raw.startsWith("{")
          ? raw
          : Buffer.from(raw, "base64").toString("utf8");
        serviceAccount = JSON.parse(jsonStr) as ServiceAccount;
      } catch (e) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        return null;
      }

      initAdminApp({
        credential: adminCert(serviceAccount),
      });
      return getAdminFirestore();
    }

    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      initAdminApp({
        credential: adminCert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      return getAdminFirestore();
    }
  } catch (err) {
    console.error("Error initializing Firebase Admin SDK:", err);
  }

  return null;
}

// Get or initialize Web SDK Firestore instance
function getWebFirestoreInstance(): WebFirestore | null {
  try {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

    if (!projectId || !apiKey) return null;

    const firebaseConfig = {
      apiKey,
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.FIREBASE_AUTH_DOMAIN ||
        `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${projectId}.appspot.com`,
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
    };

    const app: FirebaseApp =
      getWebApps().length > 0 ? getWebApp() : initWebApp(firebaseConfig);
    return getWebFirestore(app);
  } catch (err) {
    console.error("Error initializing Firebase Web SDK:", err);
    return null;
  }
}

/**
 * Fetch the store menu from Firebase Firestore
 */
export async function getStoreFromFirebase(): Promise<Store | null> {
  if (!isFirebaseConfigured()) return null;

  // 1. Try Firebase Admin SDK first (server-side preference)
  const adminDb = getAdminFirestoreInstance();
  if (adminDb) {
    try {
      const docSnap = await adminDb
        .collection(COLLECTION_NAME)
        .doc(DOCUMENT_ID)
        .get();

      if (docSnap.exists) {
        const data = docSnap.data();
        if (data) {
          return parseStore(data);
        }
      }
    } catch (error) {
      console.warn("Firebase Admin read failed, attempting Web SDK fallback:", error);
    }
  }

  // 2. Try Firebase Web SDK
  const webDb = getWebFirestoreInstance();
  if (webDb) {
    try {
      const docRef = doc(webDb, COLLECTION_NAME, DOCUMENT_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          return parseStore(data);
        }
      }
    } catch (error) {
      console.error("Firebase Web SDK read failed:", error);
    }
  }

  return null;
}

/**
 * Save or update the store menu in Firebase Firestore
 */
export async function saveStoreToFirebase(store: Store): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  const cleanStore = parseStore(store);
  const payload = {
    ...cleanStore,
    updated_at: new Date().toISOString(),
  };

  // 1. Try Firebase Admin SDK
  const adminDb = getAdminFirestoreInstance();
  if (adminDb) {
    try {
      await adminDb
        .collection(COLLECTION_NAME)
        .doc(DOCUMENT_ID)
        .set(payload, { merge: true });
      return true;
    } catch (error) {
      console.warn("Firebase Admin write failed, attempting Web SDK:", error);
    }
  }

  // 2. Try Firebase Web SDK
  const webDb = getWebFirestoreInstance();
  if (webDb) {
    try {
      const docRef = doc(webDb, COLLECTION_NAME, DOCUMENT_ID);
      await setDoc(docRef, payload, { merge: true });
      return true;
    } catch (error) {
      console.error("Firebase Web SDK write failed:", error);
    }
  }

  return false;
}
