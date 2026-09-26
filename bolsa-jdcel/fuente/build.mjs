const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const QRCode = createRequire(import.meta.url)('qrcode');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, 'out');
fs.mkdirSync(OUT, { recursive: true });

const f = (n) => Math.round(n * 100) / 100;
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const INK = '#111111';
const WHITE = '#f6f6f4';
const BLACK = '#161616';
const W_INK = '#f4f4f2';

const FONT = {
  word: `font-family="Archivo" font-weight="900" style="font-stretch:125%"`,
  mono: `font-family="Playfair Display" font-weight="900"`,
  script: `font-family="Playball"`,
  serif: `font-family="EB Garamond"`,
};

// ---------------------------------------------------------------- brand pieces
function monogram(cx, cy, s, color, gap) {
  const dx = s * 0.15;
  const b1 = cy + s * 0.11;
  const b2 = b1 + s * 0.2;
  return `<g ${FONT.mono} font-size="${s}" text-anchor="middle">
  <text x="${f(cx - dx + s * 0.03)}" y="${f(b1)}" fill="${color}">J</text>
  <text x="${f(cx + dx + s * 0.03)}" y="${f(b2)}" fill="${color}" stroke="${gap}" stroke-width="${f(s * 0.045)}" stroke-linejoin="round" paint-order="stroke">J</text>
</g>`;
}
const wordmark = (x, y, s, c, anchor = 'middle') =>
  `<text x="${x}" y="${y}" ${FONT.word} font-size="${s}" fill="${c}" text-anchor="${anchor}">JDCEL</text>`;
const bq = (x, y, s, c, anchor = 'middle') =>
  `<text x="${x}" y="${y}" ${FONT.script} font-size="${s}" fill="${c}" text-anchor="${anchor}">Bq</text>`;
const slogan = (x, y, s, c, anchor = 'middle', italic = false) =>
  `<text x="${x}" y="${y}" ${FONT.serif} font-size="${s}" fill="${c}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}>bendecidos para bendecir</text>`;

const icon = {
  wa: (x, y, s, c) =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s / 24)})"><path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.9 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z" fill="none" stroke="${c}" stroke-width="1.9" stroke-linejoin="round"/><path d="M8.9 7.6c.3-.3.7-.3.9 0l1.2 1.9c.2.3.1.6-.1.9l-.6.7c.7 1.4 1.8 2.5 3.2 3.2l.7-.6c.3-.2.6-.3.9-.1l1.9 1.2c.3.2.3.6 0 .9l-.9.9c-.6.6-1.6.8-2.4.4-2.4-1.1-4.3-3-5.4-5.4-.4-.8-.2-1.8.4-2.4z" fill="${c}"/></g>`,
  ig: (x, y, s, c) =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s / 24)})" fill="none" stroke="${c}" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.2" cy="6.8" r="1.1" fill="${c}" stroke="none"/></g>`,
  pin: (x, y, s, c) =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s / 24)})" fill="none" stroke="${c}" stroke-width="1.9" stroke-linejoin="round"><path d="M12 21.5s-6.8-6.4-6.8-11.4a6.8 6.8 0 0 1 13.6 0c0 5-6.8 11.4-6.8 11.4z"/><circle cx="12" cy="10.1" r="2.4"/></g>`,
  cross: (cx, cy, h, c) => {
    const w = h * 0.64;
    const t = h * 0.17;
    return `<g fill="${c}"><rect x="${f(cx - t / 2)}" y="${f(cy - h / 2)}" width="${f(t)}" height="${f(h)}"/><rect x="${f(cx - w / 2)}" y="${f(cy - h / 2 + h * 0.25)}" width="${f(w)}" height="${f(t)}"/></g>`;
  },
};

function qr(x, y, size, c, seed = 11) {
  const n = 25;
  const m = size / n;
  const r = rng(seed);
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  const finder = (ox, oy) => {
    for (let i = -1; i <= 7; i++)
      for (let j = -1; j <= 7; j++) {
        const xx = ox + i;
        const yy = oy + j;
        if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
        const inside = i >= 0 && i <= 6 && j >= 0 && j <= 6;
        const ring = i === 0 || i === 6 || j === 0 || j === 6;
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        g[yy][xx] = inside && (ring || core) ? 1 : 2;
      }
  };
  finder(0, 0);
  finder(18, 0);
  finder(0, 18);
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) g[16 + j][16 + i] = i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2) ? 1 : 2;
  for (let i = 8; i < 17; i++) {
    g[6][i] = i % 2 === 0 ? 1 : 2;
    g[i][6] = i % 2 === 0 ? 1 : 2;
  }
  let d = '';
  for (let yy = 0; yy < n; yy++)
    for (let xx = 0; xx < n; xx++) {
      let v = g[yy][xx];
      if (v === 0) v = r() < 0.48 ? 1 : 0;
      if (v === 1) d += `M${f(x + xx * m)} ${f(y + yy * m)}h${f(m)}v${f(m)}h${f(-m)}z`;
    }
  return `<path d="${d}" fill="${c}" shape-rendering="crispEdges"/>`;
}

// QR real (se puede escanear): módulos negros unidos por filas para que no queden rayas entre ellos
function qrCode(x, y, size, c, text) {
  const q = QRCode.create(text, { errorCorrectionLevel: 'Q' });
  const n = q.modules.size;
  const m = size / n;
  let d = '';
  for (let r = 0; r < n; r++)
    for (let col = 0; col < n; col++) {
      if (!q.modules.get(r, col) || (col > 0 && q.modules.get(r, col - 1))) continue;
      let run = 1;
      while (col + run < n && q.modules.get(r, col + run)) run++;
      d += `M${f(x + col * m)} ${f(y + r * m)}h${f(run * m)}v${f(m)}h${f(-run * m)}z`;
    }
  return `<path d="${d}" fill="${c}"/>`;
}

// crown of thorns: woven strands + thorns
function crown(cx, cy, R, color, seed = 7) {
  const r = rng(seed);
  const rad = (t, k) => R + 10 * Math.sin(7 * t + k * 2.1) + 4 * Math.sin(3 * t + k * 1.3);
  let out = '';
  const N = 360;
  for (let k = 0; k < 3; k++) {
    let d = '';
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const rr = rad(t, k);
      d += `${i ? 'L' : 'M'}${f(cx + rr * Math.cos(t))} ${f(cy + rr * Math.sin(t))}`;
    }
    out += `<path d="${d}Z" fill="none" stroke="${color}" stroke-width="${9 - k * 1.4}" stroke-linejoin="round"/>`;
  }
  let th = '';
  const M = 34;
  for (let i = 0; i < M; i++) {
    const t = ((i + r() * 0.7) / M) * Math.PI * 2;
    const k = i % 3;
    const rr = rad(t, k);
    const bx = cx + rr * Math.cos(t);
    const by = cy + rr * Math.sin(t);
    const outward = i % 3 !== 1;
    const ang = t + (outward ? 0 : Math.PI) + (r() - 0.5) * 1.5;
    const len = outward ? 17 + r() * 18 : 9 + r() * 7;
    const w = 3.6 + r() * 1.8;
    const tx = bx + len * Math.cos(ang);
    const ty = by + len * Math.sin(ang);
    const px = -Math.sin(ang) * w;
    const py = Math.cos(ang) * w;
    th += `M${f(bx + px)} ${f(by + py)}L${f(tx)} ${f(ty)}L${f(bx - px)} ${f(by - py)}Z`;
  }
  return out + `<path d="${th}" fill="${color}"/>`;
}

function roundedRect(x, y, w, h, [tl, tr, br, bl]) {
  return `M${x + tl} ${y}H${x + w - tr}${tr ? `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` : ''}V${y + h - br}${br ? `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}` : ''}H${x + bl}${bl ? `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` : ''}V${y + tl}${tl ? `A${tl} ${tl} 0 0 1 ${x + tl} ${y}` : ''}Z`;
}

// ---------------------------------------------------------------- the scene
const S = { W: 900, H: 1000, fx: 170, fy: 262, fw: 500, fh: 600, gw: 70, gr: 22 };

function rope(d, cord) {
  const C = cord === 'white'
    ? { base: '#f1f1ee', twist: '#d4d4d0', edge: '#a9a9a4', hi: 0.8 }
    : { base: '#161616', twist: '#2f2f2f', edge: '#000', hi: 0.18 };
  return `<g fill="none" stroke-linecap="round">
  <path d="${d}" stroke="#000" stroke-opacity=".16" stroke-width="12" transform="translate(4 7)" filter="url(#soft)"/>
  <path d="${d}" stroke="${C.edge}" stroke-width="11.5"/>
  <path d="${d}" stroke="${C.base}" stroke-width="9.5"/>
  <path d="${d}" stroke="${C.twist}" stroke-width="9.5" stroke-dasharray="1.6 3.2"/>
  <path d="${d}" stroke="#fff" stroke-opacity="${C.hi}" stroke-width="2" transform="translate(-2.2 -.8)"/>
</g>`;
}

function eyelet(x, y, dark) {
  return `<circle cx="${x}" cy="${y}" r="10.5" fill="url(#${dark ? 'metalDark' : 'metal'})" stroke="#000" stroke-opacity=".4" stroke-width=".8"/>
<circle cx="${x}" cy="${y}" r="5.8" fill="#0b0b0b"/>`;
}

function scene({ theme = 'white', front = '', gusset = '', cord = 'black', defs = '' }) {
  const white = theme === 'white';
  const T = white
    ? { paper: WHITE, gusL: '#e7e7e4', gusR: '#d9d9d5', interior: '#c7c6c1', edgeHi: 0.95, line: 0.07, lineHi: 0.9, light: 0.22, dark: 0.1, noise: 0.07, gusShade: 0.08 }
    : { paper: BLACK, gusL: '#111111', gusR: '#0b0b0b', interior: '#050505', edgeHi: 0.14, line: 0.55, lineHi: 0.07, light: 0.1, dark: 0.3, noise: 0.14, gusShade: 0.35 };
  const { fx, fy, fw, fh, gw, gr } = S;
  const ex1 = fx + 160;
  const ex2 = fx + 340;
  const ey = fy + 34;
  const lift = 255;
  const frontRope = `M${ex1} ${ey}C${ex1 - 4} ${ey - lift} ${ex2 + 4} ${ey - lift} ${ex2} ${ey}`;
  const backRope = `M${ex1 + gw} ${ey - gr}C${ex1 + gw - 4} ${ey - gr - lift} ${ex2 + gw + 4} ${ey - gr - lift} ${ex2 + gw} ${ey - gr}`;
  const gm = `matrix(${gw / 200} ${-gr / 200} 0 1 ${fx + fw} ${fy})`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S.W} ${S.H}" width="${S.W}" height="${S.H}">
<defs>
  <radialGradient id="bg" cx="50%" cy="40%" r="80%">
    <stop offset="0" stop-color="#f2f1ee"/><stop offset=".6" stop-color="#e3e2de"/><stop offset="1" stop-color="#cfcdc8"/>
  </radialGradient>
  <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="${T.light}"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${T.dark}"/>
  </linearGradient>
  <linearGradient id="interior" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gloss" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="500" y2="600">
    <stop offset="0" stop-color="#424242"/><stop offset=".45" stop-color="#2b2b2b"/><stop offset="1" stop-color="#222222"/>
  </linearGradient>
  <radialGradient id="metal" cx="35%" cy="30%" r="80%">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#bdbdbd"/><stop offset="1" stop-color="#6d6d6d"/>
  </radialGradient>
  <radialGradient id="metalDark" cx="35%" cy="30%" r="80%">
    <stop offset="0" stop-color="#8a8a8a"/><stop offset=".5" stop-color="#3b3b3b"/><stop offset="1" stop-color="#151515"/>
  </radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="blur2" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <filter id="blur14" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="noise" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${T.noise} 0 0 0 0"/>
  </filter>
  <filter id="emboss" x="-8%" y="-8%" width="116%" height="116%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/>
    <feOffset in="b" dx="2" dy="2.4" result="bo"/>
    <feFlood flood-color="#000" flood-opacity=".34"/>
    <feComposite in2="bo" operator="in" result="sh"/>
    <feOffset in="b" dx="-1.6" dy="-1.8" result="ho"/>
    <feFlood flood-color="#fff" flood-opacity="1"/>
    <feComposite in2="ho" operator="in" result="hl"/>
    <feMerge><feMergeNode in="sh"/><feMergeNode in="hl"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <clipPath id="frontClip"><rect x="0" y="0" width="${fw}" height="${fh}"/></clipPath>
  <clipPath id="gusClip"><path d="M0 0L100 40L200 0V600H0Z"/></clipPath>
  <clipPath id="cL"><rect x="0" y="0" width="250" height="600"/></clipPath>
  <clipPath id="cR"><rect x="250" y="0" width="250" height="600"/></clipPath>
  ${defs}
</defs>
<rect width="${S.W}" height="${S.H}" fill="url(#bg)"/>

<!-- floor shadows -->
<path d="M${fx + fw + gw - 10} ${fy + fh - gr} L${fx + fw + gw + 150} ${fy + fh - gr + 8} L${fx + fw + 130} ${fy + fh + 22} L${fx + fw} ${fy + fh} Z" fill="#000" opacity=".12" filter="url(#soft)"/>
<ellipse cx="${fx + fw / 2 + 35}" cy="${fy + fh + 2}" rx="${fw / 2 + 70}" ry="16" fill="#000" opacity=".26" filter="url(#blur14)"/>
<path d="M${fx + 4} ${fy + fh} H${fx + fw} L${fx + fw + gw} ${fy + fh - gr}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="4" filter="url(#blur2)"/>

<!-- back handle + opening -->
${rope(backRope, cord)}
<polygon points="${fx},${fy} ${fx + fw},${fy} ${fx + fw + gw},${fy - gr} ${fx + gw},${fy - gr}" fill="${T.interior}"/>
<polygon points="${fx},${fy} ${fx + fw},${fy} ${fx + fw + gw},${fy - gr} ${fx + gw},${fy - gr}" fill="url(#interior)"/>

<!-- gusset -->
<g transform="${gm}">
  <path d="M0 0L100 40L200 0Z" fill="${T.interior}"/>
  <path d="M0 0L100 40V600H0Z" fill="${T.gusL}"/>
  <path d="M100 40L200 0V600H100Z" fill="${T.gusR}"/>
  <g clip-path="url(#gusClip)">${gusset}</g>
  <path d="M100 40L200 0V600H100Z" fill="#000" opacity="${T.gusShade * 0.6}"/>
  <path d="M0 0L100 40V600H0Z" fill="#000" opacity="${T.gusShade * 0.25}"/>
  <path d="M0 0L100 40L200 0" fill="none" stroke="#fff" stroke-opacity="${T.edgeHi * 0.6}" stroke-width="2.2"/>
  <path d="M100 40V600" stroke="#000" stroke-opacity="${white ? 0.12 : 0.6}" stroke-width="1.6"/>
  <path d="M100 42V600" stroke="#fff" stroke-opacity="${white ? 0.5 : 0.05}" stroke-width="1.2" transform="translate(-2 0)"/>
  <rect width="200" height="600" filter="url(#noise)" clip-path="url(#gusClip)"/>
</g>

<!-- front -->
<g transform="translate(${fx} ${fy})">
  <rect width="${fw}" height="${fh}" fill="${T.paper}"/>
  <g clip-path="url(#frontClip)">${front}</g>
  <rect width="${fw}" height="${fh}" fill="url(#light)"/>
  <rect width="${fw}" height="${fh}" filter="url(#noise)"/>
  <line x1="0" x2="${fw}" y1="72" y2="72" stroke="#000" stroke-opacity="${T.line}" stroke-width="1.2"/>
  <line x1="0" x2="${fw}" y1="73.6" y2="73.6" stroke="#fff" stroke-opacity="${T.lineHi}" stroke-width="1"/>
  <rect x="0" y="${fh - 50}" width="${fw}" height="10" fill="#000" opacity="${white ? 0.035 : 0.25}" filter="url(#blur2)"/>
  <line x1="0" x2="${fw}" y1="${fh - 42}" y2="${fh - 42}" stroke="#fff" stroke-opacity="${white ? 0.6 : 0.05}" stroke-width="1"/>
  <line x1=".8" x2=".8" y1="0" y2="${fh}" stroke="#fff" stroke-opacity="${T.edgeHi}" stroke-width="1.6"/>
  <line x1="0" x2="${fw}" y1=".8" y2=".8" stroke="#fff" stroke-opacity="${T.edgeHi}" stroke-width="1.6"/>
  <line x1="${fw - 0.6}" x2="${fw - 0.6}" y1="0" y2="${fh}" stroke="#000" stroke-opacity="${white ? 0.12 : 0.5}" stroke-width="1.2"/>
  ${eyelet(160, 34, !white)}
  ${eyelet(340, 34, !white)}
</g>

${rope(frontRope, cord)}
</svg>`;
}


// Escena de la ronda 2: la bolsa de frente, sostenida desde arriba, sobre fondo gris (como la referencia).
const SH = { W: 900, H: 1000, fx: 200, fy: 318, fw: 500, fh: 600 };

function sceneHang({ theme = 'white', front = '', cord = 'black', defs = '' }) {
  const white = theme === 'white';
  const { fx, fy, fw, fh } = SH;
  const ex1 = fx + 160;
  const ex2 = fx + 340;
  const ey = fy + 34;
  const hx = fx + fw / 2 + 6;
  const hy = -60;
  const strand = (x0, y0, x1) => `M${x0} ${y0}C${f(x0 + (x1 - x0) * 0.15)} ${y0 - 150} ${f(x1 + (x0 - x1) * 0.1)} ${hy + 130} ${x1} ${hy}`;
  const back = strand(ex1 + 24, fy + 6, hx - 3) + strand(ex2 - 24, fy + 6, hx + 3);
  const frontCord = strand(ex1, ey, hx - 8) + strand(ex2, ey, hx + 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SH.W} ${SH.H}" width="${SH.W}" height="${SH.H}">
<defs>
  <radialGradient id="wall" cx="60%" cy="36%" r="85%">
    <stop offset="0" stop-color="#a3a3a3"/><stop offset=".5" stop-color="#727272"/><stop offset="1" stop-color="#3b3b3b"/>
  </radialGradient>
  <linearGradient id="lightH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="${white ? 0.08 : 0.3}"/><stop offset=".2" stop-color="#fff" stop-opacity="${white ? 0.1 : 0.05}"/>
    <stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${white ? 0.12 : 0.35}"/>
  </linearGradient>
  <linearGradient id="lightV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="${white ? 0.12 : 0.06}"/><stop offset=".7" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="${white ? 0.07 : 0.22}"/>
  </linearGradient>
  <radialGradient id="metal" cx="35%" cy="30%" r="80%">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#bdbdbd"/><stop offset="1" stop-color="#6d6d6d"/>
  </radialGradient>
  <radialGradient id="metalDark" cx="35%" cy="30%" r="80%">
    <stop offset="0" stop-color="#8a8a8a"/><stop offset=".5" stop-color="#3b3b3b"/><stop offset="1" stop-color="#151515"/>
  </radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="blur2" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <filter id="noise" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${white ? 0.07 : 0.14} 0 0 0 0"/>
  </filter>
  <clipPath id="frontClip"><rect x="0" y="0" width="${fw}" height="${fh}"/></clipPath>
  ${defs}
</defs>
<rect width="${SH.W}" height="${SH.H}" fill="url(#wall)"/>
<rect x="${fx + 28}" y="${fy + 36}" width="${fw}" height="${fh}" fill="#000" opacity=".4" filter="url(#drop)"/>
${rope(back, cord)}
<g transform="translate(${fx} ${fy})">
  <rect width="${fw}" height="${fh}" fill="${white ? WHITE : BLACK}"/>
  <g clip-path="url(#frontClip)">${front}</g>
  <rect width="${fw}" height="${fh}" fill="url(#lightH)"/>
  <rect width="${fw}" height="${fh}" fill="url(#lightV)"/>
  <rect width="${fw}" height="${fh}" filter="url(#noise)"/>
  <line x1="0" x2="${fw}" y1="72" y2="72" stroke="#000" stroke-opacity="${white ? 0.07 : 0.55}" stroke-width="1.2"/>
  <line x1="0" x2="${fw}" y1="73.6" y2="73.6" stroke="#fff" stroke-opacity="${white ? 0.9 : 0.07}" stroke-width="1"/>
  <rect x="0" y="${fh - 50}" width="${fw}" height="10" fill="#000" opacity="${white ? 0.035 : 0.25}" filter="url(#blur2)"/>
  <line x1="0" x2="${fw}" y1="${fh - 42}" y2="${fh - 42}" stroke="#fff" stroke-opacity="${white ? 0.6 : 0.05}" stroke-width="1"/>
  <line x1=".8" x2=".8" y1="0" y2="${fh}" stroke="#fff" stroke-opacity="${white ? 0.9 : 0.12}" stroke-width="1.6"/>
  <line x1="${fw - 0.8}" x2="${fw - 0.8}" y1="0" y2="${fh}" stroke="#000" stroke-opacity="${white ? 0.18 : 0.5}" stroke-width="1.6"/>
  ${eyelet(160, 34, !white)}
  ${eyelet(340, 34, !white)}
</g>
${rope(frontCord, cord)}
</svg>`;
}

// Logo abajo, como en la referencia: JDCEL Bq en una línea y el eslogan espaciado debajo.
const lockup = (c, y = 508) => `${wordmark(226, y, 40, c)}${bq(331, y + 3, 30, c, 'start')}
<text x="252" y="${y + 30}" font-family="Archivo" font-weight="700" font-size="10.5" letter-spacing="3.4" fill="${c}" text-anchor="middle" style="font-stretch:110%">BENDECIDOS PARA BENDECIR</text>`;

// ---------------------------------------------------------------- concepts
const concepts = [];
const add = (id, title, fn) => concepts.push({ id, title, ...fn() });

add('01-corona', 'Corona', () => {
  const cx = 250;
  const cy = 250;
  return {
    theme: 'white',
    front: `<g filter="url(#emboss)">${crown(cx, cy, 122, WHITE)}</g>
${monogram(cx, cy, 146, INK, WHITE)}
${wordmark(250, 474, 54, INK)}
${bq(250, 511, 40, INK)}
${slogan(250, 548, 22, INK)}`,
    gusset: `<g transform="translate(112 300) rotate(-90)">${slogan(0, 0, 34, INK)}</g>`,
  };
});

add('02-pantalla', 'Pantalla', () => {
  const W = W_INK;
  const px = 132;
  const py = 92;
  const pw = 236;
  const ph = 482;
  let bars = '';
  [4, 6, 8, 10].forEach((h, i) => (bars += `<rect x="${306 + i * 4.2}" y="${123 - h}" width="2.8" height="${h}" rx=".6"/>`));
  return {
    theme: 'black',
    cord: 'white',
    front: `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="42" fill="none" stroke="${W}" stroke-width="4"/>
<g fill="${W}">
  <rect x="${px - 7}" y="172" width="4" height="24" rx="2"/>
  <rect x="${px - 7}" y="210" width="4" height="44" rx="2"/>
  <rect x="${px - 7}" y="264" width="4" height="44" rx="2"/>
  <rect x="${px + pw + 3}" y="222" width="4" height="66" rx="2"/>
  <rect x="216" y="106" width="68" height="21" rx="10.5"/>
  ${bars}
  <rect x="332.5" y="115.5" width="12" height="5" rx="1"/>
  <rect x="348.6" y="116.4" width="1.8" height="3.2" rx=".6"/>
</g>
<rect x="330.6" y="113.6" width="16" height="8.8" rx="2.4" fill="none" stroke="${W}" stroke-width="1.1"/>
<text x="153" y="122" font-family="Archivo" font-weight="800" font-size="10.5" fill="${W}">JDCEL</text>
<g fill="none" stroke="${W}" stroke-width="1.8"><path d="M245.5 144v-4.2a4.5 4.5 0 0 1 9 0V144"/></g>
<rect x="242" y="143" width="16" height="12" rx="2.6" fill="${W}"/>
${slogan(250, 184, 18, W, 'middle', true)}
${monogram(250, 280, 118, W, BLACK)}
<rect x="146" y="364" width="208" height="62" rx="17" fill="${W}"/>
<rect x="157" y="378" width="34" height="34" rx="9" fill="${BLACK}"/>
${monogram(174, 395, 25, W, BLACK)}
<text x="200" y="391" font-family="Archivo" font-weight="800" font-size="11" fill="${INK}">JDCEL <tspan font-family="Playball" font-weight="400" font-size="12.5">Bq</tspan></text>
<text x="343" y="391" font-family="Archivo" font-weight="500" font-size="9.5" fill="#666" text-anchor="end">ahora</text>
<text x="200" y="409" ${FONT.serif} font-size="12.5" fill="${INK}">¡Gracias por tu compra!</text>
<circle cx="174" cy="524" r="21" fill="none" stroke="${W}" stroke-width="1.6"/>
<circle cx="326" cy="524" r="21" fill="none" stroke="${W}" stroke-width="1.6"/>
${icon.wa(163, 513, 22, W)}
${icon.ig(315, 513, 22, W)}
<rect x="205" y="557" width="90" height="5" rx="2.5" fill="${W}"/>`,
    gusset: `<g transform="translate(116 300) rotate(-90)">${wordmark(0, 0, 44, W_INK)}</g>`,
  };
});

add('03-resplandor', 'Resplandor', () => {
  const cx = 250;
  const cy = 248;
  const r0 = 86;
  let d = '';
  const n = 64;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const long = i % 2 === 0;
    const r1 = long ? 170 : 128;
    const hw = long ? 3.8 : 2.7;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const bx = cx + r0 * ca;
    const by = cy + r0 * sa;
    d += `M${f(bx - sa * hw)} ${f(by + ca * hw)}L${f(cx + r1 * ca)} ${f(cy + r1 * sa)}L${f(bx + sa * hw)} ${f(by - ca * hw)}Z`;
  }
  return {
    theme: 'white',
    front: `<path d="${d}" fill="${INK}"/>
<circle cx="${cx}" cy="${cy}" r="${r0 - 10}" fill="none" stroke="${INK}" stroke-width="1.4"/>
${monogram(cx, cy, 110, INK, WHITE)}
${wordmark(250, 472, 48, INK)}
${bq(250, 507, 36, INK)}
${slogan(250, 546, 21, INK)}`,
    gusset: `<g transform="translate(112 300) rotate(-90)">${slogan(0, 0, 34, INK)}</g>`,
  };
});

add('04-cruz-celular', 'Cruz en el celular', () => {
  const x0 = 158;
  const y0 = 80;
  const g = 20;
  const cw = 82;
  const th = 119;
  const bh = 221;
  const R = 30;
  const s = 3;
  const blocks = [
    roundedRect(x0, y0, cw, th, [R, s, 0, s]),
    roundedRect(x0 + cw + g, y0, cw, th, [s, R, s, 0]),
    roundedRect(x0, y0 + th + g, cw, bh, [s, 0, s, R]),
    roundedRect(x0 + cw + g, y0 + th + g, cw, bh, [0, s, R, s]),
  ].join('');
  return {
    theme: 'white',
    front: `<path d="${blocks}" fill="${INK}"/>
<g fill="${INK}">
  <rect x="153" y="130" width="3.5" height="18" rx="1.5"/>
  <rect x="153" y="160" width="3.5" height="30" rx="1.5"/>
  <rect x="153" y="198" width="3.5" height="30" rx="1.5"/>
  <rect x="343.5" y="172" width="3.5" height="46" rx="1.5"/>
</g>
${wordmark(232, 500, 46, INK)}
${bq(340, 503, 36, INK, 'start')}
${slogan(250, 542, 21, INK)}`,
    gusset: `<rect width="200" height="600" fill="${BLACK}"/><g transform="translate(112 300) rotate(-90)">${slogan(0, 0, 34, W_INK)}</g>`,
  };
});

add('05-luz-y-sombra', 'Luz y sombra', () => {
  const art = (c, gap) => `${monogram(250, 212, 172, c, gap)}
${wordmark(250, 410, 60, c)}
${bq(250, 456, 46, c)}
${slogan(250, 540, 23, c)}`;
  return {
    theme: 'white',
    front: `<rect x="0" y="0" width="250" height="600" fill="${BLACK}"/>
<g clip-path="url(#cL)">${art(W_INK, BLACK)}</g>
<g clip-path="url(#cR)">${art(INK, WHITE)}</g>`,
    gusset: `<g transform="translate(112 300) rotate(-90)">${wordmark(0, 0, 40, INK)}</g>`,
  };
});

// patrón de monogramas y cruces (06 en barniz sobre negro, 10 en gris claro)
function pattern(w, h, ox = 0, oy = 0, fill = 'url(#gloss)', gap = BLACK) {
  let p = '';
  for (let j = -1; j * 84 < h + 84; j++)
    for (let i = -1; i * 84 < w + 84; i++) {
      const x = ox + 42 + i * 84;
      const y = oy + 42 + j * 84;
      p += monogram(x, y, 40, fill, gap);
      p += icon.cross(x + 42, y + 42, 17, fill);
    }
  return p;
}

add('06-monograma', 'Monograma', () => {
  return {
    theme: 'black',
    front: `${pattern(500, 600)}
<rect x="116" y="212" width="268" height="176" fill="${WHITE}"/>
<rect x="123.5" y="219.5" width="253" height="161" fill="none" stroke="${INK}" stroke-width="1.2"/>
${wordmark(250, 290, 50, INK)}
${bq(250, 328, 36, INK)}
<line x1="215" x2="285" y1="342" y2="342" stroke="${INK}" stroke-width="1"/>
${slogan(250, 366, 16.5, INK)}`,
    gusset: pattern(200, 600, -20, 10),
  };
});

add('07-tipografico', 'Tipográfico', () => ({
  theme: 'white',
  front: `${monogram(70, 132, 66, INK, WHITE)}
<text x="44" y="282" ${FONT.word} font-size="52" fill="${INK}" textLength="412" lengthAdjust="spacingAndGlyphs">BENDECIDOS</text>
<text x="250" y="337" ${FONT.script} font-size="74" fill="${INK}" text-anchor="middle">para</text>
<text x="44" y="414" ${FONT.word} font-size="64" fill="${INK}" textLength="412" lengthAdjust="spacingAndGlyphs">BENDECIR</text>
<line x1="44" x2="456" y1="474" y2="474" stroke="${INK}" stroke-width="1"/>
${wordmark(44, 518, 26, INK, 'start')}
${bq(178, 520, 26, INK, 'start')}
<text x="456" y="517" ${FONT.serif} font-style="italic" font-size="16" fill="${INK}" text-anchor="end">Génesis 12:2</text>`,
  gusset: qr(36, 330, 128, INK),
}));

add('08-sello', 'Sello', () => {
  const cx = 250;
  const cy = 292;
  const W = W_INK;
  return {
    theme: 'black',
    defs: `<path id="sTop" d="M${cx - 127} ${cy}A127 127 0 0 1 ${cx + 127} ${cy}"/><path id="sBot" d="M${cx - 140} ${cy}A140 140 0 0 0 ${cx + 140} ${cy}"/>`,
    front: `<circle cx="${cx}" cy="${cy}" r="166" fill="none" stroke="${W}" stroke-width="2.6"/>
<circle cx="${cx}" cy="${cy}" r="157" fill="none" stroke="${W}" stroke-width="1"/>
<circle cx="${cx}" cy="${cy}" r="111" fill="none" stroke="${W}" stroke-width="1"/>
<text font-family="Archivo" font-weight="800" font-size="16.5" letter-spacing="3.2" fill="${W}" style="font-stretch:112%"><textPath href="#sTop" startOffset="50%" text-anchor="middle">BENDECIDOS PARA BENDECIR</textPath></text>
<text font-family="Archivo" font-weight="800" font-size="16.5" letter-spacing="3.2" fill="${W}" style="font-stretch:112%"><textPath href="#sBot" startOffset="50%" text-anchor="middle">JDCEL <tspan font-family="Playball" font-weight="400" font-size="21" letter-spacing="0">Bq</tspan></textPath></text>
${icon.cross(cx - 134, cy, 15, W)}
${icon.cross(cx + 134, cy, 15, W)}
${monogram(cx, cy, 132, W, BLACK)}`,
    gusset: `<g transform="translate(116 300) rotate(-90)">${wordmark(0, 0, 44, W_INK)}</g>`,
  };
});

add('09-reverso', 'Reverso (contacto)', () => {
  const row = (y, ic, txt) => `${ic(128, y - 19, 26, INK)}<text x="168" y="${y}" font-family="Archivo" font-weight="700" font-size="21" fill="${INK}" style="font-stretch:105%">${txt}</text>`;
  return {
    theme: 'white',
    front: `${monogram(250, 152, 74, INK, WHITE)}
<line x1="128" x2="372" y1="218" y2="218" stroke="${INK}" stroke-width="1"/>
${row(262, icon.wa, '[tu número]')}
${row(302, icon.ig, '[@tu_usuario]')}
${row(342, icon.pin, '[dirección del local]')}
${qr(196, 374, 108, INK, 5)}
<text x="250" y="506" ${FONT.serif} font-size="15" fill="${INK}" text-anchor="middle">escanéalo y escríbenos por WhatsApp</text>
${slogan(250, 566, 21, INK, 'middle', true)}`,
    gusset: `<g transform="translate(112 300) rotate(-90)">${wordmark(0, 0, 40, INK)}</g>`,
  };
});

add('10-monograma-claro', 'Monograma claro', () => ({
  theme: 'white',
  raster: true,
  front: `<image href="../../arte-frente/10-monograma-claro.png" x="0" y="0" width="500" height="600" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode:multiply"/>`,
  gusset: pattern(200, 600, -20, 10, '#CBCBCB', '#E7E7E4'),
}));


// ---------------------------------------------------------------- ronda 2 (a partir de la referencia del cliente)
add('11-monograma-gigante', 'Monograma gigante', () => ({
  theme: 'white', scene: 'hang', cord: 'white',
  front: `${monogram(250, 170, 510, INK, WHITE)}${lockup(INK)}`,
}));

add('12-jj-en-cinta', 'JJ en cinta', () => {
  const cxh = 210;
  const cyh = 196;
  const rib = (r) => `M${cxh + r} -40V${cyh}A${r} ${r} 0 0 1 ${cxh - r} ${cyh}`;
  return {
    theme: 'white', scene: 'hang', cord: 'white',
    front: `<g fill="none" stroke="${INK}" stroke-width="64"><path d="${rib(100)}"/><path d="${rib(218)}"/></g>${lockup(INK)}`,
  };
});

add('13-cruz-en-franjas', 'Cruz en franjas', () => {
  const sk = 'M250 -260V330M-200 118H700';
  const bands = [240, 168, 96, 32]
    .map((w, i) => `<path d="${sk}" fill="none" stroke="${i % 2 ? WHITE : INK}" stroke-width="${w}" stroke-linecap="round"/>`)
    .join('');
  return { theme: 'white', scene: 'hang', cord: 'white', front: `${bands}${lockup(INK)}` };
});

add('14-senal', 'Señal', () => {
  // abanico de señal: arcos de ±50° con puntas redondas y el punto abajo
  const cx = 250;
  const cy = 430;
  const a = (50 * Math.PI) / 180;
  let arcs = '';
  for (let k = 0; k < 7; k++) {
    const r = 82 + k * 62;
    arcs += `M${f(cx - r * Math.sin(a))} ${f(cy - r * Math.cos(a))}A${r} ${r} 0 0 1 ${f(cx + r * Math.sin(a))} ${f(cy - r * Math.cos(a))}`;
  }
  return {
    theme: 'black', scene: 'hang', cord: 'black',
    front: `<path d="${arcs}" fill="none" stroke="${W_INK}" stroke-width="34" stroke-linecap="round"/><circle cx="${cx}" cy="${cy - 6}" r="24" fill="${W_INK}"/>${lockup(W_INK)}`,
  };
});

add('15-bq-gigante', 'Bq gigante', () => ({
  theme: 'black', scene: 'hang', cord: 'black',
  front: `<text x="-40" y="345" ${FONT.script} font-size="560" fill="${W_INK}">Bq</text>${lockup(W_INK)}`,
}));


// ---------------------------------------------------------------- diseño final (el que eligió el cliente)
// Su arte en el frente y un QR real de WhatsApp en el costado, en dos alturas.
const WHATSAPP = 'https://wa.me/573117346937';
const finalFront = `<image href="../../arte-frente/final-frente.png" x="0" y="0" width="500" height="600" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode:multiply"/>`;
add('final-a-qr-como-antes', 'Final · QR como antes', () => ({ theme: 'white', raster: true, fuelle: true, front: finalFront, gusset: qrCode(36, 330, 128, INK, WHATSAPP) }));
add('final-b-qr-mas-arriba', 'Final · QR más arriba', () => ({ theme: 'white', raster: true, fuelle: true, front: finalFront, gusset: qrCode(36, 193, 128, INK, WHATSAPP) }));

// ---------------------------------------------------------------- flat vector art (front panel only)
const SVG_FONTS = "@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&amp;family=Playfair+Display:wght@900&amp;family=Playball&amp;family=EB+Garamond:ital,wght@0,400;1,400&amp;display=swap');";
fs.mkdirSync(path.join(OUT, 'svg'), { recursive: true });
for (const c of concepts.filter((k) => k.fuelle)) {
  fs.writeFileSync(path.join(OUT, 'svg', `fuelle-${c.id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 600" width="100mm" height="300mm">
<!-- JDCEL Bq · ${c.title} · costado (fuelle) de 10 x 30 cm; se dobla por la mitad (x = 100) cuando la bolsa se aplana. QR: WhatsApp 3117346937 -->
<rect width="200" height="600" fill="#ffffff"/>
${c.gusset}
</svg>
`);
}
for (const c of concepts.filter((k) => !k.raster)) {
  const paper = c.theme === 'black' ? BLACK : '#ffffff';
  const flat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" width="250mm" height="300mm">
<!-- JDCEL Bq · ${c.title} · frente 25 x 30 cm (1 unidad = 0,5 mm). Los 3,6 cm superiores (y < 72) son la boca que se dobla hacia adentro. Monograma JJ aproximado: reemplazar por el vector original. -->
<style>${SVG_FONTS}</style>
<defs>
  <linearGradient id="gloss" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="500" y2="600"><stop offset="0" stop-color="#424242"/><stop offset=".45" stop-color="#2b2b2b"/><stop offset="1" stop-color="#222222"/></linearGradient>
  <filter id="emboss" x="-8%" y="-8%" width="116%" height="116%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/><feOffset in="b" dx="2" dy="2.4" result="bo"/><feFlood flood-color="#000" flood-opacity=".34"/><feComposite in2="bo" operator="in" result="sh"/><feOffset in="b" dx="-1.6" dy="-1.8" result="ho"/><feFlood flood-color="#fff" flood-opacity="1"/><feComposite in2="ho" operator="in" result="hl"/><feMerge><feMergeNode in="sh"/><feMergeNode in="hl"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="cL"><rect x="0" y="0" width="250" height="600"/></clipPath>
  <clipPath id="cR"><rect x="250" y="0" width="250" height="600"/></clipPath>
  ${c.defs || ''}
</defs>
<rect width="500" height="600" fill="${paper}"/>
${c.theme === 'white' ? c.front.replaceAll(WHITE, '#ffffff') : c.front}
</svg>
`;
  fs.writeFileSync(path.join(OUT, 'svg', `${c.id}.svg`), flat);
}

// ---------------------------------------------------------------- render
const only = process.argv[2];
const list = only ? concepts.filter((c) => c.id.startsWith(only)) : concepts;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: S.W, height: S.H }, deviceScaleFactor: 2 });
for (const c of list) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../fonts/fonts.css"><style>body{margin:0}svg{display:block}</style></head><body>${c.scene === 'hang' ? sceneHang(c) : scene(c)}</body></html>`;
  const file = path.join(OUT, `${c.id}.html`);
  fs.writeFileSync(file, html);
  await page.goto('file://' + file);
  await page.evaluate(async () => {
    await Promise.all([
      '900 50px Archivo', '800 16px Archivo', '700 16px Archivo', '500 16px Archivo',
      '900 50px "Playfair Display"', '40px Playball', '20px "EB Garamond"', 'italic 20px "EB Garamond"',
    ].map((s) => document.fonts.load(s)));
    await document.fonts.ready;
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, `${c.id}.jpg`), type: 'jpeg', quality: 90 });
  console.log('rendered', c.id);
}
await browser.close();
