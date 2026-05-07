import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

const presets = [600, 300, 200, 100, 55, 0] as const;
const speeds = [0.25, 0.5, 1, 2] as const;

export function TimelineControls({
  ageMa,
  isPlaying,
  speed,
  onAgeChange,
  onPlayingChange,
  onSpeedChange,
}: {
  ageMa: number;
  isPlaying: boolean;
  speed: number;
  onAgeChange: (ageMa: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  onSpeedChange: (speed: number) => void;
}) {
  const move = (delta: number) => onAgeChange(Math.max(0, Math.min(600, ageMa + delta)));

  return (
    <section className="timeline" aria-label="Deep-time controls">
      <div className="timeline__top">
        <button
          type="button"
          className="icon-button"
          onClick={() => onPlayingChange(!isPlaying)}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => move(10)}
          title="Older"
          aria-label="Move 10 million years older"
        >
          <SkipBack size={18} />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => move(-10)}
          title="Newer"
          aria-label="Move 10 million years newer"
        >
          <SkipForward size={18} />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => onAgeChange(300)}
          title="Reset to Pangaea"
          aria-label="Reset to Pangaea"
        >
          <RotateCcw size={18} />
        </button>
        <div className="timeline__readout" aria-live="polite">
          <strong>{Math.round(ageMa)}</strong>
          <span>Ma</span>
        </div>
      </div>

      <input
        className="time-slider"
        type="range"
        min="0"
        max="600"
        step="1"
        value={ageMa}
        aria-label="Millions of years before present"
        onChange={(event) => onAgeChange(Number(event.target.value))}
      />

      <div className="timeline__bands">
        <span>Present</span>
        <span>Pangaea</span>
        <span>600 Ma</span>
      </div>

      <div className="timeline__presets" aria-label="Timeline presets">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={Math.round(ageMa) === preset ? 'chip chip--active' : 'chip'}
            onClick={() => onAgeChange(preset)}
          >
            {preset} Ma
          </button>
        ))}
      </div>

      <div className="segmented" aria-label="Playback speed">
        {speeds.map((candidate) => (
          <button
            key={candidate}
            type="button"
            className={
              speed === candidate ? 'segmented__item segmented__item--active' : 'segmented__item'
            }
            onClick={() => onSpeedChange(candidate)}
          >
            {candidate}x
          </button>
        ))}
      </div>
    </section>
  );
}
