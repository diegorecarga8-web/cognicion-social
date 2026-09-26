const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.dirname(new URL(import.meta.url).pathname);
const items = [
  ['01-corona', '01 · Corona'], ['02-pantalla', '02 · Pantalla'], ['03-resplandor', '03 · Resplandor'],
  ['04-cruz-celular', '04 · Cruz en el celular'], ['05-luz-y-sombra', '05 · Luz y sombra'], ['06-monograma', '06 · Monograma'],
  ['07-tipografico', '07 · Tipográfico'], ['08-sello', '08 · Sello'], ['09-reverso', '09 · Reverso (para cualquiera)'],
  ['10-monograma-claro', '10 · Monograma claro'],
];
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../fonts/fonts.css">
<style>body{margin:0;background:#e6e5e1;font-family:Archivo;color:#111}
.h{display:flex;align-items:baseline;gap:16px;padding:36px 40px 8px}
.h b{font-weight:900;font-stretch:125%;font-size:40px}.h span{font-family:'EB Garamond';font-size:26px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;padding:18px 40px 40px}
figure{margin:0}img{width:100%;display:block;border-radius:6px}
figcaption{font-weight:800;font-size:20px;padding:8px 2px 0}</style></head><body>
<div class="h"><b>JDCEL</b><span>ideas de bolsa · bendecidos para bendecir</span></div>
<div class="g">${items.map(([f, t]) => `<figure><img src="${f}.jpg"><figcaption>${t}</figcaption></figure>`).join('')}</div></body></html>`;
const file = path.join(DIR, 'out', 'overview.html');
fs.writeFileSync(file, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('file://' + file);
await page.evaluate(async () => { await document.fonts.load('900 40px Archivo'); await document.fonts.load('800 22px Archivo'); await document.fonts.load('26px "EB Garamond"'); await document.fonts.ready; });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(DIR, 'out', 'overview.jpg'), type: 'jpeg', quality: 88, fullPage: true });
await browser.close();
console.log('ok');
