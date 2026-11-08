import type { Vector3Tuple } from '../../types/game';

export interface TransitDestination {
  id: string;
  label: string;
  description: string;
  position: Vector3Tuple;
  yaw: number;
}

export const TRANSIT_DESTINATIONS: TransitDestination[] = [
  { id: 'academy-courtyard', label: 'Academy Courtyard', description: 'Return to the central fountain and main hall.', position: { x: 0, y: 0, z: 18 }, yaw: Math.PI },
  { id: 'student-dormitory', label: 'Student Dormitory', description: 'Visit the resident common room.', position: { x: -45, y: 0, z: -23.5 }, yaw: Math.PI },
  { id: 'town-shopping-street', label: 'Town Shopping Street', description: 'Explore the manga shop and konbini plaza.', position: { x: 0, y: 0, z: 48 }, yaw: Math.PI },
  { id: 'east-aquatics', label: 'East Aquatics', description: 'Arrive at the swimming pool promenade.', position: { x: 50, y: 0, z: 8 }, yaw: -Math.PI / 2 },
  { id: 'research-observatory', label: 'Research Observatory', description: 'Explore the science centre and observatory.', position: { x: 50, y: 0, z: -26 }, yaw: -Math.PI / 2 },
  { id: 'west-koi-garden', label: 'West Koi Garden', description: 'Walk the garden path and vermilion bridge.', position: { x: -52, y: 0, z: 8 }, yaw: Math.PI / 2 },
  { id: 'festival-amphitheatre', label: 'Festival Amphitheatre', description: 'Visit the outdoor performance stage.', position: { x: -52, y: 0, z: -26 }, yaw: Math.PI / 2 },
  { id: 'mountain-shrine', label: 'Mountain Shrine', description: 'Follow the northern shrine approach.', position: { x: 0, y: 0, z: -70 }, yaw: 0 },
];

export function getTransitDestination(id: string): TransitDestination | null {
  return TRANSIT_DESTINATIONS.find((destination) => destination.id === id) ?? null;
}

export function isValidTransitPosition(position: Vector3Tuple): boolean {
  return [position.x, position.y, position.z].every(Number.isFinite) && position.y >= 0;
}
