import { describe, expect, it } from 'vitest';
import type { GeoEvent, PlateModel } from '../earth/data/schema';
import { deterministicNarration } from './narrator';

const event: GeoEvent = {
  ageMa: 55,
  title: 'Himalaya begins rising',
  body: 'India collides with Eurasia.',
  camera: [82, 30],
  tags: ['himalaya'],
};

const plate: PlateModel = {
  id: 'india',
  name: 'India',
  color: '#fff',
  presentCentroid: [79, 20],
  trajectory: [
    { ageMa: 0, lonOffset: 0, latOffset: 0, rotationDeg: 0 },
    { ageMa: 100, lonOffset: 0, latOffset: -40, rotationDeg: 12 },
  ],
  polygons: [
    {
      name: 'India',
      points: [
        [70, 10],
        [90, 10],
        [80, 20],
      ],
    },
  ],
  mountainBelts: [
    {
      name: 'Himalayan uplift',
      startMa: 60,
      endMa: 0,
      points: [
        [72, 33],
        [82, 31],
      ],
      intensity: 1,
    },
  ],
};

describe('deterministicNarration', () => {
  it('includes active mountain context when relevant', () => {
    expect(deterministicNarration(event, [plate], 55)).toContain('himalayan uplift');
  });
});
