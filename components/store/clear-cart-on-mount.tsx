"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/** Empties the browser cart once the confirmation page has loaded. */
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);
  return null;
}
