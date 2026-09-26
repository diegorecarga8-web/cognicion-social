// Presentación en PowerPoint con las propuestas montadas en las bolsas.
// Uso: sh fetch-fonts.sh && npm install && node presentacion.mjs  → ../JDCEL-propuestas-bolsa.pptx
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(HERE, '..');
const ASSETS = path.join(HERE, 'out', 'presentacion');
const OUTPUT = path.join(ROOT, 'JDCEL-propuestas-bolsa.pptx');
fs.mkdirSync(ASSETS, { recursive: true });

const P = [
  {
    id: '01-corona', n: '01', name: 'Corona', bag: 'Blanca', print: 'Relieve seco en la corona y logo en negro mate', handles: 'Cordón negro', level: 'Alta',
    desc: 'La idea original, depurada: queda solo la corona de espinas en relieve, rodeando el monograma. Se ve elegante, no le quita protagonismo al logo y el molde del relieve es pequeño.',
    notes: 'Evolución de la propuesta original: en vez del rostro completo, solo la corona de espinas en relieve seco alrededor del monograma. El logo manda, el molde del relieve es más pequeño (más barato) y el símbolo funciona para cualquier creyente. Impresión: relieve seco (golpe seco) y logo en negro mate u hot stamping negro.',
  },
  {
    id: '02-pantalla', n: '02', name: 'Pantalla', bag: 'Negra', print: 'Blanco: serigrafía o hot stamping', handles: 'Cordón blanco, como un cable de cargador', level: 'Media', dark: true,
    desc: 'La bolsa es un celular bloqueado: el monograma hace de reloj, el eslogan de fecha, llega una notificación de JDCEL y WhatsApp e Instagram son los botones.',
    notes: 'La bolsa imita la pantalla de bloqueo de un celular. El monograma ocupa el lugar del reloj, el eslogan el de la fecha, y los botones de linterna y cámara se vuelven WhatsApp e Instagram. Es la más memorable y dice «celulares» sin escribirlo. Impresión: blanco sobre cartulina negra (serigrafía o hot stamping blanco). Cordón blanco.',
  },
  {
    id: '03-resplandor', n: '03', name: 'Resplandor', bag: 'Blanca', print: 'Una tinta negra', handles: 'Cordón negro', level: 'Baja',
    desc: 'Rayos alrededor del monograma que se leen como luz y como señal. Es la más económica de imprimir y la que mejor se reconoce de lejos.',
    notes: 'Rayos alrededor del monograma: luz y señal a la vez. Una sola tinta negra, la opción más económica y la que mejor se ve de lejos.',
  },
  {
    id: '04-cruz-celular', n: '04', name: 'Cruz en el celular', bag: 'Blanca con fuelles negros', table: 'Blanca, fuelles negros', print: 'Una tinta negra', handles: 'Cordón negro', level: 'Baja',
    desc: 'La silueta de un celular partida por una cruz blanca. La cruz está en el espacio vacío, así que se descubre en una segunda mirada.',
    notes: 'La silueta de un celular partida por una cruz en el espacio blanco; la cruz se descubre en una segunda mirada. Una tinta negra; los fuelles van negros para dar contraste.',
  },
  {
    id: '05-luz-y-sombra', n: '05', name: 'Luz y sombra', bag: 'Mitad negra y mitad blanca', table: 'Negra y blanca', print: 'Una tinta negra (la mitad negra es fondo)', handles: 'Cordón negro', level: 'Baja',
    desc: 'La bolsa es mitad negra y mitad blanca, y todo cambia de color al cruzar la línea del centro: la luz en medio de la oscuridad (Juan 1:5).',
    notes: 'El monograma, el nombre y el eslogan cambian de color al cruzar la línea del centro. Idea de fondo: la luz en la oscuridad (Juan 1:5). Una tinta negra; la mitad negra es un fondo impreso.',
  },
  {
    id: '06-monograma', n: '06', name: 'Monograma', bag: 'Negra', print: 'Barniz UV brillante sobre laminado mate y etiqueta blanca', handles: 'Cordón negro', level: 'Alta', dark: true,
    desc: 'Un patrón de monogramas y cruces que solo aparece cuando le pega la luz, con una etiqueta blanca que lleva el logo. Estilo de marca de lujo.',
    notes: 'Bolsa negra con un patrón de monogramas y cruces en barniz UV brillante sobre laminado mate: solo aparece cuando le pega la luz. En el centro, una etiqueta blanca con el logo. Es de las más costosas por el barniz.',
  },
  {
    id: '07-tipografico', n: '07', name: 'Tipográfico', bag: 'Blanca', print: 'Una tinta negra', handles: 'Cordón negro', level: 'Baja',
    desc: 'El eslogan es el protagonista, con la cita de Génesis 12:2, el versículo del que sale «bendecidos para bendecir». El QR va en el costado.',
    notes: 'El eslogan es el protagonista, con la cita de Génesis 12:2 («te bendeciré… y serás bendición»), de donde viene «bendecidos para bendecir». El QR va en el fuelle. Una tinta negra.',
  },
  {
    id: '08-sello', n: '08', name: 'Sello', bag: 'Negra', print: 'Blanco: serigrafía o hot stamping', handles: 'Cordón negro', level: 'Media', dark: true,
    desc: 'Un sello circular con el eslogan alrededor del monograma. El mismo sello sirve de sticker para cerrar bolsas y cajas.',
    notes: 'Sello circular en blanco con el eslogan alrededor del monograma. El mismo sello sirve de sticker para cerrar bolsas y cajas, así el empaque completo se ve igual. Impresión en blanco sobre negro.',
  },
  {
    id: '09-reverso', n: '09', name: 'Reverso', bag: 'Blanca', print: 'Una tinta negra', handles: 'Las de la propuesta elegida', level: 'Baja',
    desc: 'La cara de atrás, para combinar con cualquier propuesta: WhatsApp, Instagram, dirección y un QR que abre el chat de la tienda.',
    notes: 'La cara de atrás sirve para cualquier propuesta. Los datos entre corchetes son de ejemplo: hay que poner el número, el @ y la dirección reales, y generar el QR con un enlace wa.me al número de la tienda.',
  },
];

const mockup = (id) => path.join(ROOT, 'mockups', `${id}.jpg`);
const thumb = (id) => path.join(ASSETS, `mini-${id}.jpg`);
const flat = (id) => path.join(ASSETS, `arte-${id}.png`);

// ------------------------------------------------------------------ imágenes
// Miniaturas: el mockup recortado alrededor de la bolsa.
for (const p of P) await sharp(mockup(p.id)).extract({ left: 240, top: 80, width: 1340, height: 1740 }).jpeg({ quality: 86 }).toFile(thumb(p.id));

const browser = await chromium.launch();
const page = await browser.newPage();

// Arte plano del frente, desde los SVG de arte-frente/ con las fuentes locales.
await page.setViewportSize({ width: 1000, height: 1200 });
for (const p of P) {
  const svg = fs.readFileSync(path.join(ROOT, 'arte-frente', `${p.id}.svg`), 'utf8').replace(/<style>[\s\S]*?<\/style>/, '');
  const html = path.join(ASSETS, `arte-${p.id}.html`);
  fs.writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../fonts/fonts.css"><style>body{margin:0}svg{display:block;width:1000px;height:1200px}</style></head><body>${svg}</body></html>`);
  await page.goto('file://' + html);
  await page.evaluate(async () => {
    await Promise.all(['900 50px Archivo', '800 16px Archivo', '700 16px Archivo', '500 16px Archivo', '900 50px "Playfair Display"', '40px Playball', '20px "EB Garamond"', 'italic 20px "EB Garamond"'].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  });
  await page.screenshot({ path: flat(p.id), clip: { x: 0, y: 0, width: 1000, height: 1200 } });
}

// Logo en blanco para la portada.
const logos = {};
for (const [key, file] of [['jdcel', 'logo-jdcel-blanco.svg'], ['bq', 'logo-bq-blanco.svg']]) {
  const svg = fs.readFileSync(path.join(ROOT, 'canva', 'elementos', file), 'utf8');
  const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const w = 1600;
  const h = Math.round((w * vh) / vw);
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg style="display:block;width:${w}px;height:${h}px" `)}</body>`);
  logos[key] = { path: path.join(ASSETS, `${key}-blanco.png`), ratio: vw / vh };
  await page.screenshot({ path: logos[key].path, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}
await browser.close();

// ------------------------------------------------------------------ presentación
const W = 13.333;
const H = 7.5;
const INK = '111111';
const WHITE = 'FFFFFF';
const MUTED = '6B6B6B';
const MUTED_D = 'A6A6A6';
const SERIF = 'Georgia';
const SANS = 'Arial';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'JDCEL Bq · Propuestas de bolsa';
pres.company = 'JDCEL Bq';

const dim = (t) => t.replace(/ /g, '\u00a0'); // medidas sin cortes de línea
const text = (slide, t, o) => slide.addText(t, { margin: 0, isTextBox: true, valign: 'top', ...o });

// 1 · Portada
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addImage({ path: mockup('02-pantalla'), x: W - 6.75, y: 0, w: 6.75, h: H, altText: 'Bolsa negra de la propuesta Pantalla' });
  const wmW = 4.3;
  const wmH = wmW / logos.jdcel.ratio;
  s.addImage({ path: logos.jdcel.path, x: 0.8, y: 1.35, w: wmW, h: wmH, altText: 'JDCEL' });
  const bqW = 1.0;
  s.addImage({ path: logos.bq.path, x: 0.8 + (wmW - bqW) / 2, y: 1.43 + wmH, w: bqW, h: bqW / logos.bq.ratio, altText: 'Bq' });
  text(s, [{ text: 'Propuestas', options: { breakLine: true } }, { text: 'de bolsa' }], { x: 0.8, y: 3.4, w: 5.4, h: 1.45, fontFace: SERIF, fontSize: 40, color: WHITE });
  text(s, 'bendecidos para bendecir', { x: 0.8, y: 5.0, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 20, italic: true, color: MUTED_D });
  text(s, `9 ideas en negro y blanco · frente de ${dim('25 × 30 cm')}`, { x: 0.8, y: 6.55, w: 5.4, h: 0.3, fontFace: SANS, fontSize: 12, color: '8C8C8C' });
  s.addNotes('Propuestas de bolsa para JDCEL Bq, todas en negro y blanco. El monograma JJ de las imágenes es una aproximación hecha con tipografía: en producción va el logo original.');
}

// 2 · Las nueve de un vistazo
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  text(s, 'Nueve propuestas', { x: 0.6, y: 0.45, w: 8, h: 0.7, fontFace: SERIF, fontSize: 36, color: INK });
  text(s, 'Todas en negro y blanco, con el nombre y el eslogan de la marca.', { x: 0.6, y: 1.12, w: 9, h: 0.35, fontFace: SANS, fontSize: 14, color: MUTED });
  const tw = 1.694;
  const th = 2.2;
  const gap = 0.5;
  const rows = [P.slice(0, 5), P.slice(5)];
  rows.forEach((row, r) => {
    const x0 = (W - (row.length * tw + (row.length - 1) * gap)) / 2;
    const y = r === 0 ? 1.65 : 4.45;
    row.forEach((p, i) => {
      const x = x0 + i * (tw + gap);
      s.addImage({ path: thumb(p.id), x, y, w: tw, h: th, altText: `Propuesta ${p.n}: ${p.name}` });
      text(s, [{ text: `${p.n}  `, options: { bold: true } }, { text: p.name }], { x, y: y + th + 0.06, w: tw + 0.4, h: 0.28, fontFace: SANS, fontSize: 11, color: INK });
    });
  });
  s.addNotes('Las ocho primeras son el frente de la bolsa; la 09 es un reverso que se combina con cualquiera. El monograma JJ de las imágenes es aproximado.');
}

// 3–11 · Una por propuesta
P.forEach((p, i) => {
  const s = pres.addSlide();
  const fg = p.dark ? WHITE : INK;
  const mut = p.dark ? MUTED_D : MUTED;
  s.background = { color: p.dark ? INK : WHITE };
  const IW = 6.75;
  const imgLeft = i % 2 === 0;
  s.addImage({ path: mockup(p.id), x: imgLeft ? 0 : W - IW, y: 0, w: IW, h: H, altText: `Bolsa de la propuesta ${p.name}` });
  const x0 = imgLeft ? IW + 0.6 : 0.6;
  const cw = W - IW - 1.2;
  text(s, `PROPUESTA ${p.n}`, { x: x0, y: 0.7, w: cw, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: mut, charSpacing: 3 });
  text(s, p.name, { x: x0, y: 1.02, w: cw, h: 0.8, fontFace: SERIF, fontSize: 36, color: fg });
  text(s, p.desc, { x: x0, y: 2.0, w: cw, h: 1.55, fontFace: SANS, fontSize: 15, color: fg, lineSpacingMultiple: 1.15 });

  const aw = 2.25;
  const ah = 2.7;
  const ay = 3.85;
  s.addImage({ path: flat(p.id), x: x0, y: ay, w: aw, h: ah, altText: `Arte del frente de la propuesta ${p.name}` });
  s.addShape(pres.shapes.RECTANGLE, { x: x0, y: ay, w: aw, h: ah, fill: { color: WHITE, transparency: 100 }, line: { color: p.dark ? '3A3A3A' : 'D9D9D9', width: 0.75 } });
  text(s, `Arte del frente · ${dim('25 × 30 cm')}`, { x: x0, y: ay + ah + 0.08, w: aw + 0.5, h: 0.28, fontFace: SANS, fontSize: 10, color: mut });

  const sx = x0 + aw + 0.4;
  const sw = cw - aw - 0.4;
  [['Bolsa', p.bag], ['Impresión', p.print], ['Manijas', p.handles]].forEach(([label, value], k) => {
    const y = ay + k * 0.98;
    text(s, label.toUpperCase(), { x: sx, y, w: sw, h: 0.25, fontFace: SANS, fontSize: 10, bold: true, color: mut, charSpacing: 1.5 });
    text(s, value, { x: sx, y: y + 0.27, w: sw, h: 0.62, fontFace: SANS, fontSize: 13, color: fg });
  });
  s.addNotes(`${p.name}. ${p.notes}`);
});

// 12 · Referencia rápida
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  text(s, 'Referencia rápida', { x: 0.6, y: 0.45, w: 8, h: 0.7, fontFace: SERIF, fontSize: 36, color: INK });
  const head = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK } } });
  const rows = [[head('#'), head('Propuesta'), head('Bolsa'), head('Impresión'), head('Complejidad')]];
  P.forEach((p, i) => {
    const fill = { color: i % 2 ? 'F3F3F3' : WHITE };
    rows.push([
      { text: p.n, options: { fill, color: MUTED } },
      { text: p.name, options: { fill, bold: true } },
      { text: p.table || p.bag, options: { fill } },
      { text: p.print, options: { fill } },
      { text: p.level, options: { fill, bold: p.level === 'Alta' } },
    ]);
  });
  s.addTable(rows, {
    x: 0.6, y: 1.45, w: 12.133, colW: [0.6, 2.3, 2.3, 5.333, 1.6], rowH: 0.48,
    fontFace: SANS, fontSize: 12, color: INK, valign: 'middle', margin: [0.04, 0.12, 0.04, 0.12],
    border: { type: 'solid', pt: 0.5, color: 'DDDDDD' },
  });
  text(s, 'Complejidad = pasos de impresión y acabados. A más complejidad, normalmente más costo; la imprenta confirma precios.', { x: 0.6, y: 6.5, w: 12.133, h: 0.3, fontFace: SANS, fontSize: 11, color: MUTED });
  s.addNotes('Baja: una tinta. Media: blanco sobre cartulina negra. Alta: relieve seco o barniz UV, que necesitan molde o capa aparte. Es una referencia para elegir; los costos los confirma la imprenta.');
}

// 13 · Para producirla
{
  const s = pres.addSlide();
  s.background = { color: INK };
  text(s, 'Para producirla', { x: 0.6, y: 0.5, w: 8, h: 0.7, fontFace: SERIF, fontSize: 36, color: WHITE });
  text(s, 'PRODUCCIÓN', { x: 0.6, y: 1.75, w: 5.6, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: MUTED_D, charSpacing: 3 });
  [
    ['Tamaño', `${dim('25 × 30 × 10 cm')} para el celular en su caja; ${dim('18 × 22 × 8 cm')} para accesorios.`],
    ['Papel', 'Propalcote o cartulina esmaltada de 250 g con laminado mate. En las negras, cartulina negra en masa.'],
    ['Manijas', 'Cordón negro o blanco; cinta de gorgorán para una versión más elegante.'],
    ['Boca', 'Los 3–4 cm de arriba se doblan hacia adentro: ahí no va nada importante.'],
  ].forEach(([label, value], k) => {
    text(s, [{ text: `${label}  `, options: { bold: true, color: WHITE } }, { text: value, options: { color: 'CFCFCF' } }], { x: 0.6, y: 2.25 + k * 1.2, w: 5.6, h: 0.95, fontFace: SANS, fontSize: 14, lineSpacingMultiple: 1.1 });
  });
  text(s, 'SIGUIENTES PASOS', { x: 7.1, y: 1.75, w: 5.6, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: MUTED_D, charSpacing: 3 });
  [
    'Elegir una o dos propuestas con el cliente.',
    'Montar el logo original y los datos reales: número, @, dirección y QR.',
    'Pedir a la imprenta su troquel y cotizar con la técnica elegida.',
  ].forEach((step, k) => {
    const y = 2.2 + k * 1.55;
    text(s, String(k + 1), { x: 7.1, y, w: 0.6, h: 0.8, fontFace: SERIF, fontSize: 40, color: WHITE });
    text(s, step, { x: 7.85, y: y + 0.12, w: 4.85, h: 0.9, fontFace: SANS, fontSize: 16, color: WHITE, lineSpacingMultiple: 1.1 });
  });
  s.addNotes('El troquel lo entrega la imprenta: sobre él se monta el frente, los fuelles, el reverso y la base. Los frentes están en arte-frente/ (SVG) y en canva/ (para editar en Canva).');
}

await pres.writeFile({ fileName: OUTPUT });
console.log('listo:', OUTPUT);
