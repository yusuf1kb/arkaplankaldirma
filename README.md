# Arka Plan Kaldır ve Düzenle

Windows için küçük bir masaüstü uygulaması. Bir fotoğrafa **sağ tık**layıp
**“Arka Planı Kaldır ve Düzenle”** seçiyorsun; uygulama açılıyor, arka planı
saniyeler içinde kaldırıyor, kaldırılan yere istediğin rengi koyuyorsun ve
fotoğrafı yeni bir dosya olarak kaydediyorsun.

Her şey bilgisayarda çalışır: fotoğraflar hiçbir sunucuya gönderilmez.

---

## Kurulum (tek tık)

**`ArkaPlanKaldir-Kurulum-1.1.0.exe`** dosyasına çift tıkla. Hepsi bu:

- yönetici izni istemez, bu kullanıcı için kurulur,
- Node.js / internet **gerekmez** (yapay zekâ modeli kurulumun içinde),
- sağ tık menüsüne **“Arka Planı Kaldır ve Düzenle”** eklenir,
- Başlat menüsüne ve masaüstüne **Arka Plan Kaldır** kısayolu konur.

Kurulum dosyasını üretmek için:

```bat
npm install
npm run paket
```

Çıktı: `dist\ArkaPlanKaldir-Kurulum-<sürüm>.exe`.

> Windows, kod imzası olmadığı için ilk açılışta “Windows korumalı PC'nizi korudu”
> uyarısı gösterebilir: **Ek bilgi → Yine de çalıştır**.

### Kurulu uygulama nerede?

```
%LOCALAPPDATA%\Programs\arka-plan-kaldir\
├── ArkaPlanKaldir.exe      uygulama
├── resources\app.asar      arayüz ve kodlar
├── resources\models\       yapay zekâ modeli
└── Uninstall ArkaPlanKaldir.exe
```

Kısayollar bu `.exe` dosyasını gösterir; uygulamayı kısayoldan açabilirsin.

### Geliştirici kurulumu (Node.js ile)

Depoyu geliştirmek istiyorsan:

```bat
npm install
npm start
```

Sağ tık menüsünü kendi makinene kurmak için `kur.bat` dosyasına çift tıkla;
uygulamayı `%LOCALAPPDATA%\Programs\ArkaPlanKaldir` içine kopyalar ve modeli indirir.

---

## Kullanım

1. **Fotoğrafa sağ tık** → *Arka Planı Kaldır ve Düzenle*.
2. Uygulama açılır, arka plan otomatik olarak kaldırılır (ilk seferde model
   yüklendiği için birkaç saniye sürebilir).
3. Sağ panelden arka planı seç:
   - **Şeffaf** → arka plansız PNG,
   - **30 renklik palet** → tek tıkla uygula,
   - **Özel renk** → renk kutusu veya `#7C5CFF` gibi bir kod yaz,
   - son kullandığın renkler altında birikir.
4. **Düzenlenmiş / Orijinal** düğmesiyle sonucu orijinaliyle karşılaştır.
5. **Fotoğrafı kaydet** (veya `Ctrl+S`) → PNG ya da JPEG olarak, yeni bir dosya
   adıyla kaydedilir: `fotoğraf-arka-plan-kaldirildi.png`.
6. Kaydettikten sonra **“Klasörde göster”** ile dosyayı bulabilirsin.

Kısayollar: `Ctrl+S` kaydet · `Ctrl+O` fotoğraf aç · `Ctrl` + fare tekerleği
yakınlaştır.

Sürükle-bırak da çalışır: bir fotoğrafı pencerenin üzerine bırak.

### Tema

Pencerenin sağ üstündeki **tema düğmesi** ile dört görünüm arasında geçiş yapabilirsin:

- **Koyu** (varsayılan)
- **Açık**
- **Gece Mavisi**
- **Sıcak Kum**

Seçim anında uygulanır ve hatırlanır; uygulamayı kapatıp açtığında son tema açılır.

---

## Kaldırma

**Ayarlar → Uygulamalar → Yüklü uygulamalar → Arka Plan Kaldır → Kaldır.**

Ayrıca `%LOCALAPPDATA%\Programs\arka-plan-kaldir\Uninstall ArkaPlanKaldir.exe`
dosyası da kullanılabilir. Sağ tık menüsü kaydı ve kısayollar kaldırılır.

---

## Teknik notlar

- Arayüz: Electron 45 + saf HTML/CSS/JS.
- Arka plan kaldırma: [@imgly/background-removal](https://github.com/imgly/background-removal-js)
  (ISNet modeli, `onnxruntime-web` / WASM). Model cihazda çalışır, çok iş
  parçacıklı WASM için `crossOriginIsolated` açıktır.
- Model dosyaları: kurulu uygulamada `resources\models`; geliştirme sırasında
  `models` klasörü, yoksa `%LOCALAPPDATA%\ArkaPlanKaldir\models`.
- Uygulama dosyaları `ap://local/...` özel protokolüyle sunulur.
- Sağ tık menüsü: `HKCU\Software\Classes\SystemFileAssociations\image\shell\ArkaPlanKaldir`
  (yönetici izni gerekmez, yalnızca bu kullanıcı için).
- Windows 11’de klasik menü öğesi doğrudan sağ tık menüsünde görünür.
- Model lisansı: IMG.LY background-removal (AGPL-3.0); kişisel kullanım için ücretsizdir.

### Geliştirme komutları

```bat
npm install
npm start          :: uygulamayı geliştirme modunda aç
npm run bundle     :: arka plan kaldırma motorunu yeniden paketle
npm run ikon       :: assets/icon.ico dosyasını üret
npm run kur         :: geliştirici kurulumunu yenile
npm run paket       :: kurulum .exe dosyasını üret (dist\)
```

Dosya yapısı:

```
main.js                 Electron ana süreç (pencere, dosya, kayıt)
preload.js              Güvenli IPC köprüsü
renderer/               Arayüz (index.html, style.css, app.js)
  bgremove.bundle.js    Paketlenmiş arka plan kaldırma motoru
lib/model-indir.js      Model indirici
tools/kur.mjs           Geliştirici kurulumu (kopyalama, kayıt defteri, kısayol)
tools/ikon-uret.mjs     Simge üreteci
src/bgremove.js         Motorun paketleme giriş noktası
build/installer.nsh     Kurulumda sağ tık menüsünü ekleyen NSIS betiği
kur.bat                 Geliştirici kurulumunu başlatan dosya
```

---

## GitHub'a yükleme

Bu projeyi herkese açık paylaşacaksan:

**Yükle:** `main.js`, `preload.js`, `renderer/`, `lib/`, `tools/`, `src/`, `assets/`,
`build/`, `package.json`, `package-lock.json`, `kur.bat`, `README.md`, `.gitignore`, `LICENSE`.

**Yükleme:** `node_modules/` (≈400 MB), `models/` (≈54 MB) ve `dist/` (kurulum çıktısı).
`.gitignore` bunları zaten dışarıda bırakır.

Kullanacak kişi için iki yol var:

1. **En kolayı:** GitHub **Releases** bölümüne `dist\ArkaPlanKaldir-Kurulum-*.exe`
   dosyasını ekle. İndirip çift tıklayan herkes kurar; Node.js gerekmez.
2. **Kaynaktan:** Node.js kurup `npm install` + `kur.bat` çalıştırır.

**Lisans:** Arka plan kaldırma için kullanılan
[@imgly/background-removal](https://github.com/imgly/background-removal-js) kütüphanesi
**AGPL-3.0** lisanslıdır. Bu yüzden projeyi açık kaynak yaparken **AGPL-3.0** ile
lisanslaman gerekir (MIT yapamazsın). Ticari/özel lisans istiyorsan IMG.LY'den lisans
alman ya da motoru kendi modelinle değiştirmen gerekir.

**İmzasız uygulama uyarısı:** Kod imzası olmadığı için Windows SmartScreen
“bilinmeyen yayıncı” uyarısı gösterebilir; kullanıcı **Ek bilgi → Yine de çalıştır**
diyerek devam eder. Sertifika alındığında `electron-builder` ile imzalanabilir.
