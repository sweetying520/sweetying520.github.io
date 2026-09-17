(function () {
  'use strict';
  const player = document.getElementById('music_div');
  if (!player) return;
  const mobile = matchMedia('(max-width: 767px)');
  const threshold = /^\/(?:index\.html)?$/.test(location.pathname) ? 800 : 2500;
  function update() {
    const show = !mobile.matches && window.scrollY >= threshold;
    player.hidden = !show;
    const iframe = player.querySelector('iframe');
    if (show && iframe?.dataset.src) {
      iframe.src = iframe.dataset.src;
      delete iframe.dataset.src;
    }
  }
  window.addEventListener('scroll', update, {passive: true});
  mobile.addEventListener('change', update);
  update();
})();
