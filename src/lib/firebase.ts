import {
  initializeApp as initWebApp,
  getApps as getWebApps,
  getApp as getWebApp,
  type FirebaseApp,
} from "firebase/app";
import {
  getFirestore as getWebFirestore,
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  type Firestore as WebFirestore,
} from "firebase/firestore";
import {
  getStorage as getWebStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  initializeApp as initAdminApp,
  getApps as getAdminApps,
  cert as adminCert,
  type ServiceAccount,
} from "firebase-admin/app";
import {
  getFirestore as getAdminFirestore,
  type Firestore as AdminFirestore,
} from "firebase-admin/firestore";
import { parseStore } from "@/lib/menu";
import type {
  FirebaseConnectionState,
  FirebaseStatusInfo,
  MediaAsset,
  Store,
} from "@/lib/types";

const COLLECTION_NAME = "stores";
const DOCUMENT_ID = "abriyservi";
const MEDIA_COLLECTION = "media";

// Configuración pública de respaldo del proyecto Firebase para garantizar conexión en producción (Vercel)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBObuvyLsyMh5Ly-Uf0svX0EwFCDRH9qoU",
  authDomain: "abri-servi.firebaseapp.com",
  projectId: "abri-servi",
  storageBucket: "abri-servi.firebasestorage.app",
  messagingSenderId: "570318467650",
  appId: "1:570318467650:web:82b6d8d698bf4734a4b3db",
};

let lastConnectionState: FirebaseConnectionState = "connected";
let lastErrorMessage = "";
let webFirestoreInitialized = false;

/**
 * Strip undefined fields recursively so Firestore never rejects payloads
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * Timeout wrapper with generous serverless cold-start budget (8s)
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms = 8000,
  onError?: (err: unknown) => void,
): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(null);
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (onError) onError(err);
        resolve(null);
      });
  });
}

function recordFirebaseError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  lastErrorMessage = msg;
  if (
    msg.includes("Cloud Firestore API has not been used") ||
    msg.includes("firestore.googleapis.com") ||
    msg.includes("is disabled") ||
    msg.includes("client is offline")
  ) {
    lastConnectionState = "api_disabled";
  } else if (msg.includes("permission-denied") || msg.includes("PERMISSION_DENIED")) {
    lastConnectionState = "permission_denied";
  } else {
    lastConnectionState = "error";
  }
}

export function getFirebaseProjectId(): string {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    DEFAULT_FIREBASE_CONFIG.projectId
  );
}

export function getFirebaseStorageBucket(): string {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    DEFAULT_FIREBASE_CONFIG.storageBucket
  );
}

export function isFirebaseConfigured(): boolean {
  return true;
}

function getWebFirebaseApp(): FirebaseApp | null {
  try {
    if (getWebApps().length > 0) {
      return getWebApp();
    }

    const projectId = getFirebaseProjectId();
    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.FIREBASE_API_KEY ||
      DEFAULT_FIREBASE_CONFIG.apiKey;

    const firebaseConfig = {
      apiKey,
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.FIREBASE_AUTH_DOMAIN ||
        DEFAULT_FIREBASE_CONFIG.authDomain,
      projectId,
      storageBucket: getFirebaseStorageBucket(),
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
        process.env.FIREBASE_APP_ID ||
        DEFAULT_FIREBASE_CONFIG.appId,
    };

    return initWebApp(firebaseConfig);
  } catch (err) {
    console.error("Error initializing Firebase Web App:", err);
    return null;
  }
}

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
      const db = getAdminFirestore();
      db.settings({ ignoreUndefinedProperties: true });
      return db;
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
      const db = getAdminFirestore();
      db.settings({ ignoreUndefinedProperties: true });
      return db;
    }
  } catch (err) {
    console.error("Error initializing Firebase Admin SDK:", err);
  }

  return null;
}

function getWebFirestoreInstance(): WebFirestore | null {
  try {
    const app = getWebFirebaseApp();
    if (!app) return null;

    if (!webFirestoreInitialized) {
      try {
        const db = initializeFirestore(app, {
          ignoreUndefinedProperties: true,
        });
        webFirestoreInitialized = true;
        return db;
      } catch {
        webFirestoreInitialized = true;
        return getWebFirestore(app);
      }
    }
    return getWebFirestore(app);
  } catch (err) {
    console.error("Error initializing Firebase Web Firestore:", err);
    return null;
  }
}

/**
 * Fetch the store menu from Firebase Firestore
 */
export async function getStoreFromFirebase(): Promise<Store | null> {
  // 1. Try Firebase Admin SDK first
  const adminDb = getAdminFirestoreInstance();
  if (adminDb) {
    const adminResult = await withTimeout(
      adminDb.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get(),
      8000,
      recordFirebaseError,
    );
    if (adminResult && adminResult.exists) {
      const data = adminResult.data();
      if (data) {
        lastConnectionState = "connected";
        return parseStore(data);
      }
    }
  }

  // 2. Try Firebase Web SDK
  const webDb = getWebFirestoreInstance();
  if (webDb) {
    const docRef = doc(webDb, COLLECTION_NAME, DOCUMENT_ID);
    const docSnap = await withTimeout(getDoc(docRef), 8000, recordFirebaseError);
    if (docSnap && docSnap.exists()) {
      const data = docSnap.data();
      if (data) {
        lastConnectionState = "connected";
        return parseStore(data);
      }
    }
  }

  return null;
}

/**
 * Save or update the store menu in Firebase Firestore
 */
export async function saveStoreToFirebase(store: Store): Promise<boolean> {
  const now = new Date().toISOString();
  const cleanStore = parseStore(store);
  const payload = cleanForFirestore({
    ...cleanStore,
    created_at: cleanStore.created_at || now,
    updated_at: now,
  });

  // 1. Try Firebase Admin SDK
  const adminDb = getAdminFirestoreInstance();
  if (adminDb) {
    const adminSaved = await withTimeout(
      adminDb
        .collection(COLLECTION_NAME)
        .doc(DOCUMENT_ID)
        .set(payload)
        .then(() => true),
      8000,
      recordFirebaseError,
    );
    if (adminSaved) {
      lastConnectionState = "connected";
      return true;
    }
  }

  // 2. Try Firebase Web SDK (overwrite full document so deleted dishes/fields are cleanly removed)
  const webDb = getWebFirestoreInstance();
  if (webDb) {
    const docRef = doc(webDb, COLLECTION_NAME, DOCUMENT_ID);
    const webSaved = await withTimeout(
      setDoc(docRef, payload).then(() => true),
      8000,
      recordFirebaseError,
    );
    if (webSaved) {
      lastConnectionState = "connected";
      return true;
    }
  }

  return false;
}

/**
 * Upload dish photo to Firebase (Storage first, then Firestore `media` collection as 100% free fallback)
 */
export async function uploadImageToFirebase(
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ url: string; provider: "firebase-storage" | "firestore-media" } | null> {
  // 1. Try Firebase Storage (if bucket is enabled)
  const app = getWebFirebaseApp();
  if (app) {
    try {
      const storage = getWebStorage(app);
      const fileRef = storageRef(storage, `menu/${filename}`);
      const uploadedUrl = await withTimeout(
        uploadBytes(fileRef, new Uint8Array(buffer), {
          contentType: mimeType,
          cacheControl: "public, max-age=31536000, immutable",
        }).then(() => getDownloadURL(fileRef)),
        4000,
      );
      if (uploadedUrl) {
        return { url: uploadedUrl, provider: "firebase-storage" };
      }
    } catch {
      // Fall back to Firestore media collection
    }
  }

  // 2. Save in Firestore `media` collection (100% Free on Firebase Spark plan, up to 1MB per image)
  if (buffer.length <= 900_000) {
    const now = new Date().toISOString();
    const asset: MediaAsset = {
      id: filename,
      filename,
      mimeType,
      size: buffer.length,
      base64: buffer.toString("base64"),
      created_at: now,
      updated_at: now,
    };

    const adminDb = getAdminFirestoreInstance();
    if (adminDb) {
      const ok = await withTimeout(
        adminDb
          .collection(MEDIA_COLLECTION)
          .doc(filename)
          .set(asset)
          .then(() => true),
        8000,
        recordFirebaseError,
      );
      if (ok) {
        lastConnectionState = "connected";
        return { url: `/api/media/${filename}`, provider: "firestore-media" };
      }
    }

    const webDb = getWebFirestoreInstance();
    if (webDb) {
      const ok = await withTimeout(
        setDoc(doc(webDb, MEDIA_COLLECTION, filename), asset).then(() => true),
        8000,
        recordFirebaseError,
      );
      if (ok) {
        lastConnectionState = "connected";
        return { url: `/api/media/${filename}`, provider: "firestore-media" };
      }
    }
  }

  return null;
}

/**
 * Retrieve a dish image stored in Firestore `media` collection
 */
export async function getImageFromFirebase(
  filename: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const adminDb = getAdminFirestoreInstance();
  if (adminDb) {
    const snap = await withTimeout(
      adminDb.collection(MEDIA_COLLECTION).doc(filename).get(),
      8000,
    );
    if (snap && snap.exists) {
      const data = snap.data() as MediaAsset | undefined;
      if (data?.base64 && data?.mimeType) {
        return {
          buffer: Buffer.from(data.base64, "base64"),
          mimeType: data.mimeType,
        };
      }
    }
  }

  const webDb = getWebFirestoreInstance();
  if (webDb) {
    const snap = await withTimeout(
      getDoc(doc(webDb, MEDIA_COLLECTION, filename)),
      8000,
    );
    if (snap && snap.exists()) {
      const data = snap.data() as MediaAsset | undefined;
      if (data?.base64 && data?.mimeType) {
        return {
          buffer: Buffer.from(data.base64, "base64"),
          mimeType: data.mimeType,
        };
      }
    }
  }

  return null;
}

/**
 * List uploaded image paths from Firestore `media` collection
 */
export async function listImagesFromFirebase(): Promise<string[]> {
  const webDb = getWebFirestoreInstance();
  if (!webDb) return [];

  const snap = await withTimeout(getDocs(collection(webDb, MEDIA_COLLECTION)), 5000);
  if (!snap) return [];

  const paths: string[] = [];
  snap.forEach((docItem) => {
    paths.push(`/api/media/${docItem.id}`);
  });
  return paths;
}

/**
 * Return current diagnostic status of Firebase connection
 */
export function getFirebaseStatus(): FirebaseStatusInfo {
  const projectId = getFirebaseProjectId();
  const storageBucket = getFirebaseStorageBucket();
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;

  if (lastConnectionState === "connected") {
    return {
      configured: true,
      state: "connected",
      projectId,
      storageBucket,
      message: `Conectado y sincronizado en tiempo real con Firestore (${projectId}).`,
      consoleUrl,
    };
  }

  if (lastConnectionState === "api_disabled") {
    return {
      configured: true,
      state: "api_disabled",
      projectId,
      storageBucket,
      message: `Para sincronizar en la nube de Firebase (${projectId}), hacé clic en "Crear base de datos" en tu consola de Firestore.`,
      consoleUrl,
    };
  }

  if (lastConnectionState === "permission_denied") {
    return {
      configured: true,
      state: "permission_denied",
      projectId,
      storageBucket,
      message: `En Firebase (${projectId}) habilitá permisos de lectura/escritura en Firestore > Reglas.`,
      consoleUrl,
    };
  }

  return {
    configured: true,
    state: lastConnectionState,
    projectId,
    storageBucket,
    message:
      lastErrorMessage ||
      `Proyecto Firebase configurado (${projectId}). Respaldo local y nube activos.`,
    consoleUrl,
  };
}
