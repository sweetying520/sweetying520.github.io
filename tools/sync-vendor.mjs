import fs from 'node:fs';
import path from 'node:path';
const dest = 'source/vendor/jquery';
fs.mkdirSync(dest, {recursive: true});
for (const [src, name] of [['dist/jquery.min.js','jquery.min.js'], ['LICENSE.txt','LICENSE.txt']]) {
  fs.copyFileSync(path.join('node_modules/jquery',src),path.join(dest,name));
}
console.log('Prepared local jQuery from the locked npm dependency.');
