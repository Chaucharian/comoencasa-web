import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { parseStore } from "@/lib/menu";
import {
  isFirebaseConfigured,
  getStoreFromFirebase,
  saveStoreToFirebase,
} from "@/lib/firebase";
import type { Store } from "@/lib/types";

// El archivo original por defecto que viene con el código
const defaultFile = path.join(process.cwd(), "data", "store.json");

// El directorio temporal donde podemos escribir en serverless (/tmp)
const directory = path.join(os.tmpdir(), "abriyservi-data");
const file = path.join(directory, "store.json");

export { isFirebaseConfigured };

export async function readStore(): Promise<Store> {
  // 1. Si Firebase está configurado, intentamos leer desde Firestore
  if (isFirebaseConfigured()) {
    try {
      const firebaseStore = await getStoreFromFirebase();
      if (firebaseStore) {
        // Guardar en cache local /tmp para mayor velocidad
        try {
          await mkdir(directory, { recursive: true });
          await writeFile(file, `${JSON.stringify(firebaseStore, null, 2)}\n`);
        } catch {
          // Ignorar error de cache
        }
        return firebaseStore;
      }

      // Si el documento aún no existe en Firebase, lo inicializamos con los datos por defecto
      const rawDefault = await readFile(defaultFile, "utf8");
      const defaultStore = parseStore(JSON.parse(rawDefault) as unknown);
      await saveStoreToFirebase(defaultStore);
      return defaultStore;
    } catch (firebaseErr) {
      console.warn("Error leyendo de Firebase Firestore, usando respaldo local:", firebaseErr);
    }
  }

  // 2. Respaldo local (/tmp o data/store.json)
  try {
    let raw: string;
    try {
      raw = await readFile(file, "utf8");
    } catch {
      raw = await readFile(defaultFile, "utf8");
    }
    return parseStore(JSON.parse(raw) as unknown);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("No se pudo leer la carta.");
    throw error;
  }
}

export async function writeStore(store: Store) {
  const clean = parseStore(store);

  // 1. Guardar en Firebase Firestore si está configurado
  if (isFirebaseConfigured()) {
    try {
      await saveStoreToFirebase(clean);
    } catch (firebaseErr) {
      console.error("Error guardando en Firebase Firestore:", firebaseErr);
    }
  }

  // 2. Guardar en cache local temporal
  try {
    await mkdir(directory, { recursive: true });
    const tmp = `${file}.tmp`;
    await writeFile(tmp, `${JSON.stringify(clean, null, 2)}\n`);
    await rename(tmp, file);
  } catch (tmpErr) {
    console.warn("No se pudo escribir en /tmp:", tmpErr);
  }

  // 3. Si estamos en desarrollo local, también actualizamos data/store.json
  try {
    await writeFile(defaultFile, `${JSON.stringify(clean, null, 2)}\n`);
  } catch {
    // En entornos de solo lectura (como Vercel) se ignora silenciosamente
  }

  return clean;
}
