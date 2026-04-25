import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const assets = [
  {
    url: 'https://g.jdycdn.com/static/app/pc/b711e894323f.png',
    dest: 'public/images/b711e894323f.png'
  }
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = await res.arrayBuffer();
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(buf));
  console.log(`✓ ${dest}`);
}

async function main() {
  for (const a of assets) {
    try { await download(a.url, a.dest); }
    catch (e) { console.error(`✗ ${a.dest}: ${e.message}`); }
  }
}

main();
