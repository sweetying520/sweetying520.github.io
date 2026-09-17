import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const publicDir = path.resolve('public');
const legacy = JSON.parse(fs.readFileSync('docs/legacy-post-routes.json','utf8'));
for (const route of legacy) assert(fs.existsSync(path.join(publicDir, route)), `Historical article URL lost: ${route}`);
for (const route of ['index.html','archives/index.html','categories/index.html','tags/index.html','about/index.html','links/index.html','404.html','local-search.xml']) {
  assert(fs.existsSync(path.join(publicDir,route)), `Required page missing: ${route}`);
}
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]); }
const files = walk(publicDir).filter(p=>p.endsWith('.html'));
const missing = new Set();
let checked = 0;
for (const file of files) {
  const html = fs.readFileSync(file,'utf8').replace(/<!--[\s\S]*?-->/g,'');
  if (!html.includes('id="banner"')) continue;
  checked++;
  assert.equal((html.match(/id=["']banner["']/g)||[]).length, 1, `Duplicate banner in ${file}`);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)/g)].map(m=>m[1]);
  assert.equal(scripts.filter(src=>/(?:^|\/)jquery(?:\.min)?\.js(?:[?#]|$)/i.test(src)).length,1, `Unexpected jQuery count in ${file}`);
  assert(!html.includes('101.43.39.125'), `Legacy background server remains in ${file}`);
  for (const match of html.matchAll(/\b(?:src|href)=["'](\/[^"']*)/g)) {
    if (match[1].startsWith('//')) continue;
    const target = decodeURIComponent(match[1].split(/[?#]/)[0]);
    if (!fs.existsSync(path.join(publicDir,target))) missing.add(target);
  }
}
assert.equal(missing.size,0,`Missing local assets or pages:\n${[...missing].join('\n')}`);
console.log(`Site checks passed: ${legacy.length} historical article URLs; ${checked} pages; one banner/jQuery per page; local targets present.`);
