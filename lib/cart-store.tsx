"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// The cart holds only product ids and quantities. Prices, names and totals are
// always fetched from the server, so nothing price-related is stored or trusted
// in the browser.

export interface CartItem {
  productId: string;
  quantity: number;
}

const STORAGE_KEY = "peptides:cart";
/** Absolute cap in the browser; the store's per-line maximum is applied by the server. */
export const MAX_CART_QUANTITY = 100;

const EMPTY_CART: CartItem[] = [];

let cartItems: CartItem[] = EMPTY_CART;
let loaded = false;
const listeners = new Set<() => void>();

const clamp = (q: number) =>
  Math.max(1, Math.min(MAX_CART_QUANTITY, Math.floor(Number.isFinite(q) ? q : 1)));

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_CART;
    const seen = new Set<string>();
    const items: CartItem[] = [];
    for (const entry of parsed) {
      const productId = (entry as CartItem | null)?.productId;
      const quantity = (entry as CartItem | null)?.quantity;
      if (typeof productId !== "string" || typeof quantity !== "number") continue;
      if (seen.has(productId)) continue;
      seen.add(productId);
      items.push({ productId, quantity: clamp(quantity) });
    }
    return items;
  } catch {
    return EMPTY_CART;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // localStorage may be unavailable (private browsing, quota): the in-memory
    // store still works for the current page lifetime.
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartItem[] {
  if (!loaded && typeof window !== "undefined") {
    cartItems = loadFromStorage();
    loaded = true;
  }
  return cartItems;
}

function getServerSnapshot(): CartItem[] {
  // Must return a referentially stable value: a fresh [] here triggers React's
  // "getServerSnapshot should be cached" infinite-loop warning.
  return EMPTY_CART;
}

function setCart(next: CartItem[]) {
  cartItems = next.length === 0 ? EMPTY_CART : next;
  persist();
  notify();
}

function addItem(productId: string, quantity = 1) {
  const existing = cartItems.find((i) => i.productId === productId);
  if (existing) {
    setCart(
      cartItems.map((i) =>
        i === existing ? { ...i, quantity: clamp(i.quantity + quantity) } : i
      )
    );
  } else {
    setCart([...cartItems, { productId, quantity: clamp(quantity) }]);
  }
}

function setQuantity(productId: string, quantity: number) {
  setCart(cartItems.map((i) => (i.productId === productId ? { ...i, quantity: clamp(quantity) } : i)));
}

function removeItem(productId: string) {
  setCart(cartItems.filter((i) => i.productId !== productId));
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
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, setQuantity, removeItem, clear }),
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
