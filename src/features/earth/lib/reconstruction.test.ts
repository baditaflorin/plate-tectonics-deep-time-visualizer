import { describe, expect, it } from 'vitest';
import { nearestEventAge } from './reconstruction';

describe('nearestEventAge', () => {
  it('selects the closest event on the deep-time slider', () => {
    expect(nearestEventAge([0, 55, 100, 300, 600], 53)).toBe(55);
    expect(nearestEventAge([0, 55, 100, 300, 600], 280)).toBe(300);
  });
});
