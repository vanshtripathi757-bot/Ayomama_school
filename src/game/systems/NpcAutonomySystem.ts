import type { NPCRelationshipState, TimeOfDayPreset, Vector3Tuple } from '../../types/game';

export type NpcActivityKind = 'teaching' | 'reading' | 'socializing' | 'club-work' | 'sports' | 'resting' | 'administration';
export type NpcAnimationIntent = 'idle' | 'reading' | 'working' | 'sitting' | 'teaching';

export interface NpcActivityAnchor {
  id: string;
  label: string;
  position: Vector3Tuple;
  kind: NpcActivityKind;
}

export interface NpcDailyDirective {
  npcId: string;
  period: TimeOfDayPreset;
  anchor: NpcActivityAnchor;
  activity: string;
  animation: NpcAnimationIntent;
}

/** Stable, low-cost anchors used by NPCs to visibly use nearby campus facilities. */
export const NPC_ACTIVITY_ANCHORS: NpcActivityAnchor[] = [
  { id: 'courtyard-fountain', label: 'Courtyard Fountain', position: { x: -7.5, y: 0, z: 5.5 }, kind: 'socializing' },
  { id: 'library-east-shelf', label: 'East Library Shelves', position: { x: 9.5, y: 0, z: -19.5 }, kind: 'reading' },
  { id: 'class-a-teacher-desk', label: 'Class A Teacher Desk', position: { x: -12.2, y: 0, z: -18.4 }, kind: 'teaching' },
  { id: 'west-cafeteria', label: 'West Cafeteria Pavilion', position: { x: -24.5, y: 0, z: 8 }, kind: 'resting' },
  { id: 'east-sports-court', label: 'East Sports Court', position: { x: 25, y: 0, z: 8.5 }, kind: 'sports' },
  { id: 'dormitory-common-room', label: 'Dormitory Common Room', position: { x: -45, y: 0, z: -30.5 }, kind: 'socializing' },
  { id: 'town-station-plaza', label: 'Hoshino Station Plaza', position: { x: 0, y: 0, z: 88.5 }, kind: 'socializing' },
  { id: 'east-aquatics-deck', label: 'East Aquatics Deck', position: { x: 55.5, y: 0, z: 18 }, kind: 'sports' },
  { id: 'research-centre', label: 'Research Centre', position: { x: 54, y: 0, z: -26 }, kind: 'reading' },
  { id: 'west-koi-garden', label: 'West Koi Garden', position: { x: -66, y: 0, z: 8 }, kind: 'socializing' },
  { id: 'festival-amphitheatre', label: 'Festival Amphitheatre', position: { x: -66, y: 0, z: -26 }, kind: 'club-work' },
];

const ANCHORS = Object.fromEntries(NPC_ACTIVITY_ANCHORS.map((anchor) => [anchor.id, anchor])) as Record<string, NpcActivityAnchor>;

type ScheduleRow = { anchor: keyof typeof ANCHORS; activity: string; animation: NpcAnimationIntent };
type DailySchedule = Partial<Record<TimeOfDayPreset, ScheduleRow>>;

/**
 * Schedules deliberately use existing traversable campus landmarks as destinations.
 * Each NPC remains assigned to one meaningful activity during a time block, rather than
 * randomly switching destinations every rendered frame.
 */
export const NPC_DAILY_SCHEDULES: Record<string, DailySchedule> = {
  npc_hana: {
    morning: { anchor: 'courtyard-fountain', activity: 'Welcoming students at the courtyard fountain', animation: 'working' },
    golden_hour: { anchor: 'courtyard-fountain', activity: 'Helping students with after-school orientation', animation: 'working' },
    twilight: { anchor: 'library-east-shelf', activity: 'Reading archive records in the library', animation: 'reading' },
  },
  npc_kaito: {
    morning: { anchor: 'courtyard-fountain', activity: 'Meeting the student festival committee', animation: 'working' },
    golden_hour: { anchor: 'courtyard-fountain', activity: 'Planning the cultural festival with classmates', animation: 'working' },
    twilight: { anchor: 'courtyard-fountain', activity: 'Chatting with classmates after club activities', animation: 'idle' },
  },
  npc_takeda: {
    morning: { anchor: 'class-a-teacher-desk', activity: 'Teaching and preparing the Class A lesson', animation: 'teaching' },
    golden_hour: { anchor: 'class-a-teacher-desk', activity: 'Reviewing student assignments', animation: 'working' },
    twilight: { anchor: 'library-east-shelf', activity: 'Researching academy history', animation: 'reading' },
  },
  npc_akari: {
    morning: { anchor: 'library-east-shelf', activity: 'Organizing library books', animation: 'working' },
    golden_hour: { anchor: 'east-sports-court', activity: 'Helping with after-school sports practice', animation: 'working' },
    twilight: { anchor: 'library-east-shelf', activity: 'Studying quietly in the library', animation: 'reading' },
  },
  npc_aoi: {
    morning: { anchor: 'class-a-teacher-desk', activity: 'Working on class notes', animation: 'working' },
    golden_hour: { anchor: 'east-sports-court', activity: 'Attending an after-school club session', animation: 'working' },
    twilight: { anchor: 'library-east-shelf', activity: 'Reading in the library', animation: 'reading' },
  },
  npc_daichi: {
    morning: { anchor: 'east-sports-court', activity: 'Setting up sports practice', animation: 'working' },
    golden_hour: { anchor: 'east-sports-court', activity: 'Practising with the athletics club', animation: 'working' },
    twilight: { anchor: 'west-cafeteria', activity: 'Taking a break after practice', animation: 'sitting' },
  },
  npc_ren: {
    morning: { anchor: 'courtyard-fountain', activity: 'Talking with classmates between lessons', animation: 'idle' },
    golden_hour: { anchor: 'east-sports-court', activity: 'Training with the sports club', animation: 'working' },
    twilight: { anchor: 'library-east-shelf', activity: 'Studying academy records', animation: 'reading' },
  },
  npc_haruto: {
    morning: { anchor: 'town-station-plaza', activity: 'Checking the station timetable', animation: 'working' },
    golden_hour: { anchor: 'town-station-plaza', activity: 'Waiting near the station plaza', animation: 'idle' },
    twilight: { anchor: 'town-station-plaza', activity: 'Heading home from the academy', animation: 'idle' },
  },
  npc_sora: {
    morning: { anchor: 'east-aquatics-deck', activity: 'Preparing for the aquatics club session', animation: 'working' },
    golden_hour: { anchor: 'east-aquatics-deck', activity: 'Helping the aquatics club with practice', animation: 'working' },
    twilight: { anchor: 'research-centre', activity: 'Reviewing research notes at the observatory', animation: 'reading' },
  },
  npc_yuki: {
    morning: { anchor: 'west-koi-garden', activity: 'Walking the koi garden path', animation: 'idle' },
    golden_hour: { anchor: 'west-koi-garden', activity: 'Meeting classmates at the vermilion bridge', animation: 'idle' },
    twilight: { anchor: 'west-cafeteria', activity: 'Meeting friends after club activities', animation: 'idle' },
  },
};

export function getNpcDailyDirective(npcId: string, period: TimeOfDayPreset): NpcDailyDirective | null {
  const row = NPC_DAILY_SCHEDULES[npcId]?.[period];
  if (!row) return null;
  const anchor = ANCHORS[row.anchor];
  if (!anchor) return null;
  return { npcId, period, anchor, activity: row.activity, animation: row.animation };
}

export function getNpcActivityDirectives(period: TimeOfDayPreset): Record<string, NpcDailyDirective> {
  const result: Record<string, NpcDailyDirective> = {};
  for (const npcId of Object.keys(NPC_DAILY_SCHEDULES)) {
    const directive = getNpcDailyDirective(npcId, period);
    if (directive) result[npcId] = directive;
  }
  return result;
}

export interface NpcMemoryEvent {
  id: string;
  npcId: string;
  kind: 'greeting' | 'help' | 'shared-activity' | 'story-clue';
  summary: string;
  occurredAt: number;
}

export function appendNpcMemory(
  memories: NpcMemoryEvent[],
  event: NpcMemoryEvent,
  maxPerNpc = 12
): NpcMemoryEvent[] {
  if (!event.id || !event.npcId || !event.summary.trim()) return memories;
  if (memories.some((memory) => memory.id === event.id)) return memories;
  const next = [...memories, { ...event, summary: event.summary.trim().slice(0, 180) }];
  const npcEvents = next.filter((memory) => memory.npcId === event.npcId);
  if (npcEvents.length <= maxPerNpc) return next;
  const removeIds = new Set(npcEvents.slice(0, npcEvents.length - maxPerNpc).map((memory) => memory.id));
  return next.filter((memory) => !removeIds.has(memory.id));
}

export function getNpcMemoryContext(memories: NpcMemoryEvent[], npcId: string, limit = 4): string[] {
  return memories
    .filter((memory) => memory.npcId === npcId)
    .slice(-Math.max(0, Math.min(8, limit)))
    .map((memory) => memory.summary);
}

export function applyNpcDailySchedules<T extends {
  id: string;
  patrolWaypoints?: Vector3Tuple[];
  currentActivity?: string;
}>(interactables: T[], period: TimeOfDayPreset): T[] {
  const directives = getNpcActivityDirectives(period);
  return interactables.map((item) => {
    const directive = directives[item.id];
    if (!directive) return item;
    return {
      ...item,
      patrolWaypoints: [directive.anchor.position],
      currentActivity: directive.activity,
    };
  });
}

export function appendNpcRelationshipMemory(
  relationships: Record<string, NPCRelationshipState> | undefined,
  npcId: string,
  summary: string,
  maxMemories = 8
): Record<string, NPCRelationshipState> {
  const clean = summary.trim().replace(/\\s+/g, ' ').slice(0, 160);
  if (!npcId || !clean) return relationships ?? {};
  const current = relationships?.[npcId] ?? {
    npcId,
    friendship: 0,
    trust: 0,
    respect: 0,
    rivalry: 0,
    familiarity: 0,
    memories: [],
  };
  const memories = [...(current.memories ?? [])];
  if (memories[memories.length - 1] === clean) return relationships ?? {};
  memories.push(clean);
  return {
    ...(relationships ?? {}),
    [npcId]: {
      ...current,
      familiarity: Math.min(100, current.familiarity + 1),
      memories: memories.slice(-Math.max(1, maxMemories)),
    },
  };
}
