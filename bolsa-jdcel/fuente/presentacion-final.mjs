// Presentación del diseño final: la bolsa por todos lados (frente, reverso y los dos costados con el QR),
// las dos alturas del QR y el desplegado con todas las caras. Todos los textos, cotas y el desplegado son editables.
// Uso: sh fetch-fonts.sh && npm install && node build.mjs final && node presentacion-final.mjs
//   → ../JDCEL-bolsa-diseno-final.pptx
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const QRCode = require('qrcode');
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'out');
const ASSETS = path.join(OUT, 'presentacion-final');
const OUTPUT = path.join(ROOT, 'JDCEL-bolsa-diseno-final.pptx');
fs.mkdirSync(ASSETS, { recursive: true });

const INSTAGRAM = 'https://www.instagram.com/jdcelbq_';
const L = JSON.parse(fs.readFileSync(path.join(OUT, 'final-layout.json'), 'utf8'));
const OPT = {
  a: { name: 'A', title: 'como antes', cm: '16,5', where: 'a 16,5 cm del borde de arriba', extra: '' },
  b: { name: 'B', title: 'más arriba', cm: '9,6', where: 'a 9,6 cm del borde de arriba', extra: ', a la altura del eslogan' },
};

// ------------------------------------------------------------------ imágenes
// Láminas de build.mjs (sin textos: aquí los textos van aparte) reducidas para que el archivo no pese tanto.
const comp = (id) => path.join(ASSETS, `${id}.jpg`);
for (const id of ['final-ab-duo', 'final-a-duo', 'final-a-vistas', 'final-b-duo', 'final-b-vistas', 'final-qr-detalle']) {
  await sharp(path.join(OUT, `${id}.jpg`)).resize(2560, 1440).jpeg({ quality: 86 }).toFile(comp(id));
}
const cover = path.join(ROOT, 'mockups', 'final-b-qr-mas-arriba.jpg');
const art = path.join(ROOT, 'arte-frente', 'final-frente.png');
const qrScan = path.join(ROOT, 'canva', 'elementos', 'qr-instagram-jdcelbq.png');
// QR sin margen y con fondo transparente, para montarlo a escala en el desplegado.
const qrBare = path.join(ASSETS, 'qr-sin-margen.png');
await QRCode.toFile(qrBare, INSTAGRAM, { errorCorrectionLevel: 'Q', margin: 0, width: 990, color: { dark: '#111111ff', light: '#ffffff00' } });

// Logo en blanco para la portada.
const browser = await chromium.launch();
const page = await browser.newPage();
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

// ------------------------------------------------------------------ diapositivas
const W = 13.333;
const H = 7.5;
const U = W / L.comp.W; // pulgadas por unidad de las láminas (1600 × 900)
const INK = '111111';
const WHITE = 'FFFFFF';
const MUTED = '6B6B6B';
const MUTED_D = 'A6A6A6';
const PAPER = 'E9E8E4'; // por si la imagen de fondo no carga
const SERIF = 'Georgia';
const SANS = 'Arial';

const dim = (t) => t.replace(/ /g, ' '); // medidas sin cortes de línea
const text = (slide, t, o) => slide.addText(t, { margin: 0, isTextBox: true, valign: 'top', ...o });

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'JDCEL Bq · Bolsa, diseño final';
pres.company = 'JDCEL Bq';

function header(s, title, subtitle) {
  text(s, title, { x: 0.6, y: 0.4, w: 9, h: 0.62, fontFace: SERIF, fontSize: 32, color: INK });
  if (subtitle) text(s, subtitle, { x: 0.6, y: 1.02, w: 11.5, h: 0.3, fontFace: SANS, fontSize: 13, color: MUTED });
}

// Rótulo centrado bajo una bolsa o una cara: nombre en negrita y un detalle debajo.
function label(s, cx, y, name, detail) {
  const runs = [{ text: name, options: { bold: true, color: INK, breakLine: !!detail } }];
  if (detail) runs.push({ text: detail, options: { color: MUTED, fontSize: 12 } });
  text(s, runs, { x: cx - 1.6, y, w: 3.2, h: 0.5, align: 'center', fontFace: SANS, fontSize: 13 });
}

function photoSlide(image, alt) {
  const s = pres.addSlide();
  s.background = { color: PAPER };
  s.addImage({ path: comp(image), x: 0, y: 0, w: W, h: H, altText: alt });
  return s;
}

// Cota: línea con flechas y su medida al lado.
function vDim(s, x, y0, y1, t, side = 'left') {
  s.addShape(pres.shapes.LINE, { x, y: y0, w: 0, h: y1 - y0, line: { color: INK, width: 0.75, beginArrowType: 'triangle', endArrowType: 'triangle' } });
  const tw = 1.0;
  text(s, dim(t), { x: side === 'left' ? x - tw - 0.08 : x + 0.08, y: (y0 + y1) / 2 - 0.13, w: tw, h: 0.26, align: side === 'left' ? 'right' : 'left', fontFace: SANS, fontSize: 11, bold: true, color: INK });
}
function hDim(s, x0, x1, y, t) {
  s.addShape(pres.shapes.LINE, { x: x0, y, w: x1 - x0, h: 0, line: { color: INK, width: 0.75, beginArrowType: 'triangle', endArrowType: 'triangle' } });
  text(s, dim(t), { x: (x0 + x1) / 2 - 0.6, y: y + 0.05, w: 1.2, h: 0.24, align: 'center', fontFace: SANS, fontSize: 11, bold: true, color: INK });
}

// 1 · Portada
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addImage({ path: cover, x: W - 6.75, y: 0, w: 6.75, h: H, altText: 'Bolsa blanca de JDCEL Bq con el eslogan al frente y el QR en el costado' });
  const wmW = 4.3;
  const wmH = wmW / logos.jdcel.ratio;
  s.addImage({ path: logos.jdcel.path, x: 0.8, y: 1.35, w: wmW, h: wmH, altText: 'JDCEL' });
  const bqW = 1.0;
  s.addImage({ path: logos.bq.path, x: 0.8 + (wmW - bqW) / 2, y: 1.43 + wmH, w: bqW, h: bqW / logos.bq.ratio, altText: 'Bq' });
  text(s, [{ text: 'Bolsa', options: { breakLine: true } }, { text: 'diseño final' }], { x: 0.8, y: 3.4, w: 5.4, h: 1.45, fontFace: SERIF, fontSize: 40, color: WHITE });
  text(s, 'bendecidos para bendecir', { x: 0.8, y: 5.0, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 20, italic: true, color: MUTED_D });
  text(s, `Frente, reverso y costados · ${dim('25 × 30 × 10 cm')}`, { x: 0.8, y: 6.55, w: 5.4, h: 0.3, fontFace: SANS, fontSize: 12, color: '8C8C8C' });
  s.addNotes('Diseño final de la bolsa de JDCEL Bq: el arte que eligió el cliente, montado en la bolsa y visto por todos lados. El frente y el reverso llevan el mismo arte; los dos costados llevan un QR que abre el Instagram de la tienda.');
}

// 2 · Las dos alturas del QR
{
  const s = photoSlide('final-ab-duo', 'Dos bolsas iguales vistas de frente y de costado: en la A el QR va más abajo y en la B más arriba');
  header(s, 'Dos alturas para el QR', 'El QR va en los dos costados y abre el Instagram de la tienda. Todo lo demás es igual en las dos opciones.');
  const { centers, bottom } = L['ab-duo'];
  ['a', 'b'].forEach((k, i) => label(s, centers[i] * U, bottom * U + 0.12, `${OPT[k].name} · ${OPT[k].title[0].toUpperCase()}${OPT[k].title.slice(1)}`, dim(`QR ${OPT[k].where}`)));
  s.addNotes('Opción A: el QR queda donde estaba, a 16,5 cm del borde de arriba. Opción B: sube unos 7 cm y queda a 9,6 cm, centrado con el eslogan grande. En las dos, el QR mide 6,4 × 6,4 cm, va en los dos costados y abre instagram.com/jdcelbq_.');
}

for (const k of ['a', 'b']) {
  const o = OPT[k];
  // Frente y reverso de 3/4
  {
    const s = photoSlide(`final-${k}-duo`, `Opción ${o.name}: la bolsa vista por el frente con el costado derecho y por el reverso con el costado izquierdo`);
    header(s, `Opción ${o.name}: frente y reverso`, `QR ${o.where}, en los dos costados. El reverso lleva el mismo arte del frente.`);
    const { centers, bottom } = L[`${k}-duo`];
    label(s, centers[0] * U, bottom * U + 0.12, 'Frente y costado derecho');
    label(s, centers[1] * U, bottom * U + 0.12, 'Reverso y costado izquierdo');
    s.addNotes(`Opción ${o.name} (QR ${o.title}). A la izquierda, la bolsa por delante: el frente y el costado derecho. A la derecha, la misma bolsa por detrás: el reverso, con el mismo arte, y el costado izquierdo, que también lleva el QR. Así, se vea por donde se vea, siempre aparece el eslogan o el QR.`);
  }
  // Las cuatro caras de frente
  {
    const s = photoSlide(`final-${k}-vistas`, `Opción ${o.name}: frente, costado derecho, reverso y costado izquierdo, uno al lado del otro`);
    header(s, `Opción ${o.name}: las cuatro caras`, 'Cada cara vista de frente, en el orden en que se le da la vuelta a la bolsa.');
    const { xs, widths, bottom } = L[`${k}-vistas`];
    const names = [['Frente', '25 × 30 cm'], ['Costado derecho', `10 × 30 cm · QR a ${o.cm} cm`], ['Reverso', 'igual al frente'], ['Costado izquierdo', `10 × 30 cm · QR a ${o.cm} cm`]];
    names.forEach(([n, d], i) => label(s, (xs[i] + widths[i] / 2) * U, bottom * U + 0.12, n, dim(d)));
    s.addNotes(`Opción ${o.name}. Las cuatro caras de la bolsa vistas de frente: el frente (25 × 30 cm), el costado derecho (10 × 30 cm), el reverso, que repite el arte del frente, y el costado izquierdo. Los dos costados llevan el QR ${o.where}${o.extra}. En los costados se ve el pliegue del centro: por ahí se dobla la bolsa cuando se guarda plana.`);
  }
}

// 7 · El QR de cerca, con cotas y un QR para escanear desde la pantalla
{
  const s = photoSlide('final-qr-detalle', 'Los dos costados de cerca: en la opción A el QR va más abajo que en la B');
  header(s, 'El QR del costado');
  text(s, [
    { text: 'Abre el Instagram de la tienda: ', options: {} },
    { text: 'instagram.com/jdcelbq_', options: { bold: true, breakLine: true } },
    { text: dim('Va centrado en los dos costados y mide 6,4 × 6,4 cm.'), options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 8 } },
    { text: 'A · ', options: { bold: true } }, { text: dim('a 16,5 cm del borde de arriba.'), options: { breakLine: true } },
    { text: 'B · ', options: { bold: true } }, { text: dim('a 9,6 cm, a la altura del eslogan.') },
  ], { x: 0.6, y: 1.3, w: 5.6, h: 1.8, fontFace: SANS, fontSize: 15, color: INK, lineSpacingMultiple: 1.2 });
  const q = 2.2;
  s.addImage({ path: qrScan, x: 0.6, y: 3.55, w: q, h: q, altText: 'Código QR que abre instagram.com/jdcelbq_' });
  text(s, [{ text: 'Pruébalo', options: { bold: true, breakLine: true } }, { text: 'Apunta la cámara del celular a este código: es el mismo que va impreso en la bolsa.' }],
    { x: 0.6 + q + 0.3, y: 3.75, w: 3.1, h: 1.3, fontFace: SANS, fontSize: 13, color: INK, lineSpacingMultiple: 1.15 });

  const { s: k, top, xs, x: qx, size, y: qy } = L.qr;
  ['a', 'b'].forEach((key, i) => {
    const px = xs[i] * U;
    const y0 = top * U;
    const qTop = (top + k * qy[key]) * U;
    vDim(s, px - 0.16, y0, qTop, `${OPT[key].cm} cm`);
    hDim(s, (xs[i] + k * qx) * U, (xs[i] + k * (qx + size)) * U, qTop + k * size * U + 0.14, '6,4 cm');
    label(s, (xs[i] + k * 100) * U, (top + k * 600) * U + 0.12, `${OPT[key].name} · ${OPT[key].title}`);
  });
  s.addNotes('El QR es real y abre instagram.com/jdcelbq_. Mide 6,4 × 6,4 cm y queda centrado en el costado de 10 cm, con 1,8 cm de aire a cada lado. La línea del centro es el pliegue del costado; con la bolsa abierta queda casi plano. Conviene probarlo impreso antes del tiraje.');
}

// 8–9 · Desplegado: todas las caras en una sola pieza, a escala (formas y textos nativos, editables)
function dieline(k) {
  const o = OPT[k];
  const s = pres.addSlide();
  s.background = { color: WHITE };
  header(s, `Desplegado · opción ${o.name}`, 'Todas las caras en una sola pieza, a escala. Es un troquel de referencia: la imprenta lo ajusta a su máquina.');

  const K = 0.12; // pulgadas por centímetro
  const X0 = 2.75;
  const Y0 = 1.95;
  const P = (x) => X0 + x * K;
  const Q = (y) => Y0 + y * K;
  const BOCA = 3.6;
  const TOP = BOCA;
  const BOT = BOCA + 30;
  const panels = [['FRENTE', 0, 25], ['COSTADO', 25, 35], ['REVERSO', 35, 60], ['COSTADO', 60, 70]];
  const GRAY = 'EDEDED';
  const cut = { color: INK, width: 1 };
  const fold = { color: '555555', width: 0.75, dashType: 'dash' };
  const seg = (x0, y0, x1, y1, line) => s.addShape(pres.shapes.LINE, {
    x: P(Math.min(x0, x1)), y: Q(Math.min(y0, y1)), w: Math.abs(x1 - x0) * K, h: Math.abs(y1 - y0) * K,
    flipH: (x1 - x0) * (y1 - y0) < 0, line,
  });

  // Contorno de la pieza: pestaña de pegue a la derecha y solapas del fondo abajo (las de los costados, más cortas).
  const outline = [[0, 0], [70, 0], [70, TOP], [72, TOP + 1], [72, BOT - 1], [70, BOT], [70, BOT + 5], [60, BOT + 5], [60, BOT + 7],
    [35, BOT + 7], [35, BOT + 5], [25, BOT + 5], [25, BOT + 7], [0, BOT + 7]];
  const shape = (pts, opts) => s.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x: P(0), y: Q(0), w: 72 * K, h: (BOT + 7) * K,
    points: [...pts.map(([x, y]) => ({ x: x * K, y: y * K })), { close: true }], ...opts,
  });
  // Lo que no se ve (boca, fondo y pestaña) en gris; las cuatro caras en blanco con su arte.
  shape(outline, { name: 'Pieza (zonas que van por dentro)', fill: { color: GRAY }, line: { type: 'none' } });
  s.addShape(pres.shapes.RECTANGLE, { name: 'Caras', x: P(0), y: Q(TOP), w: 70 * K, h: 30 * K, fill: { color: WHITE }, line: { type: 'none' } });
  for (const x of [0, 35]) s.addImage({ path: art, x: P(x), y: Q(TOP), w: 25 * K, h: 30 * K, altText: x ? 'Arte del reverso (igual al frente)' : 'Arte del frente' });
  const qTop = TOP + Number(o.cm.replace(',', '.'));
  for (const x of [25, 60]) s.addImage({ path: qrBare, x: P(x + 1.8), y: Q(qTop), w: 6.4 * K, h: 6.4 * K, altText: 'QR que abre instagram.com/jdcelbq_' });

  // Dobleces
  seg(0, TOP, 70, TOP, fold);
  seg(0, BOT, 70, BOT, fold);
  for (const x of [25, 35, 60]) seg(x, 0, x, BOT, fold);
  seg(70, TOP, 70, BOT, fold);
  for (const c of [30, 65]) {
    seg(c, 0, c, BOT, fold);
    seg(c - 5, BOT, c, BOT - 5, fold);
    seg(c, BOT - 5, c + 5, BOT, fold);
  }
  // Corte
  shape(outline, { name: 'Corte', fill: { type: 'none' }, line: cut });
  for (const x of [25, 35, 60]) seg(x, BOT, x, BOT + 5, cut);
  // Ojales del cordón: en la cara y en la boca, que se dobla encima
  for (const x of [8, 17, 43, 52]) for (const y of [TOP + 1.7, TOP - 1.7]) {
    s.addShape(pres.shapes.OVAL, { x: P(x - 0.45), y: Q(y - 0.45), w: 0.9 * K, h: 0.9 * K, fill: { color: WHITE }, line: { color: INK, width: 0.75 } });
  }
  // Altura y tamaño del QR, acotados a la derecha de la pieza
  const dx = P(72) + 0.32;
  for (const [x, y] of [[72, TOP], [68.2, qTop], [68.2, qTop + 6.4]]) {
    s.addShape(pres.shapes.LINE, { x: P(x) + 0.04, y: Q(y), w: dx + 0.08 - P(x) - 0.04, h: 0, line: { color: '9A9A9A', width: 0.5 } });
  }
  vDim(s, dx, Q(TOP), Q(qTop), `${o.cm} cm`, 'right');
  vDim(s, dx, Q(qTop), Q(qTop + 6.4), 'QR 6,4 cm', 'right');

  // Medidas
  panels.forEach(([n, x0, x1]) => text(s, [{ text: n, options: { bold: true, breakLine: true } }, { text: dim(`${x1 - x0} cm`), options: { color: MUTED } }],
    { x: P(x0), y: Y0 - 0.46, w: (x1 - x0) * K, h: 0.4, align: 'center', fontFace: SANS, fontSize: 10, color: INK, charSpacing: 1 }));
  text(s, dim('2 cm'), { x: P(70) - 0.12, y: Y0 - 0.26, w: 2 * K + 0.24, h: 0.2, align: 'center', fontFace: SANS, fontSize: 9, color: MUTED });
  [['Boca', '3,6 cm', 0, TOP], ['Alto', '30 cm', TOP, BOT], ['Fondo', '7 cm', BOT, BOT + 7]].forEach(([n, v, y0, y1]) =>
    text(s, [{ text: `${n} `, options: { bold: true } }, { text: dim(v), options: { color: MUTED } }],
      { x: X0 - 1.75, y: (Q(y0) + Q(y1)) / 2 - 0.12, w: 1.6, h: 0.24, align: 'right', fontFace: SANS, fontSize: 11, color: INK }));

  // Convenciones
  const ly = Q(BOT + 7) + 0.2;
  let lx = X0;
  const item = (draw, t, w) => { draw(lx); text(s, t, { x: lx + 0.42, y: ly - 0.02, w, h: 0.24, fontFace: SANS, fontSize: 10, color: INK }); lx += 0.42 + w + 0.2; };
  item((x) => s.addShape(pres.shapes.LINE, { x, y: ly + 0.1, w: 0.32, h: 0, line: cut }), 'Corte', 0.45);
  item((x) => s.addShape(pres.shapes.LINE, { x, y: ly + 0.1, w: 0.32, h: 0, line: fold }), 'Doblez', 0.55);
  item((x) => s.addShape(pres.shapes.RECTANGLE, { x: x + 0.04, y: ly, w: 0.24, h: 0.2, fill: { color: GRAY }, line: { type: 'none' } }), 'Van por dentro: boca, fondo y pestaña de pegue', 3.2);
  item((x) => s.addShape(pres.shapes.OVAL, { x: x + 0.1, y: ly + 0.04, w: 0.12, h: 0.12, fill: { color: WHITE }, line: { color: INK, width: 0.75 } }), 'Ojales del cordón', 1.3);

  s.addNotes(`Opción ${o.name}. La bolsa desplegada sobre la mesa, antes de armarla: frente, costado derecho, reverso, costado izquierdo y la pestaña de pegue de 2 cm. Arriba, la boca de 3,6 cm se dobla hacia adentro y refuerza los ojales; abajo, las solapas forman el fondo. Las líneas punteadas son dobleces y las continuas, cortes. El QR va ${o.where}${o.extra}, en los dos costados. Las medidas del troquel las confirma la imprenta.`);
}
dieline('a');
dieline('b');

// 10 · Producción
{
  const s = pres.addSlide();
  s.background = { color: INK };
  text(s, 'Para producirla', { x: 0.6, y: 0.5, w: 8, h: 0.7, fontFace: SERIF, fontSize: 36, color: WHITE });
  text(s, 'PRODUCCIÓN', { x: 0.6, y: 1.75, w: 5.6, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: MUTED_D, charSpacing: 3 });
  const specs = [
    ['Tamaño', `${dim('25 × 30 × 10 cm')}: ancho, alto y fuelle.`],
    ['Papel', `Propalcote o cartulina esmaltada de ${dim('250 g')} con laminado mate.`],
    ['Impresión', 'Una tinta negra: el mismo arte en el frente y en el reverso, y el QR en los dos costados.'],
    ['Manijas', 'Cordón negro con ojales metálicos.'],
  ];
  text(s, specs.flatMap(([label, value], i) => [
    { text: `${label}  `, options: { bold: true, color: WHITE } },
    { text: value, options: { color: 'CFCFCF', breakLine: i < specs.length - 1, paraSpaceAfter: 18 } },
  ]), { x: 0.6, y: 2.25, w: 5.6, h: 4.2, fontFace: SANS, fontSize: 14, lineSpacingMultiple: 1.1 });
  text(s, 'SIGUIENTES PASOS', { x: 7.1, y: 1.75, w: 5.6, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: MUTED_D, charSpacing: 3 });
  [
    `Elegir la altura del QR: A (${dim('16,5 cm')}) o B (${dim('9,6 cm')}).`,
    'Pedir a la imprenta su troquel y montar el arte con las medidas del desplegado.',
    'Imprimir una prueba y escanear el QR con varios celulares antes del tiraje.',
  ].forEach((step, i) => {
    const y = 2.2 + i * 1.55;
    text(s, String(i + 1), { x: 7.1, y, w: 0.6, h: 0.8, fontFace: SERIF, fontSize: 40, color: WHITE });
    text(s, step, { x: 7.85, y: y + 0.12, w: 4.85, h: 0.9, fontFace: SANS, fontSize: 16, color: WHITE, lineSpacingMultiple: 1.1 });
  });
  s.addNotes('Una sola tinta negra en toda la bolsa. El QR ya abre el Instagram de la tienda; solo falta escoger su altura y probarlo impreso. La imprenta entrega el troquel y sobre él se monta el frente, el reverso y los costados.');
}

await pres.writeFile({ fileName: OUTPUT });
console.log('listo:', OUTPUT);
