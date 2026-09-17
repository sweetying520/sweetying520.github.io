/* global hexo */
'use strict';
const path = require('node:path');
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.bodyBegin.file('site-background', path.join(hexo.base_dir, 'source/_inject/bodyBegin.ejs'));
  if (hexo.theme.config.site_extras?.live2d) {
    injects.head.raw('live2d-icons', '<link rel="stylesheet" href="https://lib.baomitu.com/font-awesome/4.7.0/css/font-awesome.min.css">');
    injects.bodyEnd.raw('live2d', '<script src="/live2d-widget/autoload.js" defer></script>');
  }
});
