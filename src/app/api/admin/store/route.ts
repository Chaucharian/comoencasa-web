import { isAdmin } from "@/lib/auth";
import { parseStore } from "@/lib/menu";
import { writeStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  const raw = await request.text();
  if (raw.length > 200_000) {
    return NextResponse.json({ error: "La carta es demasiado grande." }, { status: 413 });
  }

  try {
    const store = parseStore(JSON.parse(raw) as unknown);
    const saved = await writeStore(store);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
