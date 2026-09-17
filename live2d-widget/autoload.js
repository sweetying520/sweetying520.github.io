/* Widget by https://github.com/stevenjoezhang/live2d-widget; see LICENSE. */
(function () {
  'use strict';
  if (matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) return;
  const base = '/live2d-widget/';
  function load(file, type) {
    return new Promise((resolve, reject) => {
      const tag = document.createElement(type === 'css' ? 'link' : 'script');
      if (type === 'css') { tag.rel = 'stylesheet'; tag.href = base + file; }
      else { tag.src = base + file; }
      tag.onload = resolve;
      tag.onerror = reject;
      document.head.appendChild(tag);
    });
  }
  Promise.all([load('waifu.css', 'css'), load('live2d.min.js', 'js'), load('waifu-tips.js', 'js')])
    .then(() => window.initWidget({
      waifuPath: base + 'waifu-tips.json',
      cdnPath: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
      defaultModel: 'ShizukuTalk/shizuku-pajama' // Shizuku：橙色长发、粉色睡衣。
    }))
    .catch(() => { /* Optional decoration must not stop the blog. */ });
})();
