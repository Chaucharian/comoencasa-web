import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { parseStore } from "@/lib/menu";
import type { Store } from "@/lib/types";

// El archivo original por defecto que viene con el código (solo lectura)
const defaultFile = path.join(process.cwd(), "data", "store.json");

// El directorio temporal donde SÍ podemos escribir en Vercel (/tmp)
const directory = path.join(os.tmpdir(), "comoencasa-data");
const file = path.join(directory, "store.json");

export async function readStore(): Promise<Store> {
  try {
    let raw: string;
    try {
      // Intentar leer los datos guardados en /tmp
      raw = await readFile(file, "utf8");
    } catch {
      // Si no hay datos guardados aún, leemos el JSON que viene en el repo
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
  await mkdir(directory, { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, `${JSON.stringify(clean, null, 2)}\n`);
  await rename(tmp, file);
  return clean;
}
