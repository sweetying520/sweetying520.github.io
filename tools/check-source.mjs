import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'public', '.deploy_git', '.idea']);
const credential = /gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/;
function scan(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (ignored.has(entry.name) || entry.name === 'db.json') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (entry.isFile() && /\.(?:md|yml|yaml|js|cjs|mjs|json|ejs|txt)$/.test(entry.name)) {
      assert(!credential.test(fs.readFileSync(file, 'utf8')), `Possible private credential in ${path.relative(root,file)} (value omitted)`);
    }
  }
}
scan(root);
assert(!fs.existsSync('themes/fluid'), 'Local theme shadows the locked npm theme');
assert(!/^\s*token:\s*\S+/m.test(fs.readFileSync('_config.yml','utf8')), 'Remove deploy.token; SSH is used');
console.log('Source checks passed: no recognized private credentials or shadowing theme.');
