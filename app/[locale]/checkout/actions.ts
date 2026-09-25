"use server";

import { headers } from "next/headers";
import { placeOrder, type PlaceOrderResult } from "@/lib/orders";
import { priceCart, type PricedCart } from "@/lib/pricing";
import type { PlaceOrderInput } from "@/lib/schemas/order";

function locale(value: unknown): "en" | "ar" {
  return value === "ar" ? "ar" : "en";
}

/** Read-only: current server prices for the browser's cart (product ids and quantities only). */
export async function priceCartAction(
  items: { productId: string; quantity: number }[],
  localeInput: string
): Promise<PricedCart> {
  const safe = Array.isArray(items)
    ? items
        .filter((i) => typeof i?.productId === "string" && typeof i?.quantity === "number")
        .map((i) => ({ productId: i.productId, quantity: i.quantity }))
    : [];
  return priceCart(safe, locale(localeInput));
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  );
}

/** Creates the order. Everything price-related is recomputed on the server. */
export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  return placeOrder(input, { ip: await clientIp() });
}
