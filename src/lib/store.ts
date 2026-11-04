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

async function readLocalFallbackStore(): Promise<Store> {
  const tmpStore = await readJsonStore(tmpFile);
  if (tmpStore) return tmpStore;

  const defaultStore = await readJsonStore(defaultFile);
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
  // 1. Firestore es la única fuente de verdad en producción y desarrollo
  if (isFirebaseConfigured()) {
    try {
      const firebaseStore = await getStoreFromFirebase();
      if (firebaseStore) {
        await persistLocalFiles(firebaseStore);
        return firebaseStore;
      }
    } catch (firebaseErr) {
      console.warn("Error leyendo de Firebase Firestore, usando respaldo local:", firebaseErr);
    }
  }

  // 2. Respaldo local (/tmp o data/store.json) solo si Firestore no respondió
  return readLocalFallbackStore();
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

  // 1. Guardar primero en Firebase Firestore (fuente de verdad en producción)
  if (isFirebaseConfigured()) {
    const savedInCloud = await saveStoreToFirebase(clean);
    if (!savedInCloud) {
      const status = getFirebaseStatus();
      throw new Error(
        status.message || "No se pudo guardar en Firebase Firestore. Revisá la conexión.",
      );
    }
  }

  // 2. Actualizar caché local (/tmp y data/store.json)
  await persistLocalFiles(clean);

  return clean;
}
