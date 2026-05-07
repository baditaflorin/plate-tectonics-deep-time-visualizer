import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

for (const path of ['docs/assets', 'docs/wasm']) {
  rmSync(resolve(path), { recursive: true, force: true });
}
