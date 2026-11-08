import type { Object3D } from 'three';

export interface StreamRegionCenter {
  x: number;
  z: number;
}

export interface StreamRegionBudget {
  loadRadius: number;
  unloadRadius: number;
}

export const STREAM_REGION_BUDGETS: Record<string, StreamRegionBudget> = {
  dormitory: { loadRadius: 58, unloadRadius: 72 },
  residential: { loadRadius: 62, unloadRadius: 78 },
  'medical-room': { loadRadius: 38, unloadRadius: 52 },
  commercial: { loadRadius: 68, unloadRadius: 82 },
  station: { loadRadius: 76, unloadRadius: 94 },
  aquatics: { loadRadius: 58, unloadRadius: 72 },
  observatory: { loadRadius: 58, unloadRadius: 72 },
  'koi-garden': { loadRadius: 58, unloadRadius: 72 },
  festival: { loadRadius: 58, unloadRadius: 72 },
  'mountain-shrine': { loadRadius: 68, unloadRadius: 84 },
  'science-lab': { loadRadius: 72, unloadRadius: 88 },
  'computer-lab': { loadRadius: 72, unloadRadius: 88 },
  auditorium: { loadRadius: 68, unloadRadius: 84 },
};

export function shouldRegionBeLoaded(
  distance: number,
  currentlyLoaded: boolean,
  budget: StreamRegionBudget
): boolean {
  if (!Number.isFinite(distance) || distance < 0) return currentlyLoaded;
  return currentlyLoaded
    ? distance <= budget.unloadRadius
    : distance <= budget.loadRadius;
}

function inferRegionId(x: number, z: number): string | null {
  if (z > 82) return 'station';
  if (z > 48 && Math.abs(x) >= 38) return 'residential';
  if (z > 48 && Math.abs(x) > 15 && Math.abs(x) < 38) return 'commercial';
  if (x > 50 && z > -5 && z < 25) return 'aquatics';
  if (x > 50 && z <= -5 && z > -55) return 'observatory';
  if (x < -55 && z > -5 && z < 25) return 'koi-garden';
  if (x < -55 && z <= -5 && z > -55) return 'festival';
  if (z < -55) return 'mountain-shrine';
  return null;
}

/**
 * Toggles tagged region roots and major environment meshes. Hysteresis prevents
 * visible popping around region boundaries; updates are throttled by the scene.
 */
export function updateWorldStreaming(
  roots: Object3D[],
  playerX: number,
  playerZ: number
): void {
  for (const root of roots) {
    const candidates = [root, ...root.children];
    for (const object of candidates) {
      const explicitId = object.userData.streamRegionId;
      const center = object.userData.streamCenter as StreamRegionCenter | undefined;
      const regionId = typeof explicitId === 'string'
        ? explicitId
        : inferRegionId(object.position.x, object.position.z);
      if (!regionId) continue;
      const budget = STREAM_REGION_BUDGETS[regionId];
      if (!budget) continue;
      const target = center ?? object.position;
      const distance = Math.hypot(playerX - target.x, playerZ - target.z);
      const wasInitialized = object.userData.streamInitialized === true;
      const currentlyLoaded = wasInitialized ? object.visible : false;
      object.visible = shouldRegionBeLoaded(distance, currentlyLoaded, budget);
      object.userData.streamInitialized = true;
    }
  }
}
