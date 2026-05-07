import type { LonLat, PlateModel, PlateTrajectoryPoint } from '../data/schema';

type WasmExports = {
  reconstruct_lon: (
    lon: number,
    lat: number,
    centerLon: number,
    centerLat: number,
    ageMa: number,
    lonOffset: number,
    latOffset: number,
    rotationDeg: number,
  ) => number;
  reconstruct_lat: (
    lon: number,
    lat: number,
    centerLon: number,
    centerLat: number,
    ageMa: number,
    lonOffset: number,
    latOffset: number,
    rotationDeg: number,
  ) => number;
  uplift_signal: (ageMa: number, startMa: number, endMa: number, intensity: number) => number;
};

export type ReconstructionEngine = {
  mode: 'wasm' | 'typescript';
  reconstructPoint: (point: LonLat, plate: PlateModel, ageMa: number) => LonLat;
  upliftSignal: (ageMa: number, startMa: number, endMa: number, intensity: number) => number;
};

function normalizeLon(lon: number): number {
  if (lon > 180) return lon - 360;
  if (lon < -180) return lon + 360;
  return lon;
}

function clampLat(lat: number): number {
  return Math.max(-82, Math.min(82, lat));
}

function radians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function interpolateTrajectory(
  trajectory: PlateTrajectoryPoint[],
  ageMa: number,
): PlateTrajectoryPoint {
  const sorted = [...trajectory].sort((a, b) => a.ageMa - b.ageMa);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (!first || !last) {
    throw new Error('Plate trajectory is empty');
  }

  if (ageMa <= first.ageMa) return first;
  if (ageMa >= last.ageMa) return last;

  const upperIndex = sorted.findIndex((point) => point.ageMa >= ageMa);
  const upper = sorted[upperIndex];
  const lower = sorted[upperIndex - 1];

  if (!upper || !lower) return last;

  const span = upper.ageMa - lower.ageMa;
  const t = span === 0 ? 0 : (ageMa - lower.ageMa) / span;

  return {
    ageMa,
    lonOffset: lower.lonOffset + (upper.lonOffset - lower.lonOffset) * t,
    latOffset: lower.latOffset + (upper.latOffset - lower.latOffset) * t,
    rotationDeg: lower.rotationDeg + (upper.rotationDeg - lower.rotationDeg) * t,
  };
}

function reconstructWithTypescript(point: LonLat, plate: PlateModel, ageMa: number): LonLat {
  const [lon, lat] = point;
  const [centerLon, centerLat] = plate.presentCentroid;
  const trajectory = interpolateTrajectory(plate.trajectory, ageMa);
  const reconstructedLon = normalizeLon(
    lon +
      trajectory.lonOffset +
      Math.sin(radians(lat - centerLat + ageMa * 0.8)) * trajectory.rotationDeg * 0.18,
  );
  const reconstructedLat = clampLat(
    lat +
      trajectory.latOffset +
      Math.cos(radians(lon - centerLon - ageMa * 0.5)) * trajectory.rotationDeg * 0.12,
  );

  return [reconstructedLon, reconstructedLat];
}

function upliftSignalTypescript(
  ageMa: number,
  startMa: number,
  endMa: number,
  intensity: number,
): number {
  if (ageMa > startMa || ageMa < endMa || startMa <= endMa) {
    return 0;
  }

  const midpoint = (startMa + endMa) / 2;
  const halfSpan = (startMa - endMa) / 2;
  return intensity * (1 - Math.abs(ageMa - midpoint) / halfSpan);
}

export async function createReconstructionEngine(): Promise<ReconstructionEngine> {
  try {
    const wasmUrl = `${import.meta.env.BASE_URL}wasm/reconstruction.wasm`;
    const response = await fetch(wasmUrl);

    if (!response.ok) {
      throw new Error(`WASM reconstruction core failed to load (${response.status})`);
    }

    const instance = await WebAssembly.instantiateStreaming(response, {
      env: {
        sin: Math.sin,
        cos: Math.cos,
        abs: Math.abs,
      },
    });
    const exports = instance.instance.exports as unknown as WasmExports;

    return {
      mode: 'wasm',
      reconstructPoint(point, plate, ageMa) {
        const [lon, lat] = point;
        const [centerLon, centerLat] = plate.presentCentroid;
        const trajectory = interpolateTrajectory(plate.trajectory, ageMa);

        return [
          exports.reconstruct_lon(
            lon,
            lat,
            centerLon,
            centerLat,
            ageMa,
            trajectory.lonOffset,
            trajectory.latOffset,
            trajectory.rotationDeg,
          ),
          exports.reconstruct_lat(
            lon,
            lat,
            centerLon,
            centerLat,
            ageMa,
            trajectory.lonOffset,
            trajectory.latOffset,
            trajectory.rotationDeg,
          ),
        ];
      },
      upliftSignal: exports.uplift_signal,
    };
  } catch (error) {
    console.info('Using TypeScript reconstruction fallback', error);
    return {
      mode: 'typescript',
      reconstructPoint: reconstructWithTypescript,
      upliftSignal: upliftSignalTypescript,
    };
  }
}

export function nearestEventAge(ages: number[], currentAge: number): number {
  return ages.reduce((nearest, candidate) =>
    Math.abs(candidate - currentAge) < Math.abs(nearest - currentAge) ? candidate : nearest,
  );
}
