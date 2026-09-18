"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { LineItem } from "@/types/catalog";
import { MAX_LINE_QUANTITY } from "@/lib/quote-schema";

const STORAGE_KEY = "peptides:quote-cart";

const EMPTY_CART: LineItem[] = [];

let cartItems: LineItem[] = EMPTY_CART;
let loaded = false;
const listeners = new Set<() => void>();

function loadFromStorage(): LineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // localStorage may be unavailable (private browsing, quota) — the
    // in-memory store still works for the current page lifetime.
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): LineItem[] {
  if (!loaded && typeof window !== "undefined") {
    cartItems = loadFromStorage();
    loaded = true;
  }
  return cartItems;
}

function getServerSnapshot(): LineItem[] {
  // Must return a referentially stable value — a fresh [] here triggers
  // React's "getServerSnapshot should be cached" infinite-loop warning.
  return EMPTY_CART;
}

function setCart(next: LineItem[]) {
  cartItems = next;
  persist();
  notify();
}

function addItem(item: LineItem) {
  const existing = cartItems.find(
    (i) => i.productId === item.productId && i.vialId === item.vialId
  );
  if (existing) {
    setCart(
      cartItems.map((i) =>
        i === existing
          ? {
              ...i,
              quantity: Math.min(MAX_LINE_QUANTITY, i.quantity + item.quantity),
            }
          : i
      )
    );
  } else {
    setCart([
      ...cartItems,
      { ...item, quantity: Math.min(MAX_LINE_QUANTITY, item.quantity) },
    ]);
  }
}

function updateQuantity(productId: string, vialId: string, quantity: number) {
  setCart(
    cartItems.map((i) =>
      i.productId === productId && i.vialId === vialId
        ? { ...i, quantity: Math.max(1, Math.min(MAX_LINE_QUANTITY, quantity)) }
        : i
    )
  );
}

function removeItem(productId: string, vialId: string) {
  setCart(cartItems.filter((i) => !(i.productId === productId && i.vialId === vialId)));
}

function clear() {
  setCart([]);
}

/** Test-only: reset the module-level store between test cases. */
export function __resetCartStoreForTests() {
  cartItems = EMPTY_CART;
  loaded = false;
}

interface CartContextValue {
  items: LineItem[];
  addItem: (item: LineItem) => void;
  updateQuantity: (productId: string, vialId: string, quantity: number) => void;
  removeItem: (productId: string, vialId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, updateQuantity, removeItem, clear }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
