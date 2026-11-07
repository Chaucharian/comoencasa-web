import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { parseStore } from "@/lib/menu";
import {
  isFirebaseConfigured,
  getStoreFromFirebase,
  saveStoreToFirebase,
  getFirebaseStatus,
} from "@/lib/firebase";
import type { Store } from "@/lib/types";

// Archivo base del proyecto
const defaultFile = path.join(process.cwd(), "data", "store.json");

// Directorio temporal de lectura/escritura rápida (/tmp en serverless)
const directory = path.join(os.tmpdir(), "abriyservi-data");
const tmpFile = path.join(directory, "store.json");

export { isFirebaseConfigured, getFirebaseStatus };

async function readJsonStore(filePath: string): Promise<Store | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const store = parseStore(parsed);
    if (typeof parsed.updated_at === "string") {
      store.updated_at = parsed.updated_at;
    }
    if (typeof parsed.created_at === "string") {
      store.created_at = parsed.created_at;
    }
    return store;
  } catch {
    return null;
  }
}

function getTimestampMs(iso?: string): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

async function readNewestLocalStore(): Promise<Store> {
  const [tmpStore, defaultStore] = await Promise.all([
    readJsonStore(tmpFile),
    readJsonStore(defaultFile),
  ]);

  if (tmpStore && defaultStore) {
    return getTimestampMs(tmpStore.updated_at) >= getTimestampMs(defaultStore.updated_at)
      ? tmpStore
      : defaultStore;
  }

  if (tmpStore) return tmpStore;
  if (defaultStore) return defaultStore;

  throw new Error("No se pudo leer la carta.");
}

async function persistLocalFiles(store: Store): Promise<void> {
  const serialized = `${JSON.stringify(store, null, 2)}\n`;

  try {
    await mkdir(directory, { recursive: true });
    const tempSwap = `${tmpFile}.tmp`;
    await writeFile(tempSwap, serialized);
    await rename(tempSwap, tmpFile);
  } catch (tmpErr) {
    console.warn("No se pudo escribir en /tmp:", tmpErr);
  }

  try {
    await writeFile(defaultFile, serialized);
  } catch {
    // En entornos serverless de solo lectura (ej. Vercel) se ignora silenciosamente
  }
}

export async function readStore(): Promise<Store> {
  const localStore = await readNewestLocalStore();

  if (isFirebaseConfigured()) {
    try {
      const firebaseStore = await getStoreFromFirebase();
      if (firebaseStore) {
        const remoteTime = getTimestampMs(firebaseStore.updated_at);
        const localTime = getTimestampMs(localStore.updated_at);

        // Si la versión local es más reciente que la de Firestore, preservamos la local y sincronizamos
        if (localTime > remoteTime) {
          saveStoreToFirebase(localStore).catch(() => {});
          return localStore;
        }

        await persistLocalFiles(firebaseStore);
        return firebaseStore;
      }

      // Si no hay documento en Firestore o aún no se inicializó, sincronizamos en segundo plano sin bloquear
      saveStoreToFirebase(localStore).catch(() => {});
    } catch (firebaseErr) {
      console.warn("Error leyendo de Firebase Firestore, usando respaldo local:", firebaseErr);
    }
  }

  return localStore;
}

export async function writeStore(store: Store): Promise<Store> {
  const now = new Date().toISOString();
  const clean = parseStore({
    ...store,
    created_at: store.created_at || now,
    updated_at: now,
  });
  clean.created_at = store.created_at || now;
  clean.updated_at = now;

  // 1. Persistir inmediatamente en disco local y /tmp (respuesta garantizada)
  await persistLocalFiles(clean);

  // 2. Guardar en Firebase Firestore si está configurado
  if (isFirebaseConfigured()) {
    try {
      await saveStoreToFirebase(clean);
    } catch (firebaseErr) {
      console.error("Error guardando en Firebase Firestore:", firebaseErr);
    }
  }

  return clean;
}
