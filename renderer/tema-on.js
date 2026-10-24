// Kaydedilmiş temayı ilk boyamadan önce uygular (arayüzde renk sıçraması olmasın).
(() => {
  const izinli = ['koyu', 'acik', 'gece', 'sicak'];
  let tema = 'koyu';
  try {
    tema = localStorage.getItem('tema') || 'koyu';
  } catch {
    /* yoksay */
  }
  if (!izinli.includes(tema)) tema = 'koyu';
  document.documentElement.dataset.tema = tema;
})();
