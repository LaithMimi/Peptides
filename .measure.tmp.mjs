import { chromium, devices } from "@playwright/test";

const base = process.env.BASE ?? "http://localhost:3100";
const paths = (process.argv[2] ?? "/en,/ar,/en/shop,/en/cart,/en/checkout,/en/contact").split(",");
const runs = Number(process.env.RUNS ?? 2);

const browser = await chromium.launch();
const out = [];
for (const path of paths) {
  const samples = [];
  for (let r = 0; r < runs; r++) {
    const ctx = await browser.newContext({ ...devices["Pixel 7"] });
    // Skip the first-visit consent/goal modals so we measure the page, not a dialog.
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("pepclub-goal-picker-seen", "1");
      } catch {}
    });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const bytes = { script: 0, font: 0, image: 0, document: 0, stylesheet: 0, other: 0 };
    const fonts = [];
    const reqType = new Map();
    cdp.on("Network.responseReceived", (e) => reqType.set(e.requestId, [e.type, e.response.url]));
    cdp.on("Network.loadingFinished", (e) => {
      const [type, url] = reqType.get(e.requestId) ?? ["Other", ""];
      const k = { Script: "script", Font: "font", Image: "image", Document: "document", Stylesheet: "stylesheet" }[type] ?? "other";
      bytes[k] += e.encodedDataLength;
      if (k === "font") fonts.push(url.split("/").pop() + ":" + Math.round(e.encodedDataLength / 1024) + "k");
    });
    await page.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0, tbt: 0, lcpEl: "" };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpEl = (e.element?.tagName ?? "") + (e.url ? " " + e.url.slice(-60) : ""); }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => ({
      ...window.__m,
      fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0,
      dom: document.getElementsByTagName("*").length,
      scripts: document.scripts.length,
      htmlKB: Math.round(document.documentElement.outerHTML.length / 1024),
      preloads: [...document.querySelectorAll('link[rel=preload][as=font]')].map((l) => l.href.split("/").pop()),
    }));
    samples.push({ ...m, bytes, fonts });
    await ctx.close();
  }
  const best = samples.sort((a, b) => a.lcp - b.lcp)[0];
  const kb = (n) => Math.round(n / 1024);
  out.push({
    path,
    fcp: Math.round(best.fcp), lcp: Math.round(best.lcp), lcpEl: best.lcpEl, cls: +best.cls.toFixed(3), tbt: Math.round(best.tbt),
    jsKB: kb(best.bytes.script), fontKB: kb(best.bytes.font), imgKB: kb(best.bytes.image), docKB: kb(best.bytes.document), cssKB: kb(best.bytes.stylesheet),
    dom: best.dom, fonts: best.fonts.join(" "), preloads: best.preloads.join(" "),
  });
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
