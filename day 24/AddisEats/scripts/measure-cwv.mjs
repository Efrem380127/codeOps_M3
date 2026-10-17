// Measure the Core Web Vitals the PERF.md budget claims, on the deployed URL,
// with the throttling the doc describes (mobile Slow 4G + 4x CPU).
//
// LCP and CLS come from PerformanceObserver on the real page. This is not
// Lighthouse's simulated score, it is the browser's own observation, so the
// numbers are reproducible with `node measure-cwv-d24.mjs` rather than copied
// from somewhere.
import { chromium } from "playwright";

const BASE = process.env.BASE || "https://addis-eats-capstone.vercel.app";
const ROUTE = process.env.ROUTE || "/";

(async () => {
  const browser = await chromium.launch({
    executablePath:
      "C:/Users/Roba/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe"
  });

  for (const device of [
    { name: "mobile", viewport: { width: 390, height: 844 }, dpr: 3, cpu: 4 },
    { name: "desktop", viewport: { width: 1440, height: 900 }, dpr: 1, cpu: 1 }
  ]) {
    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: device.dpr
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);

    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150, // Slow 4G round trip
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8
    });
    if (device.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: device.cpu });

    // Install the observers before any navigation.
    await page.addInitScript(() => {
      window.__cwv = { lcp: 0, cls: 0, lcpEl: "" };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__cwv.lcp = Math.round(e.startTime);
          window.__cwv.lcpEl = e.element ? (e.element.tagName || "") : "";
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) window.__cwv.cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    const t0 = Date.now();
    await page.goto(BASE + ROUTE, { waitUntil: "load", timeout: 60000 });
    const ttfb = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return nav ? Math.round(nav.responseStart) : 0;
    });
    // Let late layout shifts settle.
    await page.waitForTimeout(3500);
    const cwv = await page.evaluate(() => window.__cwv);

    console.log(
      `${device.name.padEnd(8)} LCP ${String(cwv.lcp).padStart(5)}ms   ` +
        `CLS ${cwv.cls.toFixed(4)}   TTFB ${String(ttfb).padStart(4)}ms   ` +
        `wall ${Date.now() - t0}ms   (largest element: ${cwv.lcpEl || "image/text"})`
    );

    await context.close();
  }

  await browser.close();
})();
