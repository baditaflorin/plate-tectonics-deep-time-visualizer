import { useQuery } from '@tanstack/react-query';
import { Github, HeartHandshake, Loader2, Satellite, Sparkles } from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { TimelineControls } from './features/earth/components/TimelineControls';
import { loadTectonicsData } from './features/earth/data/loadTectonicsData';
import type { GeoEvent } from './features/earth/data/schema';
import { nearestEventAge, type ReconstructionEngine } from './features/earth/lib/reconstruction';
import {
  deterministicNarration,
  narrateWithOptionalLocalLlm,
  type NarrationMode,
} from './features/narration/narrator';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { useLocalStorage } from './shared/useLocalStorage';
import { buildInfo } from './generated/buildInfo';

const DeepTimeGlobe = lazy(() =>
  import('./features/earth/components/DeepTimeGlobe').then((module) => ({
    default: module.DeepTimeGlobe,
  })),
);

const repositoryUrl = 'https://github.com/baditaflorin/plate-tectonics-deep-time-visualizer';
const paypalUrl = 'https://www.paypal.com/paypalme/florinbadita';

function daysSince(dateIso: string): number {
  const generated = new Date(dateIso).getTime();
  return Math.max(0, Math.floor((Date.now() - generated) / 86_400_000));
}

function findActiveEvent(events: GeoEvent[], ageMa: number): GeoEvent {
  const age = nearestEventAge(
    events.map((event) => event.ageMa),
    ageMa,
  );
  return events.find((event) => event.ageMa === age) ?? events[0]!;
}

function LoadingPanel() {
  return (
    <main className="app-shell app-shell--loading">
      <Loader2 className="spin" size={24} />
      <span>Loading deep time</span>
    </main>
  );
}

function AppContent() {
  const [ageMa, setAgeMa] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [engineMode, setEngineMode] = useState<ReconstructionEngine['mode']>('typescript');
  const [rendererMode, setRendererMode] = useState<'WebGPU' | 'WebGL'>('WebGL');
  const [narrationMode, setNarrationMode] = useLocalStorage<NarrationMode>(
    'deep-time:narration-mode',
    'browser',
  );
  const [llmEndpoint, setLlmEndpoint] = useLocalStorage(
    'deep-time:llm-endpoint',
    import.meta.env.VITE_LOCAL_LLM_ENDPOINT || 'http://localhost:11434/api/generate',
  );
  const [llmModel, setLlmModel] = useLocalStorage(
    'deep-time:llm-model',
    import.meta.env.VITE_LOCAL_LLM_MODEL || 'llama3.2',
  );

  const dataQuery = useQuery({
    queryKey: ['tectonics-data', 'v1'],
    queryFn: loadTectonicsData,
  });

  useEffect(() => {
    if (!isPlaying) return undefined;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      setAgeMa((current) => {
        const next = current - elapsed * speed * 18;
        return next <= 0 ? 600 : next;
      });
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying, speed]);

  const activeEvent = useMemo(() => {
    if (!dataQuery.data) return null;
    return findActiveEvent(dataQuery.data.model.events, ageMa);
  }, [ageMa, dataQuery.data]);

  const [narration, setNarration] = useState('Select a point in deep time to hear Earth narrate.');
  const [narrationSource, setNarrationSource] = useState<NarrationMode>('browser');
  const [narrationError, setNarrationError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataQuery.data || !activeEvent) return undefined;

    let cancelled = false;
    const exactAge = Math.round(ageMa);

    void narrateWithOptionalLocalLlm({
      mode: narrationMode,
      event: activeEvent,
      plates: dataQuery.data.model.plates,
      ageMa: exactAge,
      endpoint: llmEndpoint,
      model: llmModel,
    }).then((result) => {
      if (cancelled) return;
      setNarration(result.text);
      setNarrationSource(result.source);
      setNarrationError(result.error ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [activeEvent, ageMa, dataQuery.data, llmEndpoint, llmModel, narrationMode]);

  if (dataQuery.isLoading) {
    return <LoadingPanel />;
  }

  if (dataQuery.isError || !dataQuery.data || !activeEvent) {
    return (
      <main className="app-shell app-shell--error">
        <section className="error-panel" role="alert">
          <p className="eyebrow">Static data unavailable</p>
          <h1>The reconstruction model did not load.</h1>
          <p>{dataQuery.error instanceof Error ? dataQuery.error.message : 'Unknown data error'}</p>
        </section>
      </main>
    );
  }

  const fallbackNarration = deterministicNarration(activeEvent, dataQuery.data.model.plates, ageMa);
  const modelAgeDays = daysSince(dataQuery.data.meta.generatedAt);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Satellite size={24} aria-hidden="true" />
          <div>
            <p className="eyebrow">Plate-Tectonics Deep-Time Visualizer</p>
            <h1>Earth Biography</h1>
          </div>
        </div>
        <nav className="topbar__links" aria-label="Project links">
          <a href={repositoryUrl} target="_blank" rel="noreferrer" className="link-button">
            <Github size={18} />
            <span>Star on GitHub</span>
          </a>
          <a
            href={paypalUrl}
            target="_blank"
            rel="noreferrer"
            className="link-button link-button--warm"
          >
            <HeartHandshake size={18} />
            <span>Support</span>
          </a>
        </nav>
      </header>

      <section className="scene">
        <Suspense
          fallback={
            <div className="globe-canvas globe-canvas--fallback">
              <Loader2 className="spin" size={28} />
            </div>
          }
        >
          <DeepTimeGlobe
            model={dataQuery.data.model}
            ageMa={ageMa}
            activeEvent={activeEvent}
            onEngineModeChange={setEngineMode}
            onRendererModeChange={setRendererMode}
          />
        </Suspense>

        <aside className="story-panel" aria-label="Geologic narration">
          <div>
            <p className="eyebrow">{Math.round(ageMa)} Ma before present</p>
            <h2>{activeEvent.title}</h2>
            <p>{narration || fallbackNarration}</p>
          </div>

          <div className="tags" aria-label="Event tags">
            {activeEvent.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="narrator">
            <div className="narrator__header">
              <Sparkles size={16} />
              <span>Narrator</span>
            </div>
            <div className="segmented segmented--wide" aria-label="Narration engine">
              <button
                type="button"
                className={
                  narrationMode === 'browser'
                    ? 'segmented__item segmented__item--active'
                    : 'segmented__item'
                }
                onClick={() => setNarrationMode('browser')}
              >
                Browser
              </button>
              <button
                type="button"
                className={
                  narrationMode === 'local-llm'
                    ? 'segmented__item segmented__item--active'
                    : 'segmented__item'
                }
                onClick={() => setNarrationMode('local-llm')}
              >
                Local LLM
              </button>
            </div>
            {narrationMode === 'local-llm' ? (
              <div className="llm-fields">
                <input
                  aria-label="Local LLM endpoint"
                  value={llmEndpoint}
                  onChange={(event) => setLlmEndpoint(event.target.value)}
                />
                <input
                  aria-label="Local LLM model"
                  value={llmModel}
                  onChange={(event) => setLlmModel(event.target.value)}
                />
              </div>
            ) : null}
            <p className="narrator__status">
              Source: {narrationSource === 'local-llm' ? 'Local LLM' : 'Browser'}
              {narrationError ? ` (${narrationError})` : ''}
            </p>
          </div>
        </aside>
      </section>

      <TimelineControls
        ageMa={ageMa}
        isPlaying={isPlaying}
        speed={speed}
        onAgeChange={setAgeMa}
        onPlayingChange={setIsPlaying}
        onSpeedChange={setSpeed}
      />

      <footer className="statusbar">
        <span>Renderer: {rendererMode}</span>
        <span>Reconstruction: {engineMode === 'wasm' ? 'WASM' : 'TypeScript fallback'}</span>
        <span>Data v1, updated {modelAgeDays}d ago</span>
        <span>
          v{buildInfo.version} · {buildInfo.commit}
        </span>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
