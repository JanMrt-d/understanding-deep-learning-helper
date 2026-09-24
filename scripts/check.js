// Smoke-Test für docs/index.html: JS-Fehler, horizontaler Überlauf auf Phone-Breite, alle Kapitel-Tabs.
// Aufruf: NODE_PATH=$(npm root -g) node scripts/check.js
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const file = "file://" + path.resolve(__dirname, "../docs/index.html");
  const browser = await chromium.launch();
  let failed = false;
  for (const vp of [{ width: 1100, height: 900 }, { width: 390, height: 800 }]) {
    for (const scheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: vp, colorScheme: scheme });
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(file);
      await page.waitForTimeout(300);
      const tabs = await page.$$eval("nav.tabs button.tab:not([disabled])", b => b.map(x => x.id));
      for (const id of tabs) {
        await page.click("#" + id);
        await page.waitForTimeout(150);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        if (sw > vp.width) { errors.push(`${id}: horizontaler Überlauf ${sw}px > ${vp.width}px`); }
      }
      const tag = `${vp.width}px ${scheme}`;
      if (errors.length) { failed = true; console.log("FEHLER", tag, errors); } else { console.log("ok", tag, tabs.join(", ")); }
      await page.close();
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
