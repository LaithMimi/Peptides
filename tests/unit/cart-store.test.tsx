import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  CartProvider,
  MAX_CART_QUANTITY,
  __resetCartStoreForTests,
  useCart,
} from "@/lib/cart-store";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

const A = "3f0c3a3e-9a53-4c5b-9a3e-2c1f2b6d7a10";
const B = "8a1d1c2e-1c47-4d0a-8f5e-6b0c9a1e2f33";

beforeEach(() => {
  window.localStorage.clear();
  __resetCartStoreForTests();
});

describe("useCart", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
  });

  it("adds an item and merges quantities for the same product", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(A, 2));
    act(() => result.current.addItem(A, 3));
    expect(result.current.items).toEqual([{ productId: A, quantity: 5 }]);
  });

  it("keeps only ids and quantities, never prices", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(A, 1));
    expect(Object.keys(result.current.items[0]).sort()).toEqual(["productId", "quantity"]);
    expect(window.localStorage.getItem("peptides:cart")).toBe(
      JSON.stringify([{ productId: A, quantity: 1 }])
    );
  });

  it("caps quantities at the browser maximum", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(A, 500));
    expect(result.current.items[0].quantity).toBe(MAX_CART_QUANTITY);
  });

  it("updates quantity with a floor of 1 and removes items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(A, 2);
      result.current.addItem(B, 1);
    });
    act(() => result.current.setQuantity(A, 0));
    expect(result.current.items.find((i) => i.productId === A)?.quantity).toBe(1);
    act(() => result.current.removeItem(A));
    expect(result.current.items).toEqual([{ productId: B, quantity: 1 }]);
    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
  });

  it("restores from localStorage and drops malformed or duplicate entries", () => {
    window.localStorage.setItem(
      "peptides:cart",
      JSON.stringify([
        { productId: A, quantity: 2 },
        { productId: A, quantity: 9 },
        { productId: 5, quantity: 1 },
        { productId: B, quantity: "x" },
        null,
      ])
    );
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([{ productId: A, quantity: 2 }]);
  });

  it("ignores corrupt storage", () => {
    window.localStorage.setItem("peptides:cart", "{not json");
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
  });

  it("throws outside a provider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
  });
});
