import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { parseStore } from "@/lib/menu";
import { getFirebaseStatus, readStore, writeStore } from "@/lib/store";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  try {
    const store = await readStore();
    const firebaseStatus = getFirebaseStatus();
    return NextResponse.json({ store, firebaseStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo leer la carta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  const raw = await request.text();
  if (raw.length > 5_000_000) {
    return NextResponse.json({ error: "La carta es demasiado grande." }, { status: 413 });
  }

  try {
    const parsedInput = JSON.parse(raw) as unknown;
    const store = parseStore(parsedInput);
    const saved = await writeStore(store);

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {
      // Ignorar si no aplica en entorno actual
    }

    const firebaseStatus = getFirebaseStatus();
    return NextResponse.json({
      ...saved,
      firebaseStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
