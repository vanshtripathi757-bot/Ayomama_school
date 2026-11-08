import type { Vector3Tuple } from '../../types/game';

export type WorldObjectType =
  | 'seat' | 'desk' | 'bed' | 'bookshelf' | 'book' | 'door'
  | 'computer' | 'notice-board' | 'counter' | 'vending-machine'
  | 'locker' | 'wardrobe' | 'map-board' | 'sports-equipment'
  | 'terminal' | 'water-dispenser' | 'return-station' | 'landmark';

export type WorldActionId =
  | 'sit' | 'stand' | 'study' | 'rest' | 'browse-books' | 'take-book'
  | 'read-book' | 'return-book' | 'open' | 'close' | 'enter'
  | 'use-computer' | 'exit-computer' | 'read' | 'view-menu'
  | 'purchase' | 'collect-tray' | 'return-tray' | 'use'
  | 'inspect' | 'store' | 'change-outfit' | 'view-map'
  | 'collect' | 'start-activity' | 'talk';

export interface WorldInteractionAction {
  id: WorldActionId;
  label: string;
  icon?: string;
  enabled?: boolean;
  reason?: string;
  requiredFlag?: string;
  cooldownMs?: number;
}

export interface WorldInteractionAnchor {
  position: Vector3Tuple;
  yaw: number;
  approachRadius?: number;
}

export interface WorldInteractableDefinition {
  id: string;
  type: WorldObjectType;
  displayName: string;
  position: Vector3Tuple;
  interactionRange: number;
  actions: WorldInteractionAction[];
  anchor?: WorldInteractionAnchor;
  requiredFlags?: string[];
  roomId?: string;
  floorId?: string;
  persistent?: boolean;
  priority?: number;
}

export interface PlayerTargetPose {
  position: Vector3Tuple;
  yaw: number;
}

export interface InteractionCandidate {
  object: WorldInteractableDefinition;
  distance: number;
  facingScore: number;
}

export type WorldInteractionState =
  | { status: 'idle' }
  | { status: 'targeting'; objectId: string; actionId: WorldActionId }
  | { status: 'active'; objectId: string; actionId: WorldActionId; startedAt: number }
  | { status: 'exiting'; objectId: string; actionId: WorldActionId };

export interface InteractionQuery {
  player: PlayerTargetPose;
  flags?: ReadonlySet<string>;
  isOccluded?: (from: Vector3Tuple, to: Vector3Tuple, targetId: string) => boolean;
  now?: number;
}

const distance3 = (a: Vector3Tuple, b: Vector3Tuple): number =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const normalizeAngle = (angle: number): number =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

/**
 * Shared player/NPC interaction registry. It owns stable target selection,
 * availability checks, cooldowns and the interaction lifecycle; rendering,
 * raycasting and animation remain adapters owned by the scene.
 */
export class WorldInteractionSystem {
  private readonly definitions = new Map<string, WorldInteractableDefinition>();
  private readonly cooldowns = new Map<string, number>();
  private selectedId: string | null = null;
  private currentState: WorldInteractionState = { status: 'idle' };

  register(definition: WorldInteractableDefinition): void {
    if (!definition.id.trim()) throw new Error('World interactable id is required');
    if (this.definitions.has(definition.id)) {
      throw new Error('Duplicate world interactable id: ' + definition.id);
    }
    if (definition.interactionRange <= 0) {
      throw new Error('Interaction range must be greater than zero: ' + definition.id);
    }
    this.definitions.set(definition.id, definition);
  }

  unregister(id: string): void {
    this.definitions.delete(id);
    if (this.selectedId === id) this.selectedId = null;
    if (this.currentState.status !== 'idle' && this.currentState.objectId === id) {
      this.currentState = { status: 'idle' };
    }
  }

  get(id: string): WorldInteractableDefinition | null {
    return this.definitions.get(id) ?? null;
  }

  getAll(): WorldInteractableDefinition[] {
    return [...this.definitions.values()];
  }

  getState(): WorldInteractionState {
    return this.currentState;
  }

  getSelected(): WorldInteractableDefinition | null {
    return this.selectedId ? this.get(this.selectedId) : null;
  }

  getAvailableActions(id: string, flags: ReadonlySet<string> = new Set(), now = Date.now()): WorldInteractionAction[] {
    const object = this.get(id);
    if (!object) return [];
    if (object.requiredFlags?.some((flag) => !flags.has(flag))) return [];
    return object.actions.filter((action) => {
      if (action.enabled === false) return false;
      if (action.requiredFlag && !flags.has(action.requiredFlag)) return false;
      const cooldownKey = id + ':' + action.id;
      return (this.cooldowns.get(cooldownKey) ?? 0) <= now;
    });
  }

  findTarget(query: InteractionQuery): InteractionCandidate | null {
    const now = query.now ?? Date.now();
    const candidates: InteractionCandidate[] = [];
    const { x: px, z: pz } = query.player.position;

    for (const object of this.definitions.values()) {
      if (object.requiredFlags?.some((flag) => !query.flags?.has(flag))) continue;
      const distance = distance3(query.player.position, object.position);
      if (distance > object.interactionRange) continue;
      if (this.getAvailableActions(object.id, query.flags, now).length === 0) continue;
      if (query.isOccluded?.(query.player.position, object.position, object.id)) continue;

      const dx = object.position.x - px;
      const dz = object.position.z - pz;
      const targetYaw = Math.atan2(dx, dz);
      const angleDelta = Math.abs(normalizeAngle(targetYaw - query.player.yaw));
      const facingScore = 1 - Math.min(angleDelta / Math.PI, 1);
      candidates.push({ object, distance, facingScore });
    }

    candidates.sort((a, b) => {
      const aScore = (a.object.priority ?? 0) * 2 + a.facingScore * 1.5 - a.distance * 0.08;
      const bScore = (b.object.priority ?? 0) * 2 + b.facingScore * 1.5 - b.distance * 0.08;
      return bScore - aScore;
    });

    const best = candidates[0] ?? null;
    const current = this.selectedId ? candidates.find((item) => item.object.id === this.selectedId) : null;
    // Small hysteresis prevents prompts rapidly switching between adjacent objects.
    if (current && best && current.object.id !== best.object.id && best.distance > current.distance - 0.65) {
      this.selectedId = current.object.id;
      return current;
    }
    this.selectedId = best?.object.id ?? null;
    return best;
  }

  begin(objectId: string, actionId: WorldActionId, flags: ReadonlySet<string> = new Set(), now = Date.now()): boolean {
    if (this.currentState.status !== 'idle' && this.currentState.status !== 'targeting') return false;
    const action = this.getAvailableActions(objectId, flags, now).find((item) => item.id === actionId);
    if (!action) return false;
    this.currentState = { status: 'active', objectId, actionId, startedAt: now };
    return true;
  }

  complete(now = Date.now()): boolean {
    if (this.currentState.status !== 'active') return false;
    const { objectId, actionId } = this.currentState;
    const action = this.get(objectId)?.actions.find((item) => item.id === actionId);
    if (action?.cooldownMs) this.cooldowns.set(objectId + ':' + actionId, now + action.cooldownMs);
    return true;
  }

  exit(): boolean {
    if (this.currentState.status === 'idle') return false;
    this.currentState = { status: 'idle' };
    return true;
  }

  clearSelection(): void {
    this.selectedId = null;
  }
}
