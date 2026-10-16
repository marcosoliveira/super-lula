// Copies the static game files into dist/, which wrangler.jsonc publishes as assets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const entries = ['index.html', 'metadata.json', 'css', 'js', 'fonts'];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
for (const entry of entries) {
  fs.cpSync(path.join(root, entry), path.join(dist, entry), { recursive: true });
}
console.log(`Build completed: ${entries.join(', ')} -> dist/`);
