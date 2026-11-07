import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import os from "os";
import type { Order, OrderStatus } from "./types";
import { isFirebaseConfigured } from "./store";

const ORDERS_COLLECTION = "orders";
const defaultOrdersFile = path.join(process.cwd(), "data", "orders.json");
const tmpDir = path.join(os.tmpdir(), "abriyservi-data");
const tmpOrdersFile = path.join(tmpDir, "orders.json");

/**
 * Timeout helper to avoid hanging on uninitialized or blocked Firestore streams
 */
function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.warn("Firestore async operation error:", err?.message || err);
        resolve(null);
      });
  });
}

/**
 * Read all orders from local storage, with background/fallback Firestore sync
 */
export async function getOrders(): Promise<Order[]> {
  // 1. Read local storage first (instant response)
  let localOrders: Order[] = [];
  try {
    let raw: string;
    try {
      raw = await readFile(tmpOrdersFile, "utf8");
    } catch {
      raw = await readFile(defaultOrdersFile, "utf8");
    }
    localOrders = JSON.parse(raw);
    if (!Array.isArray(localOrders)) localOrders = [];
  } catch {
    localOrders = [];
  }

  // 2. If Firebase is configured, attempt to sync from Firestore with strict timeout
  if (isFirebaseConfigured()) {
    try {
      const firestoreAction = async (): Promise<Order[]> => {
        const { initializeApp, getApps, getApp } = await import("firebase/app");
        const { getFirestore, collection, getDocs, query, orderBy } = await import(
          "firebase/firestore"
        );

        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

        if (!apiKey || !projectId) return [];

        const config = {
          apiKey,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        const app = getApps().length > 0 ? getApp() : initializeApp(config);
        const db = getFirestore(app);

        const q = query(collection(db, ORDERS_COLLECTION), orderBy("created_at", "desc"));
        const snap = await getDocs(q);

        const firestoreOrders: Order[] = [];
        snap.forEach((doc) => {
          firestoreOrders.push({ ...(doc.data() as Order), id: doc.id });
        });
        return firestoreOrders;
      };

      const remoteOrders = await withTimeout(firestoreAction(), 1500);

      if (remoteOrders && remoteOrders.length > 0) {
        // Merge with local orders
        const map = new Map<string, Order>();
        remoteOrders.forEach((o) => map.set(o.id, o));
        localOrders.forEach((o) => {
          if (!map.has(o.id)) map.set(o.id, o);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Update local cache
        try {
          await mkdir(tmpDir, { recursive: true });
          await writeFile(tmpOrdersFile, JSON.stringify(merged, null, 2));
        } catch {
          // Ignore
        }
        return merged;
      }
    } catch (err) {
      console.warn("Firestore orders read failed:", err);
    }
  }

  return localOrders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Save a new order
 */
export async function createOrder(
  data: Omit<Order, "id" | "status" | "created_at" | "updated_at">
): Promise<Order> {
  const now = new Date().toISOString();
  // Short readable ID: ORD-XXXX
  const shortNum = Math.floor(1000 + Math.random() * 9000);
  const id = `ORD-${shortNum}`;

  const order: Order = {
    ...data,
    id,
    status: "nuevo",
    created_at: now,
    updated_at: now,
  };

  // 1. Immediately save to local storage (instant response guaranteed)
  const currentOrders = await getOrders();
  const updatedOrders = [order, ...currentOrders.filter((o) => o.id !== id)];

  try {
    await mkdir(tmpDir, { recursive: true });
    await writeFile(tmpOrdersFile, JSON.stringify(updatedOrders, null, 2));
    try {
      await writeFile(defaultOrdersFile, JSON.stringify(updatedOrders, null, 2));
    } catch {
      // Ignore
    }
  } catch (err) {
    console.error("Error writing order to local storage:", err);
  }

  // 2. Background Firestore write with timeout
  if (isFirebaseConfigured()) {
    const firestoreWrite = async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

      if (!apiKey || !projectId) return;

      const config = {
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);

      await setDoc(doc(db, ORDERS_COLLECTION, id), order, { merge: true });
    };

    withTimeout(firestoreWrite(), 1500).catch(() => {});
  }

  return order;
}

/**
 * Update an order's status
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<Order | null> {
  const currentOrders = await getOrders();
  const index = currentOrders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedOrder: Order = {
    ...currentOrders[index],
    status: newStatus,
    updated_at: now,
  };

  currentOrders[index] = updatedOrder;

  // 1. Immediately update local storage
  try {
    await mkdir(tmpDir, { recursive: true });
    await writeFile(tmpOrdersFile, JSON.stringify(currentOrders, null, 2));
    try {
      await writeFile(defaultOrdersFile, JSON.stringify(currentOrders, null, 2));
    } catch {
      // Ignore
    }
  } catch (err) {
    console.error("Error updating local order:", err);
  }

  // 2. Background Firestore update
  if (isFirebaseConfigured()) {
    const firestoreUpdate = async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, updateDoc } = await import("firebase/firestore");

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

      if (!apiKey || !projectId) return;

      const config = {
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        status: newStatus,
        updated_at: now,
      });
    };

    withTimeout(firestoreUpdate(), 1500).catch(() => {});
  }

  return updatedOrder;
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  const currentOrders = await getOrders();
  const filtered = currentOrders.filter((o) => o.id !== orderId);

  try {
    await mkdir(tmpDir, { recursive: true });
    await writeFile(tmpOrdersFile, JSON.stringify(filtered, null, 2));
    try {
      await writeFile(defaultOrdersFile, JSON.stringify(filtered, null, 2));
    } catch {
      // Ignore
    }
  } catch (err) {
    console.error("Error deleting local order:", err);
  }

  if (isFirebaseConfigured()) {
    const firestoreDelete = async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, deleteDoc } = await import("firebase/firestore");

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

      if (!apiKey || !projectId) return;

      const config = {
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);

      await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    };

    withTimeout(firestoreDelete(), 1500).catch(() => {});
  }

  return true;
}
