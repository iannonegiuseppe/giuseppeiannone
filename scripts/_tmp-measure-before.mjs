import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto("http://localhost:3000/disturbi-d-ansia", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.querySelector('[class*="RecognitionConstellation"][class*="constellation"]')?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(2500);

  const result = await page.evaluate(() => {
    const smallTier = document.querySelector('[class*="smallTier"]');
    const items = smallTier ? [...smallTier.children] : [];
    // Column 1 items are children at indices 0, 3, 6... (grid auto-place, 3 cols)
    const col1Items = items.filter((_, i) => i % 3 === 0);
    const rects = col1Items.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), height: Math.round(r.height) };
    });
    const gaps = [];
    for (let i = 1; i < rects.length; i++) {
      gaps.push(rects[i].top - rects[i - 1].bottom);
    }
    return { itemCount: items.length, col1Rects: rects, col1Gaps: gaps };
  });

  console.log("BEFORE (with labels):", JSON.stringify(result, null, 2));
  await browser.close();
}
main().catch((e) => { console.error("ERR", e.message); process.exit(1); });
