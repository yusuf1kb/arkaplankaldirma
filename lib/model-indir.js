// Arka plan kaldırma modelini indirir. Hem kurulum hem de uygulama ilk açılışta kullanır.
// Model dosyaları büyük olduğu için uygulama klasöründe "models" altında tutulur.

const fs = require('node:fs');
const path = require('node:path');

const KOK = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/';
const VARSAYILAN_MODEL = 'isnet_quint8';

const ISTENENLER = (model) => [
  `/models/${model}`,
  '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
  '/onnxruntime-web/ort-wasm-simd-threaded.mjs'
];

function boyut(yol) {
  try {
    return fs.statSync(yol).size;
  } catch {
    return 0;
  }
}

function modelHazirMi(hedef) {
  const res = path.join(hedef, 'resources.json');
  const mdl = path.join(hedef, 'model.json');
  if (!fs.existsSync(res) || !fs.existsSync(mdl)) return false;
  try {
    const { model } = JSON.parse(fs.readFileSync(mdl, 'utf8'));
    const resources = JSON.parse(fs.readFileSync(res, 'utf8'));
    const kayit = resources[`/models/${model}`];
    if (!kayit) return false;
    return kayit.chunks.every(
      (p) => boyut(path.join(hedef, p.name)) === p.offsets[1] - p.offsets[0]
    );
  } catch {
    return false;
  }
}

async function indir(url, hedef) {
  const gecici = hedef + '.indiriliyor';
  const yanit = await fetch(url);
  if (!yanit.ok) throw new Error(`${url} -> HTTP ${yanit.status}`);
  const tampon = Buffer.from(await yanit.arrayBuffer());
  fs.writeFileSync(gecici, tampon);
  fs.renameSync(gecici, hedef);
}

/**
 * @param {object} secenek
 * @param {string} secenek.hedef  model klasörü
 * @param {(yuzde:number, metin:string)=>void} [secenek.ilerleme]
 */
async function modelIndir({ hedef, model = VARSAYILAN_MODEL, ilerleme = () => {} } = {}) {
  fs.mkdirSync(hedef, { recursive: true });

  ilerleme(0, 'Model bilgileri alınıyor…');
  const yanit = await fetch(KOK + 'resources.json');
  if (!yanit.ok) throw new Error('Model sunucusuna ulaşılamadı (HTTP ' + yanit.status + ').');
  const resources = await yanit.json();

  const secilen = {};
  for (const anahtar of ISTENENLER(model)) {
    if (!resources[anahtar]) throw new Error(`resources.json içinde ${anahtar} bulunamadı.`);
    secilen[anahtar] = resources[anahtar];
  }

  const parcalar = new Map();
  for (const kayit of Object.values(secilen)) {
    for (const parca of kayit.chunks) {
      if (boyut(path.join(hedef, parca.name)) !== parca.offsets[1] - parca.offsets[0]) {
        parcalar.set(parca.name, parca.offsets[1] - parca.offsets[0]);
      }
    }
  }

  const toplam = [...parcalar.values()].reduce((a, b) => a + b, 0);
  let tamam = 0;
  const liste = [...parcalar.keys()];
  let sira = 0;

  async function isci() {
    while (sira < liste.length) {
      const ad = liste[sira++];
      const yol = path.join(hedef, ad);
      await indir(KOK + ad, yol);
      tamam += boyut(yol);
      const oran = toplam === 0 ? 1 : Math.min(1, tamam / toplam);
      ilerleme(oran, `Model indiriliyor… %${Math.round(oran * 100)}`);
    }
  }

  await Promise.all(Array.from({ length: 6 }, () => isci()));

  fs.writeFileSync(path.join(hedef, 'resources.json'), JSON.stringify(secilen, null, 2));
  fs.writeFileSync(path.join(hedef, 'model.json'), JSON.stringify({ model }, null, 2));
  ilerleme(1, 'Model hazır');
  return model;
}

module.exports = { modelIndir, modelHazirMi, VARSAYILAN_MODEL };
