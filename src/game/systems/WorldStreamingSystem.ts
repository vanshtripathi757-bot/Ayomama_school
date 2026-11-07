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

/**
 * Toggles only explicitly tagged region roots. Hysteresis prevents visible
 * popping when the player moves around a region boundary.
 */
export function updateWorldStreaming(
  roots: Object3D[],
  playerX: number,
  playerZ: number
): void {
  for (const root of roots) {
    root.traverse((object) => {
      const regionId = object.userData.streamRegionId;
      if (typeof regionId !== 'string') return;
      const center = object.userData.streamCenter as StreamRegionCenter | undefined;
      const budget = STREAM_REGION_BUDGETS[regionId];
      if (!center || !budget) return;
      const distance = Math.hypot(playerX - center.x, playerZ - center.z);
      object.visible = shouldRegionBeLoaded(distance, object.visible, budget);
    });
  }
}
