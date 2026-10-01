import { MenuApp } from "@/components/menu/menu-app";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await readStore();
  const menu = {
    ...store,
    dishes: store.dishes.filter((dish) => dish.available),
  };
  return <MenuApp store={menu} />;
}
