import { dataMetaSchema, tectonicsSchema, type TectonicsData, type TectonicsMeta } from './schema';

async function fetchJson<T>(path: string, label: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`${label} failed to load (${response.status})`);
  }

  return parse(await response.json());
}

export async function loadTectonicsData(): Promise<{
  model: TectonicsData;
  meta: TectonicsMeta;
}> {
  const [model, meta] = await Promise.all([
    fetchJson('data/v1/tectonics.json', 'Tectonic model', (value) => tectonicsSchema.parse(value)),
    fetchJson('data/v1/tectonics.meta.json', 'Tectonic metadata', (value) =>
      dataMetaSchema.parse(value),
    ),
  ]);

  return { model, meta };
}
