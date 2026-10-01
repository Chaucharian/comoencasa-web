import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { parseStore } from "@/lib/menu";
import type { Store } from "@/lib/types";

const directory = path.join(process.cwd(), "data");
const file = path.join(directory, "store.json");

export async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(file, "utf8");
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
