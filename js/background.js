/* Optional enhancement; the local CSS background always remains. */
(function () {
  'use strict';
  const backdrop = document.getElementById('site-backdrop');
  if (!backdrop?.dataset.videos || matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection?.saveData) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  fetch(backdrop.dataset.videos, {signal: controller.signal})
    .then(response => {
      if (!response.ok) throw new Error('Video list unavailable');
      return response.json();
    })
    .then(list => {
      if (!Array.isArray(list) || !list.length) return;
      const safe = value => {
        if (typeof value !== 'string') return null;
        const url = new URL(value, location.origin);
        return url.protocol === 'https:' || (url.origin === location.origin && url.protocol === 'http:') ? url.href : null;
      };
      const entries = list.filter(entry => Array.isArray(entry) && safe(entry[0]));
      if (!entries.length) return;
      const [src, poster] = entries[Math.floor(Math.random() * entries.length)];
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      if (safe(poster)) video.poster = safe(poster);
      video.src = safe(src);
      const fallbackTimer = setTimeout(() => video.remove(), 10000);
      video.addEventListener('error', () => { clearTimeout(fallbackTimer); video.remove(); }, {once: true});
      video.addEventListener('playing', () => clearTimeout(fallbackTimer), {once: true});
      backdrop.append(video);
      video.play().catch(() => { clearTimeout(fallbackTimer); video.remove(); });
    })
    .catch(() => { /* Keep the local background on failure. */ })
    .finally(() => clearTimeout(timer));
})();
