import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen." }, { status: 400 });
  }

  const extension = types[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Usá una foto JPG, PNG o WebP." }, { status: 400 });
  }
  if (file.size > 2_500_000) {
    return NextResponse.json({ error: "La foto pesa más de 2,5 MB." }, { status: 413 });
  }

  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${extension}`;
  const directory = path.join(process.cwd(), "public", "menu");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ path: `/menu/${filename}` });
}
