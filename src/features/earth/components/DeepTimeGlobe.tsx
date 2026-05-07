import { useEffect, useRef } from 'react';
import type { GeoEvent, LonLat, PlateModel, TectonicsData } from '../data/schema';
import { centroid, lonLatToVector3, makeLineGeometry, makePolygonGeometry } from '../lib/geo';
import { createReconstructionEngine, type ReconstructionEngine } from '../lib/reconstruction';

type ThreeModule = typeof import('three');
type Object3D = import('three').Object3D;
type Group = import('three').Group;
type Scene = import('three').Scene;
type PerspectiveCamera = import('three').PerspectiveCamera;

type RendererMode = 'WebGPU' | 'WebGL';

type AnyRenderer = {
  domElement: HTMLCanvasElement;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  setPixelRatio?: (pixelRatio: number) => void;
  render: (scene: Scene, camera: PerspectiveCamera) => void;
  dispose: () => void;
  init?: () => Promise<unknown>;
};

type SceneState = {
  three: ThreeModule;
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: AnyRenderer;
  globeGroup: Group;
  plateGroup: Group;
  mountainGroup: Group;
  engine: ReconstructionEngine;
  dispose: () => void;
};

function disposeObject(three: ThreeModule, object: Object3D): void {
  object.traverse((child) => {
    const mesh = child as Object3D & {
      geometry?: import('three').BufferGeometry;
      material?: import('three').Material | import('three').Material[];
    };

    mesh.geometry?.dispose();

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
    } else {
      mesh.material?.dispose();
    }
  });

  object.children.forEach((child) => object.remove(child));
  void three;
}

function createEarthTexture(three: ThreeModule): import('three').CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas textures are not available');
  }

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#07111f');
  gradient.addColorStop(0.45, '#0f3f54');
  gradient.addColorStop(0.55, '#15586a');
  gradient.addColorStop(1, '#07111f');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.28;
  context.strokeStyle = '#67e8f9';
  context.lineWidth = 1;

  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * canvas.height;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  context.globalAlpha = 0.18;
  context.fillStyle = '#f8fafc';
  for (let index = 0; index < 900; index += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.4;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new three.CanvasTexture(canvas);
  texture.colorSpace = three.SRGBColorSpace;
  return texture;
}

function addStars(three: ThreeModule, scene: Scene): void {
  const vertices: number[] = [];

  for (let index = 0; index < 900; index += 1) {
    const radius = 9 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    vertices.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }

  const geometry = new three.BufferGeometry();
  geometry.setAttribute('position', new three.Float32BufferAttribute(vertices, 3));
  const material = new three.PointsMaterial({ color: '#dbeafe', size: 0.018, transparent: true });
  scene.add(new three.Points(geometry, material));
}

async function createRenderer(
  three: ThreeModule,
  canvas: HTMLCanvasElement,
): Promise<{
  renderer: AnyRenderer;
  mode: RendererMode;
}> {
  if ('gpu' in navigator) {
    try {
      const webgpu = await import('three/webgpu');
      const Renderer = webgpu.WebGPURenderer as unknown as new (parameters: {
        canvas: HTMLCanvasElement;
        antialias: boolean;
        alpha: boolean;
      }) => AnyRenderer;
      const renderer = new Renderer({ canvas, antialias: true, alpha: true });
      await renderer.init?.();
      return { renderer, mode: 'WebGPU' };
    } catch {
      // WebGPU support varies by browser and GPU; WebGL keeps the static app usable.
    }
  }

  const renderer = new three.WebGLRenderer({ canvas, antialias: true, alpha: true });
  return { renderer, mode: 'WebGL' };
}

function reconstructPolygon(
  engine: ReconstructionEngine,
  plate: PlateModel,
  points: LonLat[],
  ageMa: number,
): LonLat[] {
  return points.map((point) => engine.reconstructPoint(point, plate, ageMa));
}

function clearGroup(three: ThreeModule, group: Group): void {
  for (const child of [...group.children]) {
    disposeObject(three, child);
    group.remove(child);
  }
}

function renderPlates(state: SceneState, model: TectonicsData, ageMa: number): void {
  const { three, plateGroup, mountainGroup, engine } = state;
  clearGroup(three, plateGroup);
  clearGroup(three, mountainGroup);

  for (const plate of model.plates) {
    for (const polygon of plate.polygons) {
      const reconstructed = reconstructPolygon(engine, plate, polygon.points, ageMa);
      const geometry = makePolygonGeometry(three, reconstructed, 2.018);
      const material = new three.MeshStandardMaterial({
        color: plate.color,
        roughness: 0.72,
        metalness: 0.05,
        transparent: true,
        opacity: 0.9,
        side: three.DoubleSide,
      });
      const mesh = new three.Mesh(geometry, material);
      mesh.name = `${plate.name}: ${polygon.name}`;
      plateGroup.add(mesh);

      const outline = new three.Line(
        makeLineGeometry(three, reconstructed, 2.031),
        new three.LineBasicMaterial({ color: '#f8fafc', transparent: true, opacity: 0.62 }),
      );
      plateGroup.add(outline);

      const [labelLon, labelLat] = centroid(reconstructed);
      const labelAnchor = lonLatToVector3(three, labelLon, labelLat, 2.06);
      const point = new three.Mesh(
        new three.SphereGeometry(0.018, 10, 10),
        new three.MeshBasicMaterial({ color: '#ffffff' }),
      );
      point.position.copy(labelAnchor);
      plateGroup.add(point);
    }

    for (const belt of plate.mountainBelts) {
      const signal = engine.upliftSignal(ageMa, belt.startMa, belt.endMa, belt.intensity);

      if (signal <= 0.03) continue;

      const reconstructed = reconstructPolygon(engine, plate, belt.points, ageMa);
      const line = new three.Line(
        makeLineGeometry(three, reconstructed, 2.05 + signal * 0.11),
        new three.LineBasicMaterial({
          color: signal > 0.65 ? '#fff7ad' : '#ffb4d6',
          transparent: true,
          opacity: 0.45 + signal * 0.45,
        }),
      );
      line.name = belt.name;
      mountainGroup.add(line);

      for (const [lon, lat] of reconstructed) {
        const marker = new three.Mesh(
          new three.SphereGeometry(0.012 + signal * 0.025, 12, 12),
          new three.MeshBasicMaterial({ color: '#fff7ad', transparent: true, opacity: 0.85 }),
        );
        marker.position.copy(lonLatToVector3(three, lon, lat, 2.075 + signal * 0.08));
        mountainGroup.add(marker);
      }
    }
  }
}

export function DeepTimeGlobe({
  model,
  ageMa,
  activeEvent,
  onEngineModeChange,
  onRendererModeChange,
}: {
  model: TectonicsData;
  ageMa: number;
  activeEvent: GeoEvent;
  onEngineModeChange: (mode: ReconstructionEngine['mode']) => void;
  onRendererModeChange: (mode: RendererMode) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<SceneState | null>(null);
  const ageRef = useRef(ageMa);
  const activeEventRef = useRef(activeEvent);

  useEffect(() => {
    ageRef.current = ageMa;
    const state = stateRef.current;

    if (state) {
      renderPlates(state, model, ageMa);
    }
  }, [ageMa, model]);

  useEffect(() => {
    activeEventRef.current = activeEvent;
  }, [activeEvent]);

  useEffect(() => {
    let disposed = false;
    let animationFrame = 0;
    const cleanupContainer = containerRef.current;

    async function setup() {
      const container = containerRef.current;
      if (!container) return;

      const [three, engine] = await Promise.all([import('three'), createReconstructionEngine()]);
      const scene = new three.Scene();
      const camera = new three.PerspectiveCamera(40, 1, 0.1, 100);
      const canvas = document.createElement('canvas');
      const { renderer, mode } = await createRenderer(three, canvas);

      if (disposed) {
        renderer.dispose();
        return;
      }

      onEngineModeChange(engine.mode);
      onRendererModeChange(mode);

      renderer.setPixelRatio?.(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      container.appendChild(renderer.domElement);

      camera.position.set(0, 0.55, 6.15);
      scene.add(new three.AmbientLight('#9cc8ff', 1.3));

      const sun = new three.DirectionalLight('#ffffff', 2.2);
      sun.position.set(5, 3, 4);
      scene.add(sun);

      addStars(three, scene);

      const globeGroup = new three.Group();
      const plateGroup = new three.Group();
      const mountainGroup = new three.Group();

      const ocean = new three.Mesh(
        new three.SphereGeometry(2, 96, 64),
        new three.MeshStandardMaterial({
          map: createEarthTexture(three),
          color: '#1c5d75',
          roughness: 0.85,
          metalness: 0.02,
        }),
      );
      globeGroup.add(ocean);
      globeGroup.add(plateGroup);
      globeGroup.add(mountainGroup);
      scene.add(globeGroup);

      stateRef.current = {
        three,
        scene,
        camera,
        renderer,
        globeGroup,
        plateGroup,
        mountainGroup,
        engine,
        dispose: () => {
          renderer.dispose();
          disposeObject(three, globeGroup);
        },
      };

      renderPlates(stateRef.current, model, ageRef.current);

      let dragging = false;
      let previousX = 0;
      let previousY = 0;

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        previousX = event.clientX;
        previousY = event.clientY;
        renderer.domElement.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;

        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;
        previousX = event.clientX;
        previousY = event.clientY;
        globeGroup.rotation.y += dx * 0.006;
        globeGroup.rotation.x = Math.max(-0.8, Math.min(0.8, globeGroup.rotation.x + dy * 0.004));
      };

      const onPointerUp = (event: PointerEvent) => {
        dragging = false;
        try {
          renderer.domElement.releasePointerCapture(event.pointerId);
        } catch {
          // The pointer may have left the canvas before release.
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);

      const resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const { width, height } = entry.contentRect;
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      });
      resizeObserver.observe(container);

      const animate = () => {
        const event = activeEventRef.current;
        const targetLon = event.camera[0];
        const targetLat = event.camera[1];
        const targetY = ((targetLon + 20) * Math.PI) / 180;
        const targetX = (targetLat * Math.PI) / 360;
        globeGroup.rotation.y += (targetY - globeGroup.rotation.y) * 0.004 + 0.0012;
        globeGroup.rotation.x += (targetX - globeGroup.rotation.x) * 0.004;
        mountainGroup.rotation.y = Math.sin(performance.now() / 1400) * 0.012;
        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(animate);
      };
      animate();

      const dispose = stateRef.current.dispose;
      stateRef.current.dispose = () => {
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointercancel', onPointerUp);
        dispose();
      };
    }

    void setup();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      stateRef.current?.dispose();
      stateRef.current = null;
      cleanupContainer?.replaceChildren();
    };
  }, [model, onEngineModeChange, onRendererModeChange]);

  return <div ref={containerRef} className="globe-canvas" aria-label="Animated tectonic globe" />;
}
