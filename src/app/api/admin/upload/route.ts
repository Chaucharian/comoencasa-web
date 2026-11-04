import { randomBytes } from "crypto";
import { mkdir, readdir, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listImagesFromFirebase, uploadImageToFirebase } from "@/lib/firebase";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const VALID_IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  const images = new Set<string>();

  // 1. Read from public/menu
  try {
    const publicDir = path.join(process.cwd(), "public", "menu");
    const files = await readdir(publicDir);
    for (const file of files) {
      if (VALID_IMAGE_EXT.test(file) && file !== "hero.jpg") {
        images.add(`/menu/${file}`);
      }
    }
  } catch {
    // Ignore
  }

  // 2. Read from /tmp/abriyservi-data/media
  try {
    const tmpMediaDir = path.join(os.tmpdir(), "abriyservi-data", "media");
    const files = await readdir(tmpMediaDir);
    for (const file of files) {
      if (VALID_IMAGE_EXT.test(file)) {
        images.add(`/api/media/${file}`);
      }
    }
  } catch {
    // Ignore
  }

  // 3. Read from Firebase Firestore `media` collection
  try {
    const remoteImages = await listImagesFromFirebase();
    for (const img of remoteImages) {
      images.add(img);
    }
  } catch {
    // Ignore
  }

  return NextResponse.json({ images: Array.from(images) });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Usá una foto JPG, PNG, WebP o AVIF." },
      { status: 400 },
    );
  }
  if (file.size > 10_000_000) {
    return NextResponse.json(
      { error: "La foto pesa más de 10 MB." },
      { status: 413 },
    );
  }

  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Write to /tmp/abriyservi-data/media (works everywhere including Vercel serverless)
  try {
    const tmpMediaDir = path.join(os.tmpdir(), "abriyservi-data", "media");
    await mkdir(tmpMediaDir, { recursive: true });
    await writeFile(path.join(tmpMediaDir, filename), buffer);
  } catch (err) {
    console.warn("Could not write uploaded image to /tmp:", err);
  }

  // 2. Write to public/menu (works in local development and persistent servers)
  let savedToPublic = false;
  try {
    const publicDir = path.join(process.cwd(), "public", "menu");
    await mkdir(publicDir, { recursive: true });
    await writeFile(path.join(publicDir, filename), buffer);
    savedToPublic = true;
  } catch {
    // Read-only filesystem in serverless environments
  }

  // 3. Upload to Firebase (Storage or Firestore `media` collection - 100% free)
  const cloudUpload = await uploadImageToFirebase(filename, buffer, file.type);
  if (cloudUpload) {
    return NextResponse.json({
      path: cloudUpload.url,
      provider: cloudUpload.provider,
    });
  }

  // 4. Fallback to /api/media/[filename] (which serves from /tmp, public/menu, or Firestore)
  return NextResponse.json({
    path: savedToPublic ? `/menu/${filename}` : `/api/media/${filename}`,
    provider: "local",
  });
}
