import type { LonLat } from '../data/schema';

export function lonLatToVector3(
  three: typeof import('three'),
  lon: number,
  lat: number,
  radius: number,
): import('three').Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new three.Vector3(x, y, z);
}

export function centroid(points: LonLat[]): LonLat {
  const [lonTotal, latTotal] = points.reduce(
    ([lonSum, latSum], [lon, lat]) => [lonSum + lon, latSum + lat],
    [0, 0],
  );

  return [lonTotal / points.length, latTotal / points.length];
}

export function makePolygonGeometry(
  three: typeof import('three'),
  points: LonLat[],
  radius: number,
): import('three').BufferGeometry {
  const center = centroid(points);
  const vertices: number[] = [];

  for (let index = 0; index < points.length; index += 1) {
    const first = points[index];
    const second = points[(index + 1) % points.length];

    if (!first || !second) continue;

    const triangle = [center, first, second];

    for (const [lon, lat] of triangle) {
      const vector = lonLatToVector3(three, lon, lat, radius);
      vertices.push(vector.x, vector.y, vector.z);
    }
  }

  const geometry = new three.BufferGeometry();
  geometry.setAttribute('position', new three.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function makeLineGeometry(
  three: typeof import('three'),
  points: LonLat[],
  radius: number,
): import('three').BufferGeometry {
  const closed = [...points, points[0]].filter((point): point is LonLat => Boolean(point));
  const vectors = closed.map(([lon, lat]) => lonLatToVector3(three, lon, lat, radius));
  return new three.BufferGeometry().setFromPoints(vectors);
}
