import { LandingApp } from "@/components/landing/landing-app";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await readStore();
  const menu = {
    ...store,
    dishes: store.dishes.filter((dish) => dish.available),
  };
  return <LandingApp store={menu} />;
}
