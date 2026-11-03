import { AdminApp } from "@/components/admin/admin-app";
import { isAdmin } from "@/lib/auth";
import { readStore, isFirebaseConfigured } from "@/lib/store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cocina",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdmin();
  const store = authed ? await readStore() : null;
  const isFirebase = isFirebaseConfigured();
  return <AdminApp authed={authed} store={store} isFirebase={isFirebase} />;
}
