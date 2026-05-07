import type { GeoEvent, PlateModel } from '../earth/data/schema';

export type NarrationMode = 'browser' | 'local-llm';

export type NarrationResult = {
  text: string;
  source: NarrationMode;
  error?: string;
};

function nearestActiveMountain(plates: PlateModel[], ageMa: number): string | null {
  let best: { name: string; score: number } | null = null;

  for (const plate of plates) {
    for (const belt of plate.mountainBelts) {
      if (ageMa <= belt.startMa && ageMa >= belt.endMa) {
        const midpoint = (belt.startMa + belt.endMa) / 2;
        const score = Math.abs(ageMa - midpoint) / Math.max(1, belt.startMa - belt.endMa);

        if (!best || score < best.score) {
          best = { name: belt.name, score };
        }
      }
    }
  }

  return best?.name ?? null;
}

export function deterministicNarration(
  event: GeoEvent,
  plates: PlateModel[],
  ageMa: number,
): string {
  const mountain = nearestActiveMountain(plates, ageMa);
  const mountainSentence = mountain
    ? ` Around this chapter, ${mountain.toLowerCase()} is one of the visible tectonic scars.`
    : '';

  return `${Math.round(ageMa)} million years before present: ${event.body}${mountainSentence}`;
}

export async function narrateWithOptionalLocalLlm({
  mode,
  event,
  plates,
  ageMa,
  endpoint,
  model,
}: {
  mode: NarrationMode;
  event: GeoEvent;
  plates: PlateModel[];
  ageMa: number;
  endpoint: string;
  model: string;
}): Promise<NarrationResult> {
  const fallback = deterministicNarration(event, plates, ageMa);

  if (mode === 'browser') {
    return { text: fallback, source: 'browser' };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const prompt = [
      'You are narrating a public educational plate-tectonics globe.',
      'Use one vivid paragraph under 80 words. Do not invent precise data.',
      `Age: ${Math.round(ageMa)} Ma.`,
      `Event: ${event.title}.`,
      `Reference narration: ${fallback}`,
    ].join('\n');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Local LLM returned ${response.status}`);
    }

    const payload = (await response.json()) as { response?: string };
    const text = payload.response?.trim();

    return { text: text || fallback, source: 'local-llm' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Local LLM unavailable';
    return { text: fallback, source: 'browser', error: message };
  } finally {
    window.clearTimeout(timeout);
  }
}
