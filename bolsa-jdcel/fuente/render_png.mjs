// Renderiza SVG a PNG con fondo transparente (respaldo de los gráficos del .pptx).
// Uso: node render_png.mjs manifiesto.json   → [{ "svg": "<svg…>", "png": "ruta.png", "w": 600, "h": 400 }]
import fs from 'node:fs';

const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const items = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage();
for (const it of items) {
  await page.setViewportSize({ width: it.w, height: it.h });
  const svg = it.svg.replace('<svg ', `<svg style="display:block;width:${it.w}px;height:${it.h}px" `);
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await page.screenshot({ path: it.png, omitBackground: true, clip: { x: 0, y: 0, width: it.w, height: it.h } });
}
await browser.close();
console.log(`png: ${items.length}`);
