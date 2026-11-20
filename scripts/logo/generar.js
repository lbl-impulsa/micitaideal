// Genera los logos finales de Mi Cita Ideal en SVG con los textos convertidos a trazos.
// Uso: node generar.js <carpeta-fuentes> <carpeta-salida>
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const [, , FONTS, OUT] = process.argv;
const font = f => opentype.loadSync(path.join(FONTS, f));
const F = { tit: font('fraunces-600.ttf'), titI: font('fraunces-600i.ttf'), txt: font('dmsans-500.ttf'), txtB: font('dmsans-700.ttf') };

const C = { bordo: '#7A1F3D', rojo: '#E8505B', rosa: '#F6D6D3', crema: '#FFF8F1', carbon: '#2A2326' };
const CLARO = { mark: C.rojo, ink: C.bordo, txt: C.bordo, sub: C.rojo };
const OSCURO = { mark: C.rojo, ink: C.crema, txt: C.crema, sub: C.rosa };
const MONO_B = { mark: C.bordo, ink: C.bordo, txt: C.bordo, sub: C.bordo };
const MONO_C = { mark: C.crema, ink: C.crema, txt: C.crema, sub: C.crema };

const r = n => Math.round(n * 100) / 100;

// ---------- texto a trazos ----------
function medir(f, s, size, track = 0) {
  let w = 0, prev = null;
  for (const ch of s) {
    const g = f.charToGlyph(ch);
    if (prev) w += f.getKerningValue(prev, g) * size / f.unitsPerEm;
    w += g.advanceWidth * size / f.unitsPerEm + track;
    prev = g;
  }
  return w - track;
}
function texto(f, s, x, y, size, fill, track = 0) {
  let d = '', prev = null;
  for (const ch of s) {
    const g = f.charToGlyph(ch);
    if (prev) x += f.getKerningValue(prev, g) * size / f.unitsPerEm;
    d += g.getPath(x, y, size).toPathData(2);
    x += g.advanceWidth * size / f.unitsPerEm + track;
    prev = g;
  }
  return `<path fill="${fill}" d="${d}"/>`;
}
function textoCircular(f, s, cx, cy, radio, size, fill, track = 0) {
  // Texto alrededor de un círculo, empezando arriba y en sentido horario.
  const total = medir(f, s, size, track);
  const circ = 2 * Math.PI * radio;
  const escala = circ / (total + track); // reparte el texto en toda la vuelta
  let pos = 0, out = '', prev = null;
  for (const ch of s) {
    const g = f.charToGlyph(ch);
    if (prev) pos += f.getKerningValue(prev, g) * size / f.unitsPerEm;
    const adv = g.advanceWidth * size / f.unitsPerEm;
    const centro = (pos + adv / 2) * escala;
    const ang = centro / radio; // radianes desde arriba
    const gx = cx + radio * Math.sin(ang), gy = cy - radio * Math.cos(ang);
    const d = g.getPath(-adv / 2, 0, size).toPathData(2);
    if (d) out += `<path fill="${fill}" transform="translate(${r(gx)} ${r(gy)}) rotate(${r(ang * 180 / Math.PI)})" d="${d}"/>`;
    pos += adv + track;
    prev = g;
  }
  return out;
}

// ---------- formas base (caja de 64) ----------
const HRT = 'M32 54C20 44 8 34 8 22C8 14 14 8 21 8C26 8 30 11 32 15C34 11 38 8 43 8C50 8 56 14 56 22C56 34 44 44 32 54Z';
const PINHRT = 'M32 60C22 50 7 37 7 23C7 14.5 13.5 8 21.5 8C26 8 30 10.5 32 14.5C34 10.5 38 8 42.5 8C50.5 8 57 14.5 57 23C57 37 42 50 32 60Z';
const GOTA = 'M0 0C-8 -10 -15 -19 -15 -27A15 15 0 0 1 15 -27C15 -19 8 -10 0 0Z';
const corazon = (x, y, ancho, fill, extra = '') => `<path fill="${fill}" ${extra} transform="translate(${x} ${y}) scale(${r(ancho / 48)}) translate(-8 -8)" d="${HRT}"/>`;

// Cada ícono devuelve { formas, huecos }: los huecos se recortan con una máscara (quedan transparentes).
const ICONOS = {
  encuentro: p => ({
    formas: `<g transform="translate(32 55)"><path fill="${p.mark}" transform="rotate(-32)" d="${GOTA}"/><path fill="${p.ink}" transform="rotate(32)" d="${GOTA}"/></g>`,
    // Los huecos y una línea fina que separa los dos pines (clave en las versiones de un color).
    huecos: `<circle cx="17.7" cy="32.1" r="5.5"/><circle cx="46.3" cy="32.1" r="5.5"/>` +
      (p.mark === p.ink ? `<g transform="translate(32 55)"><path transform="rotate(32)" d="${GOTA}" fill="none" stroke="#000" stroke-width="3"/></g>` : '')
  }),
  tazas: p => ({
    formas: corazon(21, 3, 22, p.mark) +
      `<g fill="${p.ink}"><path transform="rotate(-10 18 41)" d="M9 30H28V46a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7Z"/><path transform="rotate(10 46 41)" d="M36 30H55V46a7 7 0 0 1-7 7H43a7 7 0 0 1-7-7Z"/></g>` +
      `<g fill="none" stroke="${p.ink}" stroke-width="3"><path transform="rotate(-10 18 41) translate(-1 0)" d="M9.5 35a5 5 0 0 0 -1 9"/><path transform="rotate(10 46 41) translate(1 0)" d="M54.5 35a5 5 0 0 1 1 9"/></g>`,
    huecos: ''
  }),
  barrilete: p => ({
    // Corazón-barrilete inclinado, con varillas y cola con moños.
    formas: `<g transform="rotate(-14 32 19)">${corazon(14, 2, 36, p.mark)}</g>` +
      `<path d="M36.2 36C33 43 44 47 38.5 52.5S25 59 17 61.5" fill="none" stroke="${p.ink}" stroke-width="2.2" stroke-linecap="round"/>` +
      `<g fill="${p.mark}"><path transform="translate(39.6 46.5) rotate(-25)" d="M-5.5 -3.3L0 0L-5.5 3.3ZM5.5 -3.3L0 0L5.5 3.3Z"/><path transform="translate(27.5 57.8) rotate(-20)" d="M-5 -3L0 0L-5 3ZM5 -3L0 0L5 3Z"/></g>`,
    huecos: `<g transform="rotate(-14 32 19)" stroke="#000" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M32 11V33"/><path d="M16.5 19H47.5"/></g>`
  }),
  anillo: p => ({
    formas: `<path fill="${p.mark}" d="${PINHRT}"/>`,
    huecos: `<circle cx="32" cy="28" r="6.5" fill="none" stroke="#000" stroke-width="3"/><path d="M32 15.5l3.6 3.6-3.6 3.6-3.6-3.6Z"/>`
  }),
  entrada: p => ({
    formas: `<path fill="${p.ink}" d="M10 14H54a4 4 0 0 1 4 4V27a5 5 0 0 0 0 10V46a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V37a5 5 0 0 0 0-10V18a4 4 0 0 1 4-4Z"/>` + corazon(13, 21, 26, p.mark),
    huecos: `<line x1="44" y1="19" x2="44" y2="45" stroke="#000" stroke-width="2.4" stroke-dasharray="3 3"/>`
  }),
  sello: p => ({
    formas: `<circle cx="32" cy="32" r="28" fill="none" stroke="${p.ink}" stroke-width="3"/><circle cx="32" cy="32" r="21" fill="none" stroke="${p.ink}" stroke-width="1.6" stroke-dasharray="2.5 3"/>` + corazon(18, 18, 28, p.mark),
    huecos: ''
  })
};

let uid = 0;
function icono(nombre, p, x = 0, y = 0, tam = 64) {
  const { formas, huecos } = ICONOS[nombre](p);
  const id = `h${++uid}`;
  const s = tam / 64;
  const cuerpo = huecos
    ? `<mask id="${id}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/>${huecos}</mask><g mask="url(#${id})">${formas}</g>`
    : formas;
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(s)})">${cuerpo}</g>`;
}

const svg = (w, h, body, titulo, fondo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${Math.ceil(w)}" height="${Math.ceil(h)}" role="img" aria-label="${titulo}"><title>${titulo}</title>${fondo ? `<rect width="100%" height="100%" fill="${fondo}"/>` : ''}${body}</svg>\n`;

const archivos = {};
const guardar = (rel, contenido) => { archivos[rel] = contenido; };

// ---------- logo principal ----------
const NOMBRE = 'Mi Cita Ideal', LEMA = 'DEL PRIMER CAFÉ AL SÍ, ACEPTO';
function horizontal(p, fondo) {
  const T = 44, t = 11.5, track = 1.6, pad = fondo ? 24 : 0;
  const wN = medir(F.tit, NOMBRE, T), wL = medir(F.txtB, LEMA, t, track);
  const xT = pad + 80, w = xT + Math.max(wN, wL) + pad, h = 80 + pad * 2;
  const body = icono('encuentro', p, pad, pad + 8, 64) + texto(F.tit, NOMBRE, xT, pad + 44, T, p.txt) + texto(F.txtB, LEMA, xT + 1, pad + 66, t, p.sub, track);
  return svg(w, h, body, 'Mi Cita Ideal', fondo);
}
function vertical(p, fondo) {
  const T = 40, t = 10.5, track = 1.5, pad = fondo ? 28 : 0;
  const wN = medir(F.tit, NOMBRE, T), wL = medir(F.txtB, LEMA, t, track);
  const w = Math.max(wN, wL, 110) + pad * 2, cx = w / 2;
  const body = icono('encuentro', p, cx - 48, pad, 96) + texto(F.tit, NOMBRE, cx - wN / 2, pad + 140, T, p.txt) + texto(F.txtB, LEMA, cx - wL / 2, pad + 164, t, p.sub, track);
  return svg(w, 172 + pad * 2, body, 'Mi Cita Ideal', fondo);
}
guardar('principal/mci-logo-horizontal.svg', horizontal(CLARO));
guardar('principal/mci-logo-horizontal-negativo.svg', horizontal(OSCURO, C.bordo));
guardar('principal/mci-logo-horizontal-mono-bordo.svg', horizontal(MONO_B));
guardar('principal/mci-logo-vertical.svg', vertical(CLARO));
guardar('principal/mci-logo-vertical-negativo.svg', vertical(OSCURO, C.bordo));
guardar('principal/mci-icono.svg', svg(64, 64, icono('encuentro', CLARO), 'Mi Cita Ideal'));
guardar('principal/mci-icono-negativo.svg', svg(64, 64, icono('encuentro', OSCURO), 'Mi Cita Ideal'));
guardar('principal/mci-icono-mono-bordo.svg', svg(64, 64, icono('encuentro', MONO_B), 'Mi Cita Ideal'));
guardar('principal/mci-icono-mono-crema.svg', svg(64, 64, icono('encuentro', MONO_C), 'Mi Cita Ideal'));
guardar('principal/mci-favicon.svg', svg(64, 64, `<rect width="64" height="64" rx="14" fill="${C.crema}"/>` + icono('encuentro', CLARO, 4, 2, 56), 'Mi Cita Ideal'));
guardar('principal/mci-avatar-instagram.svg', svg(320, 320, `<circle cx="160" cy="160" r="160" fill="${C.bordo}"/>` + icono('encuentro', OSCURO, 70, 62, 180), 'Mi Cita Ideal'));

// ---------- líneas ----------
const LINEAS = [
  { arch: 'cafe-de-por-medio', ic: 'tazas', nombre: 'Café de por medio', uso: 'Citas de café y parejas que quieren salir de la rutina' },
  { arch: 'planes-de-viaje', ic: 'barrilete', nombre: 'Planes de viaje', uso: 'Escapadas y viajes en pareja' },
  { arch: 'si-acepto', ic: 'anillo', nombre: 'Sí, acepto', uso: 'Propuestas de noviazgo y compromiso' },
  { arch: 'la-entrada', ic: 'entrada', nombre: 'La Entrada', uso: 'Cine, teatro y shows' },
  { arch: 'cartas-con-sello', ic: 'sello', nombre: 'Cartas con sello', uso: 'Cartas para escribirle a quien querés' }
];
function lineaLockup(l, p, fondo) {
  const T = 34, t = 10, track = 2.4, pad = fondo ? 22 : 0;
  const firma = 'MI CITA IDEAL';
  const wN = medir(F.titI, l.nombre, T), wF = medir(F.txtB, firma, t, track);
  const xT = pad + 74, w = xT + Math.max(wN, wF) + pad, h = 64 + pad * 2;
  const body = icono(l.ic, p, pad, pad, 64) + texto(F.titI, l.nombre, xT, pad + 36, T, p.txt) + texto(F.txtB, firma, xT + 1, pad + 56, t, p.sub, track);
  return svg(w, h, body, `${l.nombre} · Mi Cita Ideal`, fondo);
}
for (const l of LINEAS) {
  guardar(`lineas/${l.arch}.svg`, lineaLockup(l, CLARO));
  guardar(`lineas/${l.arch}-negativo.svg`, lineaLockup(l, OSCURO, C.bordo));
  guardar(`lineas/${l.arch}-icono.svg`, svg(64, 64, icono(l.ic, CLARO), l.nombre));
}

// ---------- sello para firmar cartas ----------
function selloCarta(p, rot = -8) {
  const S = 200, cx = 100, cy = 100;
  const anillo = textoCircular(F.txtB, 'DEL PRIMER CAFÉ AL SÍ, ACEPTO · MI CITA IDEAL · ', cx, cy, 76, 13.5, p.ink, 1.2);
  const body = `<g transform="rotate(${rot} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${p.ink}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${p.ink}" stroke-width="1.6" stroke-dasharray="3 4"/>${anillo}` +
    icono('encuentro', p, cx - 36, cy - 40, 72) + `</g>`;
  return svg(S, S, body, 'Sello de carta · Mi Cita Ideal');
}
guardar('lineas/sello-firma-carta.svg', selloCarta(CLARO));
guardar('lineas/sello-firma-carta-bordo.svg', selloCarta(MONO_B));

// ---------- escribir ----------
for (const [rel, contenido] of Object.entries(archivos)) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contenido);
}
console.log(Object.keys(archivos).length + ' archivos');
