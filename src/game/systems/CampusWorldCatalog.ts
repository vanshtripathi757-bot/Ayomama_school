import type { Vector3Tuple } from '../../types/game';
import { WorldInteractionSystem, WorldInteractableDefinition } from './WorldInteractionSystem';

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
      anchor: { position: point(x, 0, z + 1.2), yaw: Math.PI },
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
    { id: 'courtyard-bench-west', x: -6.5, z: 10, anchorX: -8.0, anchorZ: 10, yaw: Math.PI / 2 },
    { id: 'courtyard-bench-east', x: 6.5, z: 10, anchorX: 8.0, anchorZ: 10, yaw: -Math.PI / 2 },
    { id: 'courtyard-bench-north', x: 0, z: 3.5, anchorX: 0, anchorZ: 2.3, yaw: 0 },
    { id: 'courtyard-bench-south', x: 0, z: 16.5, anchorX: 0, anchorZ: 17.8, yaw: Math.PI },
  ].map((bench) => ({
    id: bench.id,
    type: 'seat' as const,
    displayName: 'Courtyard Bench',
    position: point(bench.x, 0.35, bench.z),
    interactionRange: 2.2,
    actions: [{ id: 'sit' as const, label: 'Sit' }],
    anchor: { position: point(bench.anchorX, 0, bench.anchorZ), yaw: bench.yaw },
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
    id: 'town-manga-shop-counter',
    type: 'counter',
    displayName: 'Hoshino Manga & Books Shop',
    position: point(-17.5, 1.0, 62),
    interactionRange: 2.8,
    actions: [{ id: 'view-menu', label: 'Browse Shop' }],
    roomId: 'town-commercial',
    floorId: 'street-level',
    priority: 2,
  },
  {
    id: 'town-konbini-counter',
    type: 'counter',
    displayName: 'Hoshino Konbini Mart',
    position: point(17.5, 1.0, 62),
    interactionRange: 2.8,
    actions: [{ id: 'view-menu', label: 'Browse Shop' }],
    roomId: 'town-commercial',
    floorId: 'street-level',
    priority: 2,
  },
  {
    id: 'dormitory-main-entry',
    type: 'door',
    displayName: 'Student Dormitory Entrance',
    position: point(-45, 1.2, -24.8),
    interactionRange: 2.8,
    actions: [{ id: 'enter', label: 'Enter Dormitory' }],
    roomId: 'dormitory-ground',
    floorId: 'ground-floor',
    priority: 3,
  },
  {
    id: 'dormitory-bed-west',
    type: 'bed',
    displayName: 'Dormitory Bed',
    position: point(-50.4, 0.8, -36.2),
    interactionRange: 3.8,
    actions: [{ id: 'rest', label: 'Rest' }],
    anchor: { position: point(-50.4, 0, -32.8), yaw: Math.PI },
    roomId: 'dormitory-ground',
    floorId: 'ground-floor',
  },
  {
    id: 'dormitory-wardrobe',
    type: 'wardrobe',
    displayName: 'Dormitory Wardrobe',
    position: point(-40.0, 1.2, -29.0),
    interactionRange: 2.0,
    actions: [{ id: 'change-outfit', label: 'Change Outfit' }],
    roomId: 'dormitory-ground',
    floorId: 'ground-floor',
  },
  {
    id: 'medical-room-reception',
    type: 'counter',
    displayName: 'Medical Room Reception',
    position: point(34, 0.9, -22.75),
    interactionRange: 2.6,
    actions: [
      { id: 'inspect', label: 'Check In' },
      { id: 'use', label: 'Ask for Medical Assistance', cooldownMs: 3000 },
    ],
    roomId: 'medical-room',
    floorId: 'medical-ground',
    priority: 4,
  },
  {
    id: 'medical-room-bed-1',
    type: 'bed',
    displayName: 'Medical Rest Bed',
    position: point(31.2, 0.9, -28.8),
    interactionRange: 3.6,
    actions: [{ id: 'rest', label: 'Rest' }],
    anchor: { position: point(31.2, 0, -32.0), yaw: 0 },
    roomId: 'medical-room',
    floorId: 'medical-ground',
  },
  {
    id: 'medical-room-bed-2',
    type: 'bed',
    displayName: 'Medical Rest Bed',
    position: point(36.8, 0.9, -28.8),
    interactionRange: 3.6,
    actions: [{ id: 'rest', label: 'Rest' }],
    anchor: { position: point(36.8, 0, -32.0), yaw: 0 },
    roomId: 'medical-room',
    floorId: 'medical-ground',
  },
  {
    id: 'station-ticket-terminal',
    type: 'terminal',
    displayName: 'Hoshino Railway Ticket Terminal',
    position: point(0, 1.2, 90.8),
    interactionRange: 3.0,
    actions: [{ id: 'use', label: 'View Train Destinations' }],
    roomId: 'station-platform',
    floorId: 'outdoor',
    priority: 3,
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

export function createCampusWorldInteractionSystem(): WorldInteractionSystem {
  const system = new WorldInteractionSystem();
  for (const object of CAMPUS_WORLD_OBJECTS) system.register(object);
  return system;
}
