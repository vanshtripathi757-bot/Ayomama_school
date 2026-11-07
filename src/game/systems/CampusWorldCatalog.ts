import type { Vector3Tuple } from '../../types/game';
import { WorldInteractableDefinition } from './WorldInteractionSystem';

const point = (x: number, y: number, z: number): Vector3Tuple => ({ x, y, z });

/**
 * First-pass catalog for physical objects already present in the academy model.
 * Entries are anchored to the current scene coordinates; add new assets here
 * when their meshes, collision and interaction anchors are implemented.
 */
export const CAMPUS_WORLD_OBJECTS: WorldInteractableDefinition[] = [
  ...[-18.2, -14.2, -10.2].flatMap((x, col) =>
    [-17.2, -15.0, -12.8].map((z, row) => ({
      id: `class-a-seat-${col + 1}-${row + 1}`,
      type: 'seat' as const,
      displayName: `Class A Student Seat ${col + 1}-${row + 1}`,
      position: point(x, 0.23, z + 0.68),
      interactionRange: 1.9,
      actions: [{ id: 'sit' as const, label: 'Sit' }],
      anchor: { position: point(x, 0, z + 0.68), yaw: Math.PI },
      roomId: 'class-a',
      floorId: 'academic-ground',
      priority: 2,
    }))
  ),
  ...[9.8, 14.2, 18.6].map((x, index) => ({
    id: `east-library-shelf-${index + 1}`,
    type: 'bookshelf' as const,
    displayName: `Library Shelf ${index + 1}`,
    position: point(x, 1.1, -21.0),
    interactionRange: 2.5,
    actions: [{ id: 'browse-books' as const, label: 'Browse Books' }],
    roomId: 'east-library',
    floorId: 'academic-ground',
    priority: 3,
  })),
  ...[
    { id: 'courtyard-bench-west', x: -6.5, z: 10 },
    { id: 'courtyard-bench-east', x: 6.5, z: 10 },
    { id: 'courtyard-bench-north', x: 0, z: 3.5 },
    { id: 'courtyard-bench-south', x: 0, z: 16.5 },
  ].map((bench) => ({
    id: bench.id,
    type: 'seat' as const,
    displayName: 'Courtyard Bench',
    position: point(bench.x, 0.35, bench.z),
    interactionRange: 2.2,
    actions: [{ id: 'sit' as const, label: 'Sit' }],
    anchor: { position: point(bench.x, 0, bench.z), yaw: 0 },
    roomId: 'central-courtyard',
    floorId: 'outdoor',
    priority: 1,
  })),
  {
    id: 'main-portico-emblem',
    type: 'landmark',
    displayName: 'Faded Star-and-Chronicle Emblem',
    position: point(0, 5.65, -4.85),
    interactionRange: 3.0,
    actions: [{ id: 'inspect', label: 'Inspect Emblem' }],
    roomId: 'main-entrance',
    floorId: 'outdoor',
    priority: 4,
  },
  {
    id: 'east-library-archive-cabinet',
    type: 'locker',
    displayName: 'Locked Archive Cabinet',
    position: point(21.6, 1.3, -15.8),
    interactionRange: 2.0,
    actions: [{ id: 'inspect', label: 'Inspect Cabinet' }],
    requiredFlags: ['archive-access'],
    roomId: 'east-library',
    floorId: 'academic-ground',
  },
];

export function createCampusWorldInteractionSystem() {
  // Imported lazily at module scope to keep the catalog as plain game data.
  return CAMPUS_WORLD_OBJECTS;
}
