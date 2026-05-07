import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dataMetaSchema, tectonicsSchema } from './schema';

describe('tectonics data contract', () => {
  it('parses the committed v1 model and metadata', () => {
    const model = JSON.parse(readFileSync(resolve('public/data/v1/tectonics.json'), 'utf8'));
    const meta = JSON.parse(readFileSync(resolve('public/data/v1/tectonics.meta.json'), 'utf8'));

    expect(tectonicsSchema.parse(model).plates.length).toBeGreaterThan(5);
    expect(dataMetaSchema.parse(meta).schemaVersion).toBe('tectonics.v1');
  });
});
