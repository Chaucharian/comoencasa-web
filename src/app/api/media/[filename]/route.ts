import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { getImageFromFirebase } from "@/lib/firebase";

const FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXT[ext] || "image/webp";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  if (!filename || !FILENAME_PATTERN.test(filename)) {
    return NextResponse.json({ error: "Archivo inválido." }, { status: 400 });
  }

  const tmpMediaDir = path.join(os.tmpdir(), "abriyservi-data", "media");
  const tmpFilePath = path.join(tmpMediaDir, filename);
  const publicFilePath = path.join(process.cwd(), "public", "menu", filename);

  // 1. Check /tmp cache
  try {
    const buf = await readFile(tmpFilePath);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": getMimeType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Continue to next source
  }

  // 2. Check public/menu directory
  try {
    const buf = await readFile(publicFilePath);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": getMimeType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Continue to Firestore media collection
  }

  // 3. Check Firebase Firestore `media` collection
  const remoteImage = await getImageFromFirebase(filename);
  if (remoteImage) {
    try {
      await mkdir(tmpMediaDir, { recursive: true });
      await writeFile(tmpFilePath, remoteImage.buffer);
    } catch {
      // Ignore cache write failure
    }

    return new NextResponse(new Uint8Array(remoteImage.buffer), {
      headers: {
        "Content-Type": remoteImage.mimeType || getMimeType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
}

