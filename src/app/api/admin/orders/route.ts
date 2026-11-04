import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getOrders, updateOrderStatus, deleteOrder } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdmin();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const authed = await isAdmin();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { id, status } = (await request.json()) as {
      id: string;
      status: OrderStatus;
    };

    if (!id || !status) {
      return NextResponse.json(
        { error: "Se requiere id y status." },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, status);
    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado del pedido." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authed = await isAdmin();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Se requiere id." }, { status: 400 });
    }

    await deleteOrder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el pedido." },
      { status: 500 }
    );
  }
}
