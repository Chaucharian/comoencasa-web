import { AdminApp } from "@/components/admin/admin-app";
import { isAdmin } from "@/lib/auth";
import { readStore, isFirebaseConfigured, getFirebaseStatus } from "@/lib/store";
import { getOrders } from "@/lib/orders";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cocina · Panel de Control",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdmin();
  const store = authed ? await readStore() : null;
  const initialOrders = authed ? await getOrders() : [];
  const isFirebase = isFirebaseConfigured();
  const firebaseStatus = authed ? getFirebaseStatus() : undefined;
  return (
    <AdminApp
      authed={authed}
      store={store}
      initialOrders={initialOrders}
      isFirebase={isFirebase}
      initialFirebaseStatus={firebaseStatus}
    />
  );
}
