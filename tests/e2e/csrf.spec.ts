import { test, expect } from "@playwright/test";

// Server Actions must refuse cross-origin POSTs (CSRF). Next compares the
// Origin header with the Host header before dispatching the action.
test("server action POST with a forged Origin is rejected", async ({
  request,
  baseURL,
}) => {
  const url = `${baseURL}/en/quote`;
  const post = (origin: string) =>
    request.post(url, {
      headers: {
        "Next-Action": "00".repeat(20),
        "Content-Type": "text/plain;charset=UTF-8",
        Origin: origin,
      },
      data: "[]",
    });

  const forged = await post("https://evil.example");
  expect(forged.ok()).toBe(false);
  expect(await forged.text()).toContain("Invalid Server Actions request");

  const same = await post(baseURL!);
  expect(await same.text()).not.toContain("Invalid Server Actions request");
});
