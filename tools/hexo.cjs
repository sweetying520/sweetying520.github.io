'use strict';
// Hexo's date-based permalinks also depend on the process timezone.
// Set it before loading Hexo so macOS and UTC-based CI keep the same URLs.
process.env.TZ = 'Asia/Shanghai';
require('hexo/bin/hexo');
