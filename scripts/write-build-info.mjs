import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));

function git(args, fallback) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return fallback;
  }
}

const sourceRef = process.env.BUILD_SOURCE_REF || 'HEAD';
const commit = git(
  ['rev-parse', '--short', sourceRef],
  git(['rev-parse', '--short', 'HEAD'], 'dev'),
);
const branch = git(['branch', '--show-current'], 'main');
const builtAt = git(['show', '-s', '--format=%cI', sourceRef], new Date().toISOString());

const output = `export const buildInfo = ${JSON.stringify(
  {
    version: packageJson.version,
    commit,
    branch,
    builtAt,
  },
  null,
  2,
)} as const;\n`;

const outputPath = resolve('src/generated/buildInfo.ts');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output);
console.log(`wrote ${outputPath}`);
