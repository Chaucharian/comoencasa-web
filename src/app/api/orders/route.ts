import { NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere id del pedido." },
        { status: 400 }
      );
    }

    const orders = await getOrders();
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: "Error al consultar estado del pedido." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<
      Order,
      "id" | "status" | "created_at" | "updated_at"
    >;

    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para crear el pedido." },
        { status: 400 }
      );
    }

    const order = await createOrder(body);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el pedido." },
      { status: 500 }
    );
  }
}
