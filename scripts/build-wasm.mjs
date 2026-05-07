import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import wabtInit from 'wabt';

const sourcePath = resolve('wasm/reconstruction.wat');
const outputPath = resolve('public/wasm/reconstruction.wasm');
const source = readFileSync(sourcePath, 'utf8');
const wabt = await wabtInit();
const module = wabt.parseWat(sourcePath, source);
const { buffer } = module.toBinary({ log: false, write_debug_names: true });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, Buffer.from(buffer));
console.log(`built ${outputPath}`);
