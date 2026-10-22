// Uygulama simgesini (ico + png) sıfırdan üretir. Harici araç gerekmez.
// Kullanım: node tools/ikon-uret.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const CIKTI = path.join(process.cwd(), 'assets');
const BOYUTLAR = [16, 24, 32, 48, 64, 128, 256];
const AS = 3; // kenar yumuşatma için üst örnekleme

const renk = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
];

const DURAKLAR = [
  [0.0, renk('#8b5cf6')],
  [0.55, renk('#5b4bff')],
  [1.0, renk('#0ea5e9')]
];

function zemin(u, v) {
  const t = Math.max(0, Math.min(1, u * 0.5 + v * 0.5));
  for (let i = 1; i < DURAKLAR.length; i += 1) {
    const [t0, c0] = DURAKLAR[i - 1];
    const [t1, c1] = DURAKLAR[i];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0 || 1);
      return [
        c0[0] + (c1[0] - c0[0]) * k,
        c0[1] + (c1[1] - c0[1]) * k,
        c0[2] + (c1[2] - c0[2]) * k
      ];
    }
  }
  return DURAKLAR[DURAKLAR.length - 1][1];
}

// ------------------------------------------------------------------ çizim
function yuvarlakDikdortgen(hedef, w, x0, y0, gw, gh, r, boya) {
  const x1 = x0 + gw;
  const y1 = y0 + gh;
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(w, Math.ceil(y1)); y += 1) {
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x += 1) {
      // köşe yarıçapı kontrolü
      const cx = Math.min(Math.max(x + 0.5, x0 + r), x1 - r);
      const cy = Math.min(Math.max(y + 0.5, y0 + r), y1 - r);
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > r * r) continue;
      const i = (y * w + x) * 4;
      hedef[i] = boya[0];
      hedef[i + 1] = boya[1];
      hedef[i + 2] = boya[2];
      hedef[i + 3] = boya.length > 3 ? boya[3] : 255;
    }
  }
}

function daire(hedef, w, cx, cy, r, boya) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y += 1) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x += 1) {
      if (x < 0 || y < 0 || x >= w || y >= w) continue;
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > r * r) continue;
      const i = (y * w + x) * 4;
      hedef[i] = boya[0];
      hedef[i + 1] = boya[1];
      hedef[i + 2] = boya[2];
      hedef[i + 3] = 255;
    }
  }
}

function cizgi(hedef, w, x1, y1, x2, y2, kalinlik, boya) {
  const yari = kalinlik / 2;
  const minX = Math.floor(Math.min(x1, x2) - yari - 1);
  const maxX = Math.ceil(Math.max(x1, x2) + yari + 1);
  const minY = Math.floor(Math.min(y1, y2) - yari - 1);
  const maxY = Math.ceil(Math.max(y1, y2) + yari + 1);
  const vx = x2 - x1;
  const vy = y2 - y1;
  const uzunlukKare = vx * vx + vy * vy || 1;
  for (let y = Math.max(0, minY); y <= Math.min(w - 1, maxY); y += 1) {
    for (let x = Math.max(0, minX); x <= Math.min(w - 1, maxX); x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      let t = ((px - x1) * vx + (py - y1) * vy) / uzunlukKare;
      t = Math.max(0, Math.min(1, t));
      const dx = px - (x1 + vx * t);
      const dy = py - (y1 + vy * t);
      if (dx * dx + dy * dy > yari * yari) continue;
      const i = (y * w + x) * 4;
      hedef[i] = boya[0];
      hedef[i + 1] = boya[1];
      hedef[i + 2] = boya[2];
      hedef[i + 3] = 255;
    }
  }
}

function ikonCiz(boyut) {
  const w = boyut * AS;
  const tuval = new Uint8Array(w * w * 4);
  const olcek = w / 256;

  // yuvarlak köşeli zemin + degrade
  const bosluk = 10 * olcek;
  const yaricap = 58 * olcek;
  const x0 = bosluk;
  const y0 = bosluk;
  const gw = w - bosluk * 2;
  for (let y = Math.floor(y0); y < y0 + gw; y += 1) {
    for (let x = Math.floor(x0); x < x0 + gw; x += 1) {
      const cx = Math.min(Math.max(x + 0.5, x0 + yaricap), x0 + gw - yaricap);
      const cy = Math.min(Math.max(y + 0.5, y0 + yaricap), y0 + gw - yaricap);
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > yaricap * yaricap) continue;
      const c = zemin((x - x0) / gw, (y - y0) / gw);
      const i = (y * w + x) * 4;
      tuval[i] = c[0];
      tuval[i + 1] = c[1];
      tuval[i + 2] = c[2];
      tuval[i + 3] = 255;
    }
  }

  const beyaz = [255, 255, 255];
  const cizgiKalinligi = 13 * olcek;

  // fotoğraf çerçevesi (beyaz dolgu + içini tekrar degrade ile doldur)
  const fx = 48 * olcek;
  const fy = 62 * olcek;
  const fw = 160 * olcek;
  const fh = 132 * olcek;
  const fr = 20 * olcek;
  yuvarlakDikdortgen(tuval, w, fx, fy, fw, fh, fr, beyaz);

  const icBosluk = cizgiKalinligi;
  for (let y = Math.floor(fy + icBosluk); y < fy + fh - icBosluk; y += 1) {
    for (let x = Math.floor(fx + icBosluk); x < fx + fw - icBosluk; x += 1) {
      const cx = Math.min(Math.max(x + 0.5, fx + icBosluk + fr), fx + fw - icBosluk - fr);
      const cy = Math.min(Math.max(y + 0.5, fy + icBosluk + fr), fy + fh - icBosluk - fr);
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > fr * fr) continue;
      const c = zemin((x - x0) / gw, (y - y0) / gw);
      const i = (y * w + x) * 4;
      tuval[i] = c[0];
      tuval[i + 1] = c[1];
      tuval[i + 2] = c[2];
      tuval[i + 3] = 255;
    }
  }

  // dağ + güneş
  cizgi(tuval, w, 66 * olcek, 178 * olcek, 112 * olcek, 132 * olcek, cizgiKalinligi, beyaz);
  cizgi(tuval, w, 112 * olcek, 132 * olcek, 142 * olcek, 162 * olcek, cizgiKalinligi, beyaz);
  cizgi(tuval, w, 142 * olcek, 162 * olcek, 168 * olcek, 136 * olcek, cizgiKalinligi, beyaz);
  cizgi(tuval, w, 168 * olcek, 136 * olcek, 196 * olcek, 180 * olcek, cizgiKalinligi, beyaz);
  daire(tuval, w, 92 * olcek, 110 * olcek, 13 * olcek, beyaz);

  // parıltı (yapay zekâ vurgusu)
  const px = 206 * olcek;
  const py = 40 * olcek;
  const pBoy = 15 * olcek;
  cizgi(tuval, w, px - pBoy, py, px + pBoy, py, 8 * olcek, beyaz);
  cizgi(tuval, w, px, py - pBoy, px, py + pBoy, 8 * olcek, beyaz);

  return kucult(tuval, w, boyut);
}

function kucult(tuval, w, boyut) {
  const cikti = new Uint8Array(boyut * boyut * 4);
  for (let y = 0; y < boyut; y += 1) {
    for (let x = 0; x < boyut; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < AS; sy += 1) {
        for (let sx = 0; sx < AS; sx += 1) {
          const i = ((y * AS + sy) * w + (x * AS + sx)) * 4;
          const alfa = tuval[i + 3] / 255;
          r += tuval[i] * alfa;
          g += tuval[i + 1] * alfa;
          b += tuval[i + 2] * alfa;
          a += alfa;
        }
      }
      const n = AS * AS;
      const o = (y * boyut + x) * 4;
      cikti[o] = Math.round(a > 0 ? r / a : 0);
      cikti[o + 1] = Math.round(a > 0 ? g / a : 0);
      cikti[o + 2] = Math.round(a > 0 ? b / a : 0);
      cikti[o + 3] = Math.round((a / n) * 255);
    }
  }
  return cikti;
}

// ------------------------------------------------------------------ PNG
const CRC_TABLO = (() => {
  const tablo = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tablo[n] = c >>> 0;
  }
  return tablo;
})();

function crc32(tampon) {
  let c = 0xffffffff;
  for (let i = 0; i < tampon.length; i += 1) c = CRC_TABLO[(c ^ tampon[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function parca(tur, veri) {
  const uzunluk = Buffer.alloc(4);
  uzunluk.writeUInt32BE(veri.length);
  const govde = Buffer.concat([Buffer.from(tur, 'ascii'), veri]);
  const kontrol = Buffer.alloc(4);
  kontrol.writeUInt32BE(crc32(govde));
  return Buffer.concat([uzunluk, govde, kontrol]);
}

function pngYaz(rgba, boyut) {
  const satirlar = Buffer.alloc((boyut * 4 + 1) * boyut);
  for (let y = 0; y < boyut; y += 1) {
    satirlar[y * (boyut * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * boyut * 4, boyut * 4).copy(
      satirlar,
      y * (boyut * 4 + 1) + 1
    );
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(boyut, 0);
  ihdr.writeUInt32BE(boyut, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    parca('IHDR', ihdr),
    parca('IDAT', zlib.deflateSync(satirlar, { level: 9 })),
    parca('IEND', Buffer.alloc(0))
  ]);
}

// ------------------------------------------------------------------ ICO
function icoYaz(pngler) {
  const baslik = Buffer.alloc(6);
  baslik.writeUInt16LE(0, 0);
  baslik.writeUInt16LE(1, 2);
  baslik.writeUInt16LE(pngler.length, 4);

  const dizin = Buffer.alloc(16 * pngler.length);
  let ofset = 6 + dizin.length;
  pngler.forEach(({ boyut, veri }, sira) => {
    const d = sira * 16;
    dizin[d] = boyut >= 256 ? 0 : boyut;
    dizin[d + 1] = boyut >= 256 ? 0 : boyut;
    dizin[d + 2] = 0;
    dizin[d + 3] = 0;
    dizin.writeUInt16LE(1, d + 4);
    dizin.writeUInt16LE(32, d + 6);
    dizin.writeUInt32LE(veri.length, d + 8);
    dizin.writeUInt32LE(ofset, d + 12);
    ofset += veri.length;
  });

  return Buffer.concat([baslik, dizin, ...pngler.map((p) => p.veri)]);
}

fs.mkdirSync(CIKTI, { recursive: true });

const pngler = BOYUTLAR.map((boyut) => {
  const veri = pngYaz(ikonCiz(boyut), boyut);
  return { boyut, veri };
});

for (const { boyut, veri } of pngler) {
  fs.writeFileSync(path.join(CIKTI, boyut === 256 ? 'icon.png' : `icon-${boyut}.png`), veri);
}
fs.writeFileSync(path.join(CIKTI, 'icon.ico'), icoYaz(pngler));

console.log('Simge üretildi:', path.join(CIKTI, 'icon.ico'));
