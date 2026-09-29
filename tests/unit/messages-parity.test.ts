import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k)
  );
}

describe("message catalogs", () => {
  it("en.json and ar.json have identical keys", () => {
    const enKeys = new Set(keyPaths(en));
    const arKeys = new Set(keyPaths(ar));
    expect([...enKeys].filter((k) => !arKeys.has(k))).toEqual([]);
    expect([...arKeys].filter((k) => !enKeys.has(k))).toEqual([]);
  });

  it("every errors.* code the customer-facing order schema can raise exists in both languages", () => {
    // lib/schemas/order.ts is the only schema whose short codes are shown to
    // the customer (translated via the `errors` namespace, see
    // components/store/checkout-form.tsx). Admin schemas (lib/schemas/admin.ts)
    // are surfaced through the separate, English-only map in
    // components/admin/admin-form.tsx and are intentionally out of scope here.
    const source = readFileSync(join(process.cwd(), "lib/schemas/order.ts"), "utf-8");
    const codes = new Set(
      [...source.matchAll(/(?:message|error):\s*"([A-Za-z]+)"/g)].map((m) => m[1])
    );
    expect(codes.size).toBeGreaterThan(0);

    const enErrors = (en as Record<string, unknown>).errors as Record<string, unknown>;
    const arErrors = (ar as Record<string, unknown>).errors as Record<string, unknown>;
    for (const code of codes) {
      expect(enErrors, `errors.${code} missing in en.json`).toHaveProperty(code);
      expect(arErrors, `errors.${code} missing in ar.json`).toHaveProperty(code);
    }
  });
});
