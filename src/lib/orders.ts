import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import os from "os";
import type { Order, OrderStatus } from "./types";
import { isFirebaseConfigured, getFirebaseProjectId, getFirebaseStorageBucket } from "./firebase";

const ORDERS_COLLECTION = "orders";
const defaultOrdersFile = path.join(process.cwd(), "data", "orders.json");
const tmpDir = path.join(os.tmpdir(), "abriyservi-data");
const tmpOrdersFile = path.join(tmpDir, "orders.json");

const DEFAULT_API_KEY = "AIzaSyBObuvyLsyMh5Ly-Uf0svX0EwFCDRH9qoU";
const DEFAULT_APP_ID = "1:570318467650:web:82b6d8d698bf4734a4b3db";

function getFirebaseConfig() {
  const projectId = getFirebaseProjectId();
  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    DEFAULT_API_KEY;

  return {
    apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: getFirebaseStorageBucket(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_APP_ID,
  };
}

/**
 * Timeout helper for serverless Firestore operations
 */
function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T | null> {
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
 * Read all orders from Firestore (primary) + local fallback
 */
export async function getOrders(): Promise<Order[]> {
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

  if (isFirebaseConfigured()) {
    try {
      const firestoreAction = async (): Promise<Order[]> => {
        const { initializeApp, getApps, getApp } = await import("firebase/app");
        const { getFirestore, collection, getDocs, query, orderBy } = await import(
          "firebase/firestore"
        );

        const config = getFirebaseConfig();
        const app = getApps().length > 0 ? getApp() : initializeApp(config);
        const db = getFirestore(app);

        const q = query(collection(db, ORDERS_COLLECTION), orderBy("created_at", "desc"));
        const snap = await getDocs(q);

        const firestoreOrders: Order[] = [];
        snap.forEach((docSnap) => {
          firestoreOrders.push({ ...(docSnap.data() as Order), id: docSnap.id });
        });
        return firestoreOrders;
      };

      const remoteOrders = await withTimeout(firestoreAction(), 6000);

      if (remoteOrders) {
        const sorted = remoteOrders.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        try {
          await mkdir(tmpDir, { recursive: true });
          await writeFile(tmpOrdersFile, JSON.stringify(sorted, null, 2));
        } catch {
          // Ignore
        }
        return sorted;
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
  const shortNum = Math.floor(1000 + Math.random() * 9000);
  const id = `ORD-${shortNum}`;

  const order: Order = {
    ...data,
    id,
    status: "nuevo",
    created_at: now,
    updated_at: now,
  };

  if (isFirebaseConfigured()) {
    const firestoreWrite = async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");

      const config = getFirebaseConfig();
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);

      await setDoc(
        doc(db, ORDERS_COLLECTION, id),
        JSON.parse(JSON.stringify(order)),
        { merge: true },
      );
    };

    await withTimeout(firestoreWrite(), 6000);
  }

  try {
    const currentOrders = await getOrders();
    const updatedOrders = [order, ...currentOrders.filter((o) => o.id !== id)];
    await mkdir(tmpDir, { recursive: true });
    await writeFile(tmpOrdersFile, JSON.stringify(updatedOrders, null, 2));
    try {
      await writeFile(defaultOrdersFile, JSON.stringify(updatedOrders, null, 2));
    } catch {
      // Ignore in serverless
    }
  } catch (err) {
    console.error("Error writing order to local storage:", err);
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

  if (isFirebaseConfigured()) {
    const firestoreUpdate = async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");

      const config = getFirebaseConfig();
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);

      await setDoc(
        doc(db, ORDERS_COLLECTION, orderId),
        {
          status: newStatus,
          updated_at: now,
        },
        { merge: true },
      );
    };

    await withTimeout(firestoreUpdate(), 6000);
  }

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

  return updatedOrder;
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const firestoreDelete = async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, deleteDoc } = await import("firebase/firestore");

      const config = getFirebaseConfig();
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);

      await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    };

    await withTimeout(firestoreDelete(), 6000);
  }

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

  return true;
}
