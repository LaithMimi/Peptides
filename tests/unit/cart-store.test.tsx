import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CartProvider, useCart, __resetCartStoreForTests } from "@/lib/cart-store";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
  __resetCartStoreForTests();
});

describe("useCart", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
  });

  it("adds a line item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 2 });
    });
    expect(result.current.items).toEqual([
      { productId: "tb-500", vialId: "10mg", quantity: 2 },
    ]);
  });

  it("merges quantities when the same product+vial is added again", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 2 });
    });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 3 });
    });
    expect(result.current.items).toEqual([
      { productId: "tb-500", vialId: "10mg", quantity: 5 },
    ]);
  });

  it("caps merged quantity at 10 and keeps a single line", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 6 });
    });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 6 });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(10);
  });

  it("caps an oversized first add at 10", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 50 });
    });
    expect(result.current.items[0].quantity).toBe(10);
  });

  it("updates quantity within 1-10 bounds", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 1 });
    });
    act(() => {
      result.current.updateQuantity("tb-500", "10mg", 50);
    });
    expect(result.current.items[0].quantity).toBe(10);
    act(() => {
      result.current.updateQuantity("tb-500", "10mg", -5);
    });
    expect(result.current.items[0].quantity).toBe(1);
  });

  it("removes a line item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 1 });
    });
    act(() => {
      result.current.removeItem("tb-500", "10mg");
    });
    expect(result.current.items).toEqual([]);
  });

  it("clears all items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ productId: "tb-500", vialId: "10mg", quantity: 1 });
      result.current.addItem({ productId: "bpc-157", vialId: "10mg", quantity: 1 });
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.items).toEqual([]);
  });
});
