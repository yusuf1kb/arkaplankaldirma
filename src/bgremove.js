// Arka plan kaldırma motorunu tek bir tarayıcı paketine dönüştürmek için giriş noktası.
// esbuild bu dosyayı renderer/bgremove.bundle.js olarak paketler.
import { removeBackground, preload } from '@imgly/background-removal';

window.APBR = { removeBackground, preload };
