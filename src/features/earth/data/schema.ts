import { z } from 'zod';

const lonLat = z.tuple([z.number(), z.number()]);

export const tectonicsSchema = z.object({
  schemaVersion: z.literal('tectonics.v1'),
  timespanMa: z.object({
    min: z.number(),
    max: z.number(),
  }),
  plates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      presentCentroid: lonLat,
      trajectory: z
        .array(
          z.object({
            ageMa: z.number(),
            lonOffset: z.number(),
            latOffset: z.number(),
            rotationDeg: z.number(),
          }),
        )
        .min(2),
      polygons: z.array(
        z.object({
          name: z.string(),
          points: z.array(lonLat).min(3),
        }),
      ),
      mountainBelts: z.array(
        z.object({
          name: z.string(),
          startMa: z.number(),
          endMa: z.number(),
          points: z.array(lonLat).min(2),
          intensity: z.number(),
        }),
      ),
    }),
  ),
  events: z.array(
    z.object({
      ageMa: z.number(),
      title: z.string(),
      body: z.string(),
      camera: lonLat,
      tags: z.array(z.string()),
    }),
  ),
});

export const dataMetaSchema = z.object({
  schemaVersion: z.literal('tectonics.v1'),
  generatedAt: z.string(),
  source: z.string(),
  sourceCommit: z.string(),
  inputChecksums: z.record(z.string(), z.string()),
  notes: z.string(),
});

export type TectonicsData = z.infer<typeof tectonicsSchema>;
export type PlateModel = TectonicsData['plates'][number];
export type PlateTrajectoryPoint = PlateModel['trajectory'][number];
export type MountainBelt = PlateModel['mountainBelts'][number];
export type GeoEvent = TectonicsData['events'][number];
export type TectonicsMeta = z.infer<typeof dataMetaSchema>;
export type LonLat = z.infer<typeof lonLat>;
