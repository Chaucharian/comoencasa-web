"use client";

import React, { useState, useEffect } from "react";
import { HeaderNav } from "./header-nav";
import { HeroSection } from "./hero-section";
import { MethodSection } from "./method-section";
import { DishShowcaseSection } from "./dish-showcase-section";
import { FullMenuSection } from "./full-menu-section";
import { PackagingFeatureSection } from "./packaging-feature-section";
import { CartDrawer } from "./cart-drawer";
import { Footer } from "./footer";
import { SmoothScroll } from "./smooth-scroll";
import type { CartLine, Dish, Store } from "@/lib/types";

interface LandingAppProps {
  store: Store;
}

const CART_STORAGE_KEY = "abriyservi_cart_v1";

export function LandingApp({ store }: LandingAppProps) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Restore cart on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart, isMounted]);

  // Featured dishes for the showcase section
  const featuredDishes = store.dishes.filter(
    (dish) => dish.featured || ["carne-horno", "pastel-papa", "canelones", "pollo-disco", "lasana", "tarta-jamon"].includes(dish.id)
  );

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleAddToCart = (dish: Dish, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dish.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          lineId: `${dish.id}-${Date.now()}`,
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          qty,
          note: "",
        },
      ];
    });
  };

  const handleUpdateQty = (lineId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.lineId !== lineId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.lineId === lineId ? { ...item, qty: newQty } : item
        )
      );
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF2] text-[#222421] selection:bg-[#8F9E4B]/20 relative">
      <SmoothScroll />

      {/* Floating Header */}
      <HeaderNav
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        whatsappNumber={store.whatsapp}
      />

      {/* Hero Section with Video */}
      <HeroSection />

      {/* 3 Step Regeneration Ritual */}
      <MethodSection />

      {/* Individual Dish Showcase Section ("vendiéndote cada plato") */}
      <DishShowcaseSection
        featuredDishes={featuredDishes.length > 0 ? featuredDishes : store.dishes.slice(0, 5)}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
        whatsappNumber={store.whatsapp}
      />

      {/* Full Catalog Menu Section with Filters */}
      <FullMenuSection
        categories={store.categories}
        dishes={store.dishes}
        onAddToCart={handleAddToCart}
        whatsappNumber={store.whatsapp}
      />

      {/* Vacuum Packaging & Science Feature Section */}
      <PackagingFeatureSection />

      {/* Brand Footer */}
      <Footer store={store} />

      {/* Cart & WhatsApp Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onClearCart={handleClearCart}
        store={store}
      />
    </div>
  );
}
