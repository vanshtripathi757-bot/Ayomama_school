import {
  ATMOSPHERE_PRESETS,
  CAMERA_VIEWPOINTS,
  CAMPUS_AABB_COLLIDERS,
  CAMPUS_CIRCLE_COLLIDERS,
  CAMPUS_INTERACTABLES,
  CANONICAL_STORY_PACKS,
  createInitialNpcRelationships,
  DEFAULT_SETTINGS,
  INITIAL_CHARACTER_CUSTOMIZATION,
  INITIAL_CLASS_POINTS,
  INITIAL_MISSION_PROGRESS,
  INITIAL_PLAYER_SKILLS,
  INITIAL_STORY_LIBRARY,
  LOADING_MESSAGES,
  NPC_AMBIENT_BANTERS,
  SCHOOL_PERIODS,
  STORY_CHAPTER_ARC,
} from '../../config/defaults';
import {
  AABBCollider2D,
  AcademyClassId,
  AmbientNpcBanter,
  AtmosphereConfig,
  CameraViewpoint,
  CameraViewpointId,
  CampusInteractable,
  CharacterCustomization,
  CircleCollider2D,
  GamePhase,
  GameSettings,
  GraphicsPreset,
  GraphicsSettings,
  MissionProgressState,
  NPCRelationshipState,
  NPCRuntimeState,
  PersonalityTrait,
  PlayerPhysicsState,
  PlayerSkills,
  ResolutionScale,
  SaveSlotData,
  SchoolPeriodConfig,
  SchoolPeriodId,
  ShadowQuality,
  StoryDirectorPack,
  StoryLibraryItem,
  StoryPackKind,
  StoryPhaseItem,
  TimeOfDayPreset,
} from '../../types/game';

export const PLAYER_RADIUS = 0.45;
export const NPC_BODY_RADIUS = 0.46;
export const WALK_SPEED = 5.4;
export const SPRINT_SPEED = 9.2;
export const JUMP_VELOCITY = 7.6;
export const GRAVITY = -21.0;

/**
 * Maps a high-level GraphicsPreset ('low' | 'medium' | 'high') to concrete
 * rendering settings (shadowQuality, resolutionScale).
 */
export function applyGraphicsPreset(preset: GraphicsPreset): GraphicsSettings {
  switch (preset) {
    case 'low':
      return {
        preset: 'low',
        shadowQuality: 'off',
        resolutionScale: 0.75,
      };
    case 'medium':
      return {
        preset: 'medium',
        shadowQuality: 'medium',
        resolutionScale: 1.0,
      };
    case 'high':
    default:
      return {
        preset: 'high',
        shadowQuality: 'high',
        resolutionScale: 1.0,
      };
  }
}

export function getShadowMapSize(quality: ShadowQuality): number {
  switch (quality) {
    case 'off':
      return 0;
    case 'low':
      return 512;
    case 'medium':
      return 1024;
    case 'high':
      return 1024;
  }
}

export function getSakuraPetalCount(preset: GraphicsPreset): number {
  switch (preset) {
    case 'low':
      return 45;
    case 'medium':
      return 90;
    case 'high':
      return 150;
  }
}

export function computeEffectivePixelRatio(
  devicePixelRatio: number,
  resolutionScale: ResolutionScale,
  isSoftwareGl: boolean
): number {
  if (isSoftwareGl) {
    return 1.0;
  }
  const baseDpr = Math.min(Math.max(devicePixelRatio || 1, 1), 2);
  return Number(Math.max(0.5, Math.min(2.0, baseDpr * resolutionScale)).toFixed(2));
}

export interface MobilePerformanceProfile {
  maxPixelRatio: number;
  shadowsAllowed: boolean;
  maxShadowMapSize: number;
  maxPetals: number;
  targetFps: number;
}

export function getMobilePerformanceProfile(input: {
  isMobile: boolean;
  deviceMemoryGb?: number;
  hardwareConcurrency?: number;
  isSoftwareGl?: boolean;
}): MobilePerformanceProfile {
  if (input.isSoftwareGl) {
    return { maxPixelRatio: 1, shadowsAllowed: false, maxShadowMapSize: 0, maxPetals: 24, targetFps: 30 };
  }
  if (!input.isMobile) {
    return { maxPixelRatio: 2, shadowsAllowed: true, maxShadowMapSize: 1024, maxPetals: 150, targetFps: 60 };
  }
  const memory = input.deviceMemoryGb ?? 4;
  const cores = input.hardwareConcurrency ?? 4;
  const constrained = memory <= 4 || cores <= 4;
  return constrained
    ? { maxPixelRatio: 1, shadowsAllowed: false, maxShadowMapSize: 0, maxPetals: 40, targetFps: 30 }
    : { maxPixelRatio: 1.25, shadowsAllowed: true, maxShadowMapSize: 512, maxPetals: 75, targetFps: 45 };
}

export function dampValue(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  const clampedDt = Math.min(Math.max(dt, 0), 0.05);
  return current + (target - current) * (1 - Math.exp(-lambda * clampedDt));
}

export function dampAngle(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  const clampedDt = Math.min(Math.max(dt, 0), 0.05);
  return current + diff * (1 - Math.exp(-lambda * clampedDt));
}

export function computeAudioGain(
  masterVolume: number,
  channelVolume: number,
  muted: boolean
): number {
  if (muted) return 0;
  const m = Math.min(100, Math.max(0, masterVolume)) / 100;
  const c = Math.min(100, Math.max(0, channelVolume)) / 100;
  return Number((m * c).toFixed(4));
}

export function getLoadingMessageForProgress(progress: number): string {
  const clamped = Math.min(100, Math.max(0, progress));
  let selected = LOADING_MESSAGES[0].message;
  for (const item of LOADING_MESSAGES) {
    if (clamped >= item.threshold) {
      selected = item.message;
    }
  }
  return selected;
}

/**
 * Checks whether the given XZ coordinates are inside the walkable
 * Main Academic Building ground-floor interior (Lobby, Class A Homeroom, or Library).
 */
export function isInsideSchoolBuilding(x: number, z: number): boolean {
  return x >= -22.8 && x <= 22.8 && z <= -9.6 && z >= -22.4;
}

/**
 * Returns a human-readable Hoshino Academy campus/town region name for the player's current XZ position.
 */
export function getCampusZoneLabel(x: number, z: number): string {
  if (isInsideSchoolBuilding(x, z)) {
    if (x < -5.6) return 'Inside Class A Homeroom';
    if (x > 5.6) return 'Library & Archive Room';
    return 'Hoshino Entrance Hall';
  }
  if (z > 82.0) return 'Hoshino Train Station';
  if (z > 36.0) return 'Hoshino Town District';
  if (z < -48.0) return 'Mountain Torii Shrine';
  if (x > 46.0) {
    return z < -12.0 ? 'Hoshino Research Centre & Dome' : 'East Aquatics Swimming Pool';
  }
  if (x < -46.0) {
    return z < -12.0 ? 'Festival Concert Amphitheater' : 'West Koi Garden & Bridge';
  }
  if (x < -32.0 && z < -20.0 && x >= -46.0) return 'Hoshino Student Dormitory';
  if (z < -22.4) return 'North Athletic Sports Field';
  if (x > 26.0) return 'East Gymnasium & Sports Arena';
  if (x < -26.0) return 'West Cafeteria Pavilion';
  if (z > 26.0) return 'South Main Gate Avenue';
  return 'Hoshino Academy Courtyard';
}

/**
 * Computes the student's current Hoshino Academy rank title and GPA from their earned XP / Reputation Points.
 */
export function getStudentAcademicRank(reputationPoints: number): {
  rankTitle: string;
  gpa: string;
  nextThreshold: number;
} {
  if (reputationPoints >= 180) {
    return { rankTitle: 'Hoshikaze Archive Guardian', gpa: '4.0', nextThreshold: 220 };
  }
  if (reputationPoints >= 110) {
    return { rankTitle: 'Hoshino Council Scholar', gpa: '3.9', nextThreshold: 180 };
  }
  if (reputationPoints >= 50) {
    return { rankTitle: 'Honor Roll Classmate', gpa: '3.7', nextThreshold: 110 };
  }
  return { rankTitle: 'New Transfer Student', gpa: '3.5', nextThreshold: 50 };
}

/**
 * Returns the active Story Chapter from STORY_CHAPTER_ARC based on current XP.
 */
export function getCurrentStoryChapter(xp: number): (typeof STORY_CHAPTER_ARC)[number] {
  let current = STORY_CHAPTER_ARC[0];
  for (const ch of STORY_CHAPTER_ARC) {
    if (xp >= ch.unlockXp) {
      current = ch;
    }
  }
  return current;
}

// ============================================================================
// V7.0 Story Library & Sequential Phase Progression Rules
// ============================================================================

export function getAllStories(customStories: StoryLibraryItem[] = []): StoryLibraryItem[] {
  return [...INITIAL_STORY_LIBRARY, ...customStories];
}

export function isStoryUnlocked(
  storyId: string,
  completedStoryIds: string[] = [],
  allStories: StoryLibraryItem[] = INITIAL_STORY_LIBRARY
): boolean {
  if (storyId === 'story_01') return true;
  const story = allStories.find((s) => s.id === storyId);
  if (!story) return false;
  if (story.unlockedByDefault) return true;
  if (completedStoryIds.includes(storyId)) return true;

  const prevStory = allStories.find((s) => s.storyNumber === story.storyNumber - 1);
  if (!prevStory) return true;
  return completedStoryIds.includes(prevStory.id);
}

export function isPhaseUnlocked(
  storyId: string,
  phaseNumber: number,
  completedPhaseKeys: string[] = [],
  completedStoryIds: string[] = [],
  allStories: StoryLibraryItem[] = INITIAL_STORY_LIBRARY
): boolean {
  if (!isStoryUnlocked(storyId, completedStoryIds, allStories)) return false;
  if (phaseNumber <= 1) return true;
  const prevKey = `${storyId}:phase_${phaseNumber - 1}`;
  return completedPhaseKeys.includes(prevKey);
}

export function getStoryCompletionPercentage(
  storyId: string,
  completedPhaseKeys: string[] = [],
  totalPhases: number = 9
): number {
  if (totalPhases <= 0) return 0;
  let count = 0;
  for (let p = 1; p <= totalPhases; p++) {
    if (completedPhaseKeys.includes(`${storyId}:phase_${p}`)) {
      count++;
    }
  }
  return Math.min(100, Math.round((count / totalPhases) * 100));
}

export function getActiveStoryAndPhase(
  progress: MissionProgressState
): { story: StoryLibraryItem; phase: StoryPhaseItem } {
  const allStories = getAllStories(progress.customStories ?? []);
  const story =
    allStories.find((s) => s.id === (progress.activeStoryId ?? 'story_01')) ??
    allStories[0];
  const phaseNum = progress.activePhaseNumber ?? 1;
  const phase =
    story.phases.find((p) => p.phaseNumber === phaseNum) ?? story.phases[0];
  return { story, phase };
}

/**
 * Completes the specified phase of a story, unlocking the next sequential phase
 * (or the next story if Phase 9 is completed), and awarding XP, CP, PP, and Skill growth.
 */
export function completeStoryPhaseProgress(
  current: MissionProgressState,
  storyId: string,
  phaseNumber: number
): MissionProgressState {
  const allStories = getAllStories(current.customStories ?? []);
  const story = allStories.find((item) => item.id === storyId);
  if (!story || !Number.isInteger(phaseNumber)) return current;

  const phase = story.phases.find((item) => item.phaseNumber === phaseNumber);
  if (!phase) return current;

  const completedPhaseKeys = [...(current.completedPhaseKeys ?? [])];
  const completedStoryIds = [...(current.completedStoryIds ?? [])];
  const phaseKey = `${story.id}:phase_${phase.phaseNumber}`;
  // Never grant rewards twice, and never skip a preceding phase or story.
  if (completedPhaseKeys.includes(phaseKey)) return current;
  if (!isPhaseUnlocked(storyId, phaseNumber, completedPhaseKeys, completedStoryIds, allStories)) return current;
  completedPhaseKeys.push(phaseKey);
  let nextActiveStoryId = story.id;
  let nextActivePhaseNumber = phase.phaseNumber;

  if (phase.phaseNumber < story.phases.length) {
    nextActivePhaseNumber = phase.phaseNumber + 1;
  } else {
    if (!completedStoryIds.includes(story.id)) {
      completedStoryIds.push(story.id);
    }
    const nextStory = allStories.find((s) => s.storyNumber === story.storyNumber + 1);
    if (nextStory) {
      nextActiveStoryId = nextStory.id;
      nextActivePhaseNumber = 1;
    }
  }

  const xpGain = Math.max(0, phase.rewardXp);
  const cpGain = Math.max(0, phase.rewardCp);
  const ppGain = Math.max(0, phase.rewardPp);

  const playerClass: AcademyClassId =
    current.characterCustomization?.academyClass ?? 'Class D';
  const classPoints: Record<AcademyClassId, number> = {
    ...(current.classPoints ?? INITIAL_CLASS_POINTS),
  };
  classPoints[playerClass] = (classPoints[playerClass] ?? 340) + cpGain;

  const curSkills = current.skills ?? INITIAL_PLAYER_SKILLS;
  const skills: PlayerSkills = {
    academics: Math.min(100, curSkills.academics + 3),
    communication: Math.min(100, curSkills.communication + 2),
    leadership: Math.min(100, curSkills.leadership + 2),
    creativity: Math.min(100, curSkills.creativity + 2),
    sports: Math.min(100, curSkills.sports + 2),
    problemSolving: Math.min(100, curSkills.problemSolving + 3),
    observation: Math.min(100, curSkills.observation + 3),
  };

  const discoveredClues = [...(current.discoveredClues ?? [])];
  if (phase.clueReward && !discoveredClues.includes(phase.clueReward)) {
    discoveredClues.push(phase.clueReward);
  }

  const newRep = current.reputationPoints + xpGain;

  return {
    ...current,
    reputationPoints: newRep,
    chapterIndex: getCurrentStoryChapter(newRep).index,
    cpPoints: (current.cpPoints ?? 50) + cpGain,
    ppPoints: (current.ppPoints ?? 150) + ppGain,
    classPoints,
    skills,
    discoveredClues,
    activeStoryId: nextActiveStoryId,
    activePhaseNumber: nextActivePhaseNumber,
    completedPhaseKeys,
    completedStoryIds,
  };
}

/**
 * Returns the active phase and its required objective checklist.
 */
export function getStoryPhaseObjectiveStatus(progress: MissionProgressState): {
  objectives: string[];
  completedIndexes: number[];
  completedCount: number;
  total: number;
  quizUnlocked: boolean;
  nextObjective: string | null;
} {
  const storyId = progress.activeStoryId ?? 'story_01';
  const phaseNumber = progress.activePhaseNumber ?? 1;
  const story = getAllStories(progress.customStories ?? []).find((item) => item.id === storyId);
  const phase = story?.phases.find((item) => item.phaseNumber === phaseNumber);
  const objectives = phase?.mainObjectives ?? [];
  const completed = new Set(progress.completedObjectiveKeys ?? []);
  const completedIndexes = objectives
    .map((_, index) => index)
    .filter((index) => completed.has(`${storyId}:phase_${phaseNumber}:objective_${index}`));
  const nextIndex = objectives.findIndex((_, index) => !completedIndexes.includes(index));
  return {
    objectives,
    completedIndexes,
    completedCount: completedIndexes.length,
    total: objectives.length,
    quizUnlocked: objectives.length > 0 && completedIndexes.length === objectives.length,
    nextObjective: nextIndex >= 0 ? objectives[nextIndex] : null,
  };
}

/**
 * Produces a short, actionable clue for the next objective without revealing later steps.
 */
export function getStoryObjectiveHint(progress: MissionProgressState): string {
  const status = getStoryPhaseObjectiveStatus(progress);
  const objective = status.nextObjective;
  if (!objective) return 'All main objectives are complete. Return to the Story Chronicle to take the phase quiz.';
  const normalized = objective.toLowerCase();
  if (/report|arrive/.test(normalized)) {
    return 'Head toward the central courtyard and walk around the fountain near the main academy entrance.';
  }
  const namedNpcIds = CAMPUS_INTERACTABLES
    .filter((item) => item.kind === 'npc')
    .filter((item) => item.name.toLowerCase().split(/\s+/).some((token) => token.length > 2 && token !== 'sensei' && normalized.includes(token)))
    .map((item) => item.name);
  if (namedNpcIds.length > 0) {
    return 'Find and speak with ' + namedNpcIds.join(' and ') + '. Each named classmate must be met for this clue to advance.';
  }
  if (/inspect|examine|investigate|read/.test(normalized)) {
    return 'Look for a nearby campus landmark or noticeboard and interact with it to inspect the clue.';
  }
  if (/visit|enter|walk through|attend|explore/.test(normalized)) {
    return 'Go to the area named in this objective and cross its entrance. The visit will register when you enter the interior.';
  }
  if (/custom conversation|send a message|build trust/.test(normalized)) {
    return 'Open a classmate conversation and send a friendly custom message to complete this step.';
  }
  return 'Follow this objective: ' + objective + '. Interact with the relevant classmate or campus feature to progress.';
}
/**
 * Records one verified gameplay event against the next active story objective.
 * Only one objective can advance per event, preventing one interaction from
 * accidentally completing an entire phase.
 */
export function recordStoryObjectiveEvent(
  current: MissionProgressState,
  event: {
    interactedId?: string;
    customMessageSent?: boolean;
    enteredInterior?: boolean;
    distanceDelta?: number;
  }
): MissionProgressState {
  const status = getStoryPhaseObjectiveStatus(current);
  if (!status.nextObjective) return current;

  const storyId = current.activeStoryId ?? 'story_01';
  const phaseNumber = current.activePhaseNumber ?? 1;
  const objectiveIndex = status.objectives.indexOf(status.nextObjective);
  const objective = status.nextObjective.toLowerCase();
  const target = event.interactedId
    ? CAMPUS_INTERACTABLES.find((item) => item.id === event.interactedId)
    : undefined;
  let completed = false;

  const key = `${storyId}:phase_${phaseNumber}:objective_${objectiveIndex}`;
  const namedNpcIds = CAMPUS_INTERACTABLES
    .filter((item) => {
      if (item.kind !== 'npc') return false;
      const nameTokens = item.name.toLowerCase().split(/\\s+/).filter((token) => token.length > 2 && token !== 'sensei');
      return nameTokens.some((token) => objective.includes(token));
    })
    .map((item) => item.id);
  let objectiveNpcProgress = current.objectiveNpcProgress ?? {};

  if (namedNpcIds.length > 0) {
    if (!target || target.kind !== 'npc' || !namedNpcIds.includes(target.id)) return current;
    const collected = new Set(objectiveNpcProgress[key] ?? []);
    collected.add(target.id);
    objectiveNpcProgress = { ...objectiveNpcProgress, [key]: [...collected] };
    if (!namedNpcIds.every((id) => collected.has(id))) {
      return { ...current, objectiveNpcProgress };
    }
    completed = true;
  } else if (/inspect|examine|investigate|read/.test(objective)) {
    completed = Boolean(target?.kind === 'landmark');
  } else if (/report|arrive/.test(objective)) {
    completed = Boolean(event.distanceDelta && current.distanceWalked + event.distanceDelta >= 8);
  } else if (/visit|enter|walk through|attend|explore/.test(objective)) {
    completed = Boolean(event.enteredInterior);
  } else if (/custom conversation|send a message|build trust/.test(objective)) {
    completed = Boolean(event.customMessageSent);
  } else if (/speak|talk|meet|greet|conversation/.test(objective)) {
    completed = Boolean(target?.kind === 'npc');
  } else {
    completed = Boolean(target || event.enteredInterior);
  }

  if (!completed) return current;
  const completedObjectiveKeys = [...(current.completedObjectiveKeys ?? [])];
  if (completedObjectiveKeys.includes(key)) return current;
  completedObjectiveKeys.push(key);
  const nextObjectiveNpcProgress = { ...objectiveNpcProgress };
  delete nextObjectiveNpcProgress[key];
  return { ...current, completedObjectiveKeys, objectiveNpcProgress: nextObjectiveNpcProgress };
}

/**
 * Updates NPC relationship metrics (friendship, trust, respect, rivalry, familiarity)
 * and appends a persistent memory entry when the player interacts or chats with an NPC.
 */
export function updateNpcRelationshipOnInteraction(
  currentMap: Record<string, NPCRelationshipState> | undefined,
  npc: CampusInteractable,
  bonusXp: number = 10,
  customMessage?: string
): Record<string, NPCRelationshipState> {
  const map: Record<string, NPCRelationshipState> = {
    ...createInitialNpcRelationships(),
    ...(currentMap ?? {}),
  };
  if (npc.kind !== 'npc') return map;

  const existing = map[npc.id] ?? {
    npcId: npc.id,
    friendship: 20,
    trust: 18,
    respect: 20,
    rivalry: npc.id === 'npc_ren' ? 35 : 5,
    familiarity: 15,
    memories: [],
  };

  const isCompetitive = npc.personalityType === 'Competitive';
  const memoryLine = customMessage
    ? `Discussed "${customMessage.slice(0, 48)}" with the transfer student.`
    : `Shared a meaningful conversation about ${npc.currentGoal ?? 'campus life'}.`;

  const updatedMemories = [...existing.memories];
  if (!updatedMemories.includes(memoryLine)) {
    updatedMemories.push(memoryLine);
    if (updatedMemories.length > 8) {
      updatedMemories.shift();
    }
  }

  map[npc.id] = {
    npcId: npc.id,
    friendship: Math.min(100, existing.friendship + Math.max(4, Math.round(bonusXp * 0.4))),
    trust: Math.min(100, existing.trust + Math.max(3, Math.round(bonusXp * 0.35))),
    respect: Math.min(100, existing.respect + Math.max(4, Math.round(bonusXp * 0.4))),
    rivalry: isCompetitive
      ? Math.min(100, existing.rivalry + 5)
      : existing.rivalry,
    familiarity: Math.min(100, existing.familiarity + 8),
    memories: updatedMemories,
  };

  return map;
}

/**
 * Returns the next deterministic Story Director pack for the player's current XP and completed pack history.
 */
export function getDeterministicStoryPack(
  xp: number,
  completedIds: string[] = []
): StoryDirectorPack {
  const unseenUnlocked = CANONICAL_STORY_PACKS.find(
    (p) => xp >= p.unlockAtXp && !completedIds.includes(p.id)
  );
  if (unseenUnlocked) return unseenUnlocked;

  const anyUnseen = CANONICAL_STORY_PACKS.find((p) => !completedIds.includes(p.id));
  if (anyUnseen) return anyUnseen;

  const idx = completedIds.length % CANONICAL_STORY_PACKS.length;
  return CANONICAL_STORY_PACKS[idx];
}

/**
 * Validates an untrusted JSON object against the Gemini Story Director contract:
 * { kind, title, summary, chapter, location, storyText, unlockAtXp, question, options: [4], correctOption: 0..3, explanation }
 * Falls back cleanly to getDeterministicStoryPack if any required field is invalid.
 */
export function validateStoryDirectorPack(
  raw: unknown,
  fallbackXp: number = 10,
  completedIds: string[] = []
): StoryDirectorPack {
  const fallback = getDeterministicStoryPack(fallbackXp, completedIds);
  if (!raw || typeof raw !== 'object') return fallback;

  const obj = raw as Record<string, unknown>;
  const validKinds: StoryPackKind[] = ['adventure', 'quiz', 'test', 'event'];
  const kind: StoryPackKind = validKinds.includes(obj.kind as StoryPackKind)
    ? (obj.kind as StoryPackKind)
    : fallback.kind;

  const nonEmptyStr = (v: unknown, def: string) =>
    typeof v === 'string' && v.trim().length > 0 ? v.trim() : def;

  let options: string[] = [...fallback.options];
  if (
    Array.isArray(obj.options) &&
    obj.options.length >= 4 &&
    obj.options.slice(0, 4).every((o) => typeof o === 'string' && o.trim().length > 0)
  ) {
    options = [
      String(obj.options[0]).trim(),
      String(obj.options[1]).trim(),
      String(obj.options[2]).trim(),
      String(obj.options[3]).trim(),
    ];
  }

  const rawCorrect = Number(obj.correctOption);
  const correctOption =
    Number.isInteger(rawCorrect) && rawCorrect >= 0 && rawCorrect <= 3
      ? rawCorrect
      : fallback.correctOption;

  const rawUnlockXp = Number(obj.unlockAtXp);
  const unlockAtXp =
    Number.isFinite(rawUnlockXp) && rawUnlockXp >= 0
      ? Math.round(rawUnlockXp)
      : fallback.unlockAtXp;

  return {
    id: nonEmptyStr(obj.id, `pack_${Date.now()}`),
    kind,
    title: nonEmptyStr(obj.title, fallback.title),
    summary: nonEmptyStr(obj.summary, fallback.summary),
    chapter: nonEmptyStr(obj.chapter, fallback.chapter),
    location: nonEmptyStr(obj.location, fallback.location),
    storyText: nonEmptyStr(obj.storyText, fallback.storyText),
    unlockAtXp,
    question: nonEmptyStr(obj.question, fallback.question),
    options,
    correctOption,
    explanation: nonEmptyStr(obj.explanation, fallback.explanation),
    xpReward:
      typeof obj.xpReward === 'number' && obj.xpReward > 0
        ? Math.round(obj.xpReward)
        : fallback.xpReward,
    clueReward:
      typeof obj.clueReward === 'string' && obj.clueReward.trim().length > 0
        ? obj.clueReward.trim()
        : fallback.clueReward,
  };
}

/**
 * Resolves 2D circle-vs-AABB and circle-vs-circle collisions in the XZ plane
 * with 2 solver iterations and previous-position anti-tunneling so characters never pass through
 * thin interior/exterior walls, furniture, or other characters (NPCs/Player).
 */
export function resolveCampusCollisions(
  x: number,
  z: number,
  radius: number = PLAYER_RADIUS,
  aabbs: AABBCollider2D[] = CAMPUS_AABB_COLLIDERS,
  circles: CircleCollider2D[] = CAMPUS_CIRCLE_COLLIDERS,
  prevX?: number,
  prevZ?: number
): { x: number; z: number } {
  let rx = Math.max(-105, Math.min(105, x));
  let rz = Math.max(-105, Math.min(110, z));

  // Run 2 iterations so corner junctions and character bodies never allow squeezing through
  for (let iter = 0; iter < 2; iter++) {
    for (const box of aabbs) {
      const closestX = Math.max(box.minX, Math.min(rx, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(rz, box.maxZ));
      const dx = rx - closestX;
      const dz = rz - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        if (distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const overlap = radius - dist;
          rx += (dx / dist) * overlap;
          rz += (dz / dist) * overlap;
        } else {
          // Center landed inside the AABB: push back toward the side prevX/prevZ came from
          if (prevX !== undefined && prevZ !== undefined) {
            if (prevZ >= box.maxZ) {
              rz = box.maxZ + radius;
              continue;
            }
            if (prevZ <= box.minZ) {
              rz = box.minZ - radius;
              continue;
            }
            if (prevX <= box.minX) {
              rx = box.minX - radius;
              continue;
            }
            if (prevX >= box.maxX) {
              rx = box.maxX + radius;
              continue;
            }
          }
          const dLeft = Math.abs(rx - box.minX);
          const dRight = Math.abs(box.maxX - rx);
          const dTop = Math.abs(rz - box.minZ);
          const dBottom = Math.abs(box.maxZ - rz);
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          if (minD === dLeft) rx = box.minX - radius;
          else if (minD === dRight) rx = box.maxX + radius;
          else if (minD === dTop) rz = box.minZ - radius;
          else rz = box.maxZ + radius;
        }
      }
    }

    // Resolve against circular colliders (fountain, portico columns, trees, AND live NPC / Player bodies!)
    for (const c of circles) {
      const minDist = radius + c.radius;
      const dx = rx - c.x;
      const dz = rz - c.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.001;
        const overlap = minDist - dist;
        rx += (dx / dist) * overlap;
        rz += (dz / dist) * overlap;
      }
    }
  }

  return { x: rx, z: rz };
}

/**
 * Prevents the third-person follow camera from clipping through walls by raycasting
 * a 2D segment from the player (lookX, lookZ) to the desired camera (camX, camZ)
 * against all wall AABBs and pulling the camera in front of any hit wall.
 */
export function clampCameraPositionAgainstWalls(
  playerX: number,
  playerZ: number,
  camX: number,
  camZ: number,
  aabbs: AABBCollider2D[] = CAMPUS_AABB_COLLIDERS
): { x: number; z: number } {
  const dx = camX - playerX;
  const dz = camZ - playerZ;
  const segLen = Math.hypot(dx, dz);
  if (segLen < 0.05) return { x: camX, z: camZ };

  let minT = 1.0;
  const margin = 0.28; // Keep camera 28cm away from wall surface

  for (const box of aabbs) {
    const minX = box.minX - margin;
    const maxX = box.maxX + margin;
    const minZ = box.minZ - margin;
    const maxZ = box.maxZ + margin;

    // Skip if player is already inside the expanded margin box
    if (playerX > minX && playerX < maxX && playerZ > minZ && playerZ < maxZ) {
      continue;
    }

    let t0 = 0.0;
    let t1 = 1.0;
    const p = [-dx, dx, -dz, dz];
    const q = [playerX - minX, maxX - playerX, playerZ - minZ, maxZ - playerZ];
    let hit = true;

    for (let i = 0; i < 4; i++) {
      if (Math.abs(p[i]) < 1e-6) {
        if (q[i] < 0) {
          hit = false;
          break;
        }
      } else {
        const t = q[i] / p[i];
        if (p[i] < 0) {
          if (t > t1) {
            hit = false;
            break;
          }
          if (t > t0) t0 = t;
        } else {
          if (t < t0) {
            hit = false;
            break;
          }
          if (t < t1) t1 = t;
        }
      }
    }

    if (hit && t0 >= 0 && t0 < minT) {
      minT = Math.max(0.02, t0);
    }
  }

  return {
    x: playerX + dx * minT,
    z: playerZ + dz * minT,
  };
}

/**
 * Advances player locomotion, jump physics, coyote time, squash-and-stretch,
 * and 4-substep swept spatial collision resolution against walls, furniture, AND live NPC bodies
 * so the player never walks through walls or NPCs!
 */
/** Returns the walkable floor height for the current dormitory level. */
export function getCampusFloorHeight(x: number, z: number, playerY: number): number {
  const insideDormitory = x >= -54.0 && x <= -36.0 && z >= -44.0 && z <= -25.0;
  if (!insideDormitory) return 0;
  let floorHeight = 0;
  for (const level of [3.8, 7.6, 11.4]) {
    if (level <= playerY + 0.12) floorHeight = level;
  }
  return floorHeight;
}

const GROUND_LEVEL_CAMPUS_COLLIDERS = CAMPUS_AABB_COLLIDERS.filter(
  (collider) => collider.id !== 'dormitory_upper_front_rail'
);

function getCampusAabbCollidersAtHeight(playerY: number): AABBCollider2D[] {
  return playerY > 1.0 ? CAMPUS_AABB_COLLIDERS : GROUND_LEVEL_CAMPUS_COLLIDERS;
}

export function stepPlayerPhysics(
  state: PlayerPhysicsState,
  input: {
    moveX: number; // -1 to 1 (right/left relative to camera)
    moveZ: number; // -1 to 1 (forward/backward relative to camera)
    cameraYaw: number;
    sprintHeld: boolean;
    jumpJustPressed: boolean;
    jumpHeld: boolean;
  },
  dt: number,
  npcStates?: NPCRuntimeState[]
): { nextState: PlayerPhysicsState; distanceDelta: number; landedThisFrame: boolean } {
  const clampedDt = Math.min(Math.max(dt, 0.001), 0.05);
  const next: PlayerPhysicsState = { ...state };

  const rawMag = Math.hypot(input.moveX, input.moveZ);
  const mag = Math.min(1, rawMag);
  const normX = rawMag > 0.001 ? input.moveX / rawMag : 0;
  const normZ = rawMag > 0.001 ? input.moveZ / rawMag : 0;

  const sinYaw = Math.sin(input.cameraYaw);
  const cosYaw = Math.cos(input.cameraYaw);
  const worldDirX = normX * cosYaw + normZ * sinYaw;
  const worldDirZ = -normX * sinYaw + normZ * cosYaw;

  next.isSprinting = input.sprintHeld && mag > 0.15;
  const targetSpeed = (next.isSprinting ? SPRINT_SPEED : WALK_SPEED) * mag;

  const targetVx = worldDirX * targetSpeed;
  const targetVz = worldDirZ * targetSpeed;

  const accelLambda = next.isGrounded ? 14.0 : 6.5;
  next.vx = dampValue(next.vx, targetVx, accelLambda, clampedDt);
  next.vz = dampValue(next.vz, targetVz, accelLambda, clampedDt);

  const prevX = next.x;
  const prevZ = next.z;

  // Include live NPC bodies as physical circle colliders so the player never passes through NPCs!
  const combinedCircles: CircleCollider2D[] =
    npcStates && npcStates.length > 0
      ? [
          ...CAMPUS_CIRCLE_COLLIDERS,
          ...npcStates.map((npc) => ({
            id: `npc_body_${npc.id}`,
            x: npc.x,
            z: npc.z,
            radius: NPC_BODY_RADIUS,
          })),
        ]
      : CAMPUS_CIRCLE_COLLIDERS;

  // 4-substep swept collision resolution prevents any high-speed wall or NPC tunneling
  const subSteps = 4;
  const subDt = clampedDt / subSteps;
  let curX = next.x;
  let curZ = next.z;

  for (let s = 0; s < subSteps; s++) {
    const candX = curX + next.vx * subDt;
    const candZ = curZ + next.vz * subDt;
    const resolved = resolveCampusCollisions(
      candX,
      candZ,
      PLAYER_RADIUS,
      getCampusAabbCollidersAtHeight(next.y),
      combinedCircles,
      curX,
      curZ
    );
    curX = resolved.x;
    curZ = resolved.z;
  }

  next.x = curX;
  next.z = curZ;

  const supportHeight = getCampusFloorHeight(next.x, next.z, next.y);
  if (next.isGrounded && Math.abs(next.y - supportHeight) > 0.12) {
    next.isGrounded = false;
  }

  const distanceDelta = Math.hypot(next.x - prevX, next.z - prevZ);

  if (mag > 0.08) {
    const targetFacingYaw = Math.atan2(worldDirX, worldDirZ);
    next.yaw = dampAngle(next.yaw, targetFacingYaw, 12.0, clampedDt);
  }

  if (next.isGrounded && distanceDelta > 0.0005) {
    next.walkPhase += distanceDelta * (next.isSprinting ? 3.2 : 2.6);
  } else {
    const nearestRest = Math.round(next.walkPhase / Math.PI) * Math.PI;
    next.walkPhase = dampValue(next.walkPhase, nearestRest, 8.0, clampedDt);
  }

  if (next.isGrounded) {
    next.coyoteTimer = 0.1;
  } else {
    next.coyoteTimer = Math.max(0, next.coyoteTimer - clampedDt);
  }

  if (input.jumpJustPressed) {
    next.jumpBufferTimer = 0.12;
  } else {
    next.jumpBufferTimer = Math.max(0, next.jumpBufferTimer - clampedDt);
  }

  if (next.jumpBufferTimer > 0 && next.coyoteTimer > 0) {
    next.vy = JUMP_VELOCITY;
    next.isGrounded = false;
    next.coyoteTimer = 0;
    next.jumpBufferTimer = 0;
    next.squashY = 1.2;
    next.squashXZ = 0.85;
  }

  if (!input.jumpHeld && next.vy > 2.2) {
    next.vy *= 0.55;
  }

  let landedThisFrame = false;
  if (!next.isGrounded || next.vy > 0) {
    next.vy += GRAVITY * clampedDt;
    next.y += next.vy * clampedDt;

    if (next.y <= supportHeight) {
      next.y = supportHeight;
      next.vy = 0;
      if (!next.isGrounded) {
        landedThisFrame = true;
        next.squashY = 0.78;
        next.squashXZ = 1.18;
      }
      next.isGrounded = true;
    }
  }

  next.squashY = dampValue(next.squashY, 1.0, 12.0, clampedDt);
  next.squashXZ = dampValue(next.squashXZ, 1.0, 12.0, clampedDt);

  return { nextState: next, distanceDelta, landedThisFrame };
}

export function getSkyWeatherDescription(
  timeOfDay: TimeOfDayPreset,
  elapsedSeconds: number
): string {
  const cloudPhase = Math.floor(elapsedSeconds / 25) % 3;
  if (timeOfDay === 'morning') {
    return cloudPhase === 0
      ? '☁️ Fair Cumulus · Morning Breeze'
      : cloudPhase === 1
        ? '🌤️ Drifting Clouds · Sakura Wind'
        : '☀️ High Cirrus · Crisp Morning';
  }
  if (timeOfDay === 'golden_hour') {
    return cloudPhase === 0
      ? '🌅 Amber Clouds · Sunset Breeze'
      : cloudPhase === 1
        ? '☁️ Rose Cumulus · Petal Drift'
        : '🌇 Golden Sky · Warm Wind';
  }
  return cloudPhase === 0
    ? '🌙 Moonlight Clouds · Night Breeze'
    : cloudPhase === 1
      ? '✨ Starlit Sky · Scattered Clouds'
      : '🌌 Clear Indigo · Calm Evening';
}

export function getPersonalityBehaviorProfile(personality?: PersonalityTrait): {
  speedMultiplier: number;
  pauseDuration: number;
  greetingRange: number;
  defaultEmotion: string;
} {
  switch (personality) {
    case 'Competitive':
      return {
        speedMultiplier: 1.18,
        pauseDuration: 0.9,
        greetingRange: 4.2,
        defaultEmotion: 'Fired Up & Competitive',
      };
    case 'Friendly':
      return {
        speedMultiplier: 1.02,
        pauseDuration: 1.4,
        greetingRange: 4.6,
        defaultEmotion: 'Warm & Welcoming',
      };
    case 'Creative':
      return {
        speedMultiplier: 0.9,
        pauseDuration: 2.3,
        greetingRange: 4.1,
        defaultEmotion: 'Inspired & Sketching',
      };
    case 'Introverted':
      return {
        speedMultiplier: 0.86,
        pauseDuration: 2.6,
        greetingRange: 3.5,
        defaultEmotion: 'Quiet & Observant',
      };
    case 'Intelligent':
      return {
        speedMultiplier: 0.96,
        pauseDuration: 1.9,
        greetingRange: 4.0,
        defaultEmotion: 'Analytical & Focused',
      };
    case 'Confident':
      return {
        speedMultiplier: 1.08,
        pauseDuration: 1.2,
        greetingRange: 4.3,
        defaultEmotion: 'Upbeat & Confident',
      };
    case 'Calm':
      return {
        speedMultiplier: 0.92,
        pauseDuration: 2.0,
        greetingRange: 4.0,
        defaultEmotion: 'Composed & Steady',
      };
    case 'Curious':
    default:
      return {
        speedMultiplier: 1.05,
        pauseDuration: 1.5,
        greetingRange: 4.2,
        defaultEmotion: 'Curious & Exploring',
      };
  }
}

export function createInitialNPCRuntimeStates(
  interactables: CampusInteractable[] = CAMPUS_INTERACTABLES
): NPCRuntimeState[] {
  return interactables
    .filter((item) => item.kind === 'npc')
    .map((item, idx) => {
      const profile = getPersonalityBehaviorProfile(item.personalityType);
      return {
        id: item.id,
        x: item.position.x,
        y: item.position.y,
        z: item.position.z,
        yaw: item.facingYaw,
        waypointIndex:
          item.patrolWaypoints && item.patrolWaypoints.length > 1 ? 1 : 0,
        pauseTimer: idx * 0.35,
        walkPhase: 0,
        isMoving: false,
        isGreetingPlayer: false,
        greetingAnim: item.greetingAnim ?? 'wave',
        currentActivity: item.currentActivity ?? 'Patrolling Hoshino Academy',
        emotionalState: item.emotionalState ?? profile.defaultEmotion,
        talkingWithNpcId: null,
      };
    });
}

/**
 * Advances autonomous NPC movement and personality-driven behavior across Hoshino Academy.
 * - Physically separates NPCs from the Player body and from other NPC bodies so no character
 *   ever walks through another character.
 * - Adjusts walking speed, pause duration, greeting distance, emotional state, and current
 *   activity based on each NPC's personalityType and character role.
 */
export function stepAutonomousNPCs(
  npcStates: NPCRuntimeState[],
  interactables: CampusInteractable[],
  playerX: number,
  playerZ: number,
  activeDialogueTargetId: string | null,
  dt: number
): NPCRuntimeState[] {
  const clampedDt = Math.min(Math.max(dt, 0.001), 0.05);

  return npcStates.map((npc, idx) => {
    const config = interactables.find((i) => i.id === npc.id);
    if (!config) return npc;

    const behavior = getPersonalityBehaviorProfile(config.personalityType);

    const next: NPCRuntimeState = {
      ...npc,
      greetingAnim: config.greetingAnim ?? 'wave',
      currentActivity: config.currentActivity ?? npc.currentActivity,
      emotionalState: config.emotionalState ?? behavior.defaultEmotion,
      talkingWithNpcId: null,
      usingObjectId: undefined,
      activityActionId: undefined,
    };

    // Build dynamic body colliders (Player body + all other NPCs) so NPCs never clip through the player or each other
    const dynamicBodyCircles: CircleCollider2D[] = [
      ...CAMPUS_CIRCLE_COLLIDERS,
      { id: 'player_body', x: playerX, z: playerZ, radius: PLAYER_RADIUS + 0.05 },
      ...npcStates
        .filter((_, otherIdx) => otherIdx !== idx)
        .map((other) => ({
          id: `other_npc_${other.id}`,
          x: other.x,
          z: other.z,
          radius: NPC_BODY_RADIUS,
        })),
    ];

    // Ensure NPC never overlaps the player even while standing/greeting
    const sepFromBodies = resolveCampusCollisions(
      next.x,
      next.z,
      NPC_BODY_RADIUS,
      getCampusAabbCollidersAtHeight(next.y),
      dynamicBodyCircles,
      next.x,
      next.z
    );
    next.x = sepFromBodies.x;
    next.z = sepFromBodies.z;

    const dxPlayer = playerX - next.x;
    const dzPlayer = playerZ - next.z;
    const distToPlayer = Math.hypot(dxPlayer, dzPlayer);

    // Pause, face the player, and trigger unique proximity greeting animation if talking or within personality greeting range
    if (
      activeDialogueTargetId === next.id ||
      distToPlayer < behavior.greetingRange
    ) {
      next.isMoving = false;
      next.usingObjectId = undefined;
      next.activityActionId = undefined;
      next.isGreetingPlayer = true;
      next.currentActivity =
        activeDialogueTargetId === next.id
          ? 'In conversation with Transfer Student'
          : `Greeting Transfer Student (${config.personalityType ?? 'Friendly'})`;
      const targetYaw = Math.atan2(dxPlayer, dzPlayer);
      next.yaw = dampAngle(next.yaw, targetYaw, 8.0, clampedDt);
      const nearestRest = Math.round(next.walkPhase / Math.PI) * Math.PI;
      next.walkPhase = dampValue(next.walkPhase, nearestRest, 8.0, clampedDt);
      return next;
    }

    next.isGreetingPlayer = false;

    const waypoints = config.patrolWaypoints;
    if (!waypoints || waypoints.length === 0) {
      next.isMoving = false;
      return next;
    }

    if (next.pauseTimer > 0) {
      next.pauseTimer = Math.max(0, next.pauseTimer - clampedDt);
      next.isMoving = false;
      const nearestRest = Math.round(next.walkPhase / Math.PI) * Math.PI;
      next.walkPhase = dampValue(next.walkPhase, nearestRest, 8.0, clampedDt);
      return next;
    }

    const targetWp = waypoints[next.waypointIndex % waypoints.length];
    const dx = targetWp.x - next.x;
    const dz = targetWp.z - next.z;
    const distToWp = Math.hypot(dx, dz);

    if (distToWp < 0.45) {
      next.waypointIndex = (next.waypointIndex + 1) % waypoints.length;
      next.pauseTimer = Math.max(behavior.pauseDuration, 2.5);
      next.isMoving = false;
      next.usingObjectId = config.activityObjectId;
      next.activityActionId = config.activityActionId;
      if (config.activityObjectId) next.currentActivity = config.currentActivity ?? next.currentActivity;
      return next;
    }

    const baseSpeed = config.walkSpeed ?? 1.9;
    const speed = baseSpeed * behavior.speedMultiplier;
    const dirX = dx / distToWp;
    const dirZ = dz / distToWp;

    const stepX = next.x + dirX * speed * clampedDt;
    const stepZ = next.z + dirZ * speed * clampedDt;
    const resolved = resolveCampusCollisions(
      stepX,
      stepZ,
      NPC_BODY_RADIUS,
      getCampusAabbCollidersAtHeight(next.y),
      dynamicBodyCircles,
      next.x,
      next.z
    );

    const movedDist = Math.hypot(resolved.x - next.x, resolved.z - next.z);
    next.x = resolved.x;
    next.z = resolved.z;
    next.isMoving = movedDist > 0.0005;
    if (next.isMoving) {
      next.usingObjectId = undefined;
      next.activityActionId = undefined;
    }

    if (next.isMoving) {
      const targetYaw = Math.atan2(dirX, dirZ);
      next.yaw = dampAngle(next.yaw, targetYaw, 9.0, clampedDt);
      next.walkPhase += movedDist * 2.75;
    }

    return next;
  });
}

/**
 * Finds the nearest interactive NPC (using live moving coordinates if provided)
 * or static campus landmark within its interaction radius.
 */
export function findNearestInteractable(
  playerX: number,
  playerZ: number,
  interactables: CampusInteractable[] = CAMPUS_INTERACTABLES,
  npcRuntimeStates?: NPCRuntimeState[]
): { target: CampusInteractable | null; distance: number } {
  let best: CampusInteractable | null = null;
  let bestDist = Infinity;

  for (const item of interactables) {
    let ix = item.position.x;
    let iz = item.position.z;
    if (npcRuntimeStates && item.kind === 'npc') {
      const liveNpc = npcRuntimeStates.find((n) => n.id === item.id);
      if (liveNpc) {
        ix = liveNpc.x;
        iz = liveNpc.z;
      }
    }

    const d = Math.hypot(playerX - ix, playerZ - iz);
    if (d <= item.interactionRadius && d < bestDist) {
      best = {
        ...item,
        position: { x: ix, y: item.position.y, z: iz },
      };
      bestDist = d;
    }
  }

  return { target: best, distance: bestDist };
}

/**
 * Returns an ambient NPC-to-NPC conversation line based on elapsed time
 * or proximity between patrolling NPCs in the courtyard.
 */
export function selectActiveAmbientBanter(
  npcStates: NPCRuntimeState[],
  elapsedSeconds: number
): AmbientNpcBanter {
  if (NPC_AMBIENT_BANTERS.length === 0) {
    return {
      id: 'default',
      speakerA: 'Aiko Hoshino',
      speakerB: 'Ren Takahashi',
      lineA: 'Good morning! The courtyard sakura trees are in full bloom today.',
      lineB: 'Morning, Aiko! Class A is ready for courtyard practice.',
    };
  }
  const index = Math.floor(elapsedSeconds / 14) % NPC_AMBIENT_BANTERS.length;
  void npcStates;
  return NPC_AMBIENT_BANTERS[index];
}

/**
 * Updates Mission Progress, Skills, Class Points, and NPC Relationships when walking,
 * entering the school interior, talking, or sending custom chat.
 */
export function advanceMissionProgress(
  current: MissionProgressState,
  event: {
    distanceDelta?: number;
    interactedId?: string;
    reputationDelta?: number;
    customMessageSent?: boolean;
    customMessageText?: string;
    rewardItemName?: string;
    enteredInterior?: boolean;
    completedStoryPackId?: string;
    clueUnlocked?: string;
  }
): MissionProgressState {
  const next: MissionProgressState = {
    ...current,
    interactedIds: [...current.interactedIds],
    customMessagesSent: current.customMessagesSent ?? 0,
    inventoryItems: [...(current.inventoryItems ?? ['Hoshino Student ID Card'])],
    visitedInterior: Boolean(current.visitedInterior),
    chapterIndex: current.chapterIndex ?? 0,
    completedStoryPackIds: [...(current.completedStoryPackIds ?? [])],
    discoveredClues: [
      ...(current.discoveredClues ?? [
        'Prologue Note: A faded star emblem is carved into the Hoshino Academy main portico.',
      ]),
    ],
    characterCustomization:
      current.characterCustomization ?? structuredClone(INITIAL_CHARACTER_CUSTOMIZATION),
    skills: { ...(current.skills ?? INITIAL_PLAYER_SKILLS) },
    cpPoints: current.cpPoints ?? 50,
    ppPoints: current.ppPoints ?? 150,
    classPoints: { ...(current.classPoints ?? INITIAL_CLASS_POINTS) },
    activeStoryId: current.activeStoryId ?? 'story_01',
    activePhaseNumber: current.activePhaseNumber ?? 1,
    completedPhaseKeys: [...(current.completedPhaseKeys ?? [])],
    completedStoryIds: [...(current.completedStoryIds ?? [])],
    npcRelationships: {
      ...createInitialNpcRelationships(),
      ...(current.npcRelationships ?? {}),
    },
    customStories: [...(current.customStories ?? [])],
  };

  if (event.distanceDelta && event.distanceDelta > 0) {
    next.distanceWalked = Number((next.distanceWalked + event.distanceDelta).toFixed(2));
  }

  if (event.enteredInterior && !next.visitedInterior) {
    next.visitedInterior = true;
    next.reputationPoints += 15;
    if (next.skills) {
      next.skills.observation = Math.min(100, next.skills.observation + 2);
    }
  }

  if (event.interactedId) {
    const targetNpc = CAMPUS_INTERACTABLES.find((i) => i.id === event.interactedId);
    if (event.interactedId === 'npc_hana' || event.interactedId === 'npc_takeda') {
      next.talkedToHana = true;
    }
    if (event.interactedId === 'npc_takeda' || event.interactedId === 'npc_kuroda') {
      next.visitedInterior = true;
    }
    if (!next.interactedIds.includes(event.interactedId)) {
      next.interactedIds.push(event.interactedId);
      if (event.interactedId !== 'npc_hana') {
        next.inspectedCount += 1;
      }
      next.reputationPoints += 20;
      next.ppPoints = (next.ppPoints ?? 150) + 25;
      if (next.skills) {
        next.skills.communication = Math.min(100, next.skills.communication + 2);
      }
    }
    if (targetNpc && targetNpc.kind === 'npc') {
      next.npcRelationships = updateNpcRelationshipOnInteraction(
        next.npcRelationships,
        targetNpc,
        event.reputationDelta ?? 15,
        event.customMessageText
      );
    }
  }

  if (event.customMessageSent) {
    next.customMessagesSent = (next.customMessagesSent ?? 0) + 1;
    if (next.skills) {
      next.skills.communication = Math.min(100, next.skills.communication + 2);
      next.skills.leadership = Math.min(100, next.skills.leadership + 1);
    }
  }

  if (
    event.rewardItemName &&
    next.inventoryItems &&
    !next.inventoryItems.includes(event.rewardItemName)
  ) {
    next.inventoryItems.push(event.rewardItemName);
  }

  if (
    event.completedStoryPackId &&
    next.completedStoryPackIds &&
    !next.completedStoryPackIds.includes(event.completedStoryPackId)
  ) {
    next.completedStoryPackIds.push(event.completedStoryPackId);
  }

  if (
    event.clueUnlocked &&
    next.discoveredClues &&
    !next.discoveredClues.includes(event.clueUnlocked)
  ) {
    next.discoveredClues.push(event.clueUnlocked);
  }

  if (event.reputationDelta && event.reputationDelta > 0) {
    next.reputationPoints += event.reputationDelta;
    const playerClass: AcademyClassId =
      next.characterCustomization?.academyClass ?? 'Class A';
    if (next.classPoints) {
      next.classPoints[playerClass] =
        (next.classPoints[playerClass] ?? 380) + Math.max(2, Math.round(event.reputationDelta * 0.4));
    }
  }

  next.chapterIndex = getCurrentStoryChapter(next.reputationPoints).index;

  return next;
}

/**
 * Validates and sanitizes a persisted SaveSlotData object loaded from IndexedDB or localStorage.
 */
export function validateSaveData(raw: unknown): SaveSlotData | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, any>;
  if (typeof candidate.id !== 'string' || !candidate.id) return null;
  if (typeof candidate.timestamp !== 'number' || candidate.timestamp <= 0) return null;
  if (typeof candidate.chapterTitle !== 'string') return null;
  if (typeof candidate.locationName !== 'string') return null;

  const validTimes: TimeOfDayPreset[] = ['morning', 'golden_hour', 'twilight'];
  const timeOfDay: TimeOfDayPreset = validTimes.includes(
    candidate.timeOfDay as TimeOfDayPreset
  )
    ? (candidate.timeOfDay as TimeOfDayPreset)
    : 'golden_hour';

  const validViewpoints = Object.keys(CAMERA_VIEWPOINTS) as CameraViewpointId[];
  const cameraViewpoint: CameraViewpointId = validViewpoints.includes(
    candidate.cameraViewpoint as CameraViewpointId
  )
    ? (candidate.cameraViewpoint as CameraViewpointId)
    : 'courtyard_overview';

  const playerPosition =
    candidate.playerPosition &&
    typeof candidate.playerPosition.x === 'number' &&
    typeof candidate.playerPosition.z === 'number'
      ? {
          x: candidate.playerPosition.x,
          y: Number(candidate.playerPosition.y || 0),
          z: candidate.playerPosition.z,
        }
      : { x: 0, y: 0, z: 22 };

  const rep = Number(candidate.missionProgress?.reputationPoints || 10);
  const rawMp = candidate.missionProgress;
  const validClasses: AcademyClassId[] = ['Class A', 'Class B', 'Class C', 'Class D'];
  const savedChar: CharacterCustomization =
    rawMp?.characterCustomization && typeof rawMp.characterCustomization === 'object'
      ? {
          ...INITIAL_CHARACTER_CUSTOMIZATION,
          ...rawMp.characterCustomization,
          academyClass: validClasses.includes(rawMp.characterCustomization.academyClass)
            ? rawMp.characterCustomization.academyClass
            : 'Class A',
        }
      : structuredClone(INITIAL_CHARACTER_CUSTOMIZATION);

  const missionProgress: MissionProgressState =
    rawMp && typeof rawMp === 'object'
      ? {
          distanceWalked: Number(rawMp.distanceWalked || 0),
          talkedToHana: Boolean(rawMp.talkedToHana),
          inspectedCount: Number(rawMp.inspectedCount || 0),
          interactedIds: Array.isArray(rawMp.interactedIds) ? rawMp.interactedIds : [],
          reputationPoints: rep,
          customMessagesSent: Number(rawMp.customMessagesSent || 0),
          inventoryItems: Array.isArray(rawMp.inventoryItems)
            ? rawMp.inventoryItems
            : ['Hoshino Student ID Card'],
          visitedInterior: Boolean(rawMp.visitedInterior),
          chapterIndex: getCurrentStoryChapter(rep).index,
          completedStoryPackIds: Array.isArray(rawMp.completedStoryPackIds)
            ? rawMp.completedStoryPackIds
            : [],
          discoveredClues: Array.isArray(rawMp.discoveredClues)
            ? rawMp.discoveredClues
            : [
                'Prologue Note: A faded star emblem is carved into the Hoshino Academy main portico.',
              ],
          characterCustomization: savedChar,
          skills:
            rawMp.skills && typeof rawMp.skills === 'object'
              ? { ...INITIAL_PLAYER_SKILLS, ...rawMp.skills }
              : structuredClone(INITIAL_PLAYER_SKILLS),
          cpPoints: typeof rawMp.cpPoints === 'number' ? rawMp.cpPoints : 50,
          ppPoints: typeof rawMp.ppPoints === 'number' ? rawMp.ppPoints : 150,
          classPoints:
            rawMp.classPoints && typeof rawMp.classPoints === 'object'
              ? { ...INITIAL_CLASS_POINTS, ...rawMp.classPoints }
              : structuredClone(INITIAL_CLASS_POINTS),
          activeStoryId:
            typeof rawMp.activeStoryId === 'string' ? rawMp.activeStoryId : 'story_01',
          activePhaseNumber:
            typeof rawMp.activePhaseNumber === 'number' ? rawMp.activePhaseNumber : 1,
          completedPhaseKeys: Array.isArray(rawMp.completedPhaseKeys)
            ? rawMp.completedPhaseKeys
            : [],
          completedStoryIds: Array.isArray(rawMp.completedStoryIds)
            ? rawMp.completedStoryIds
            : [],
          npcRelationships:
            rawMp.npcRelationships && typeof rawMp.npcRelationships === 'object'
              ? { ...createInitialNpcRelationships(), ...rawMp.npcRelationships }
              : createInitialNpcRelationships(),
          customStories: Array.isArray(rawMp.customStories) ? rawMp.customStories : [],
        }
      : structuredClone(INITIAL_MISSION_PROGRESS);

  return {
    id: candidate.id,
    version: typeof candidate.version === 'number' ? candidate.version : 7,
    timestamp: candidate.timestamp,
    chapterTitle: candidate.chapterTitle,
    locationName: candidate.locationName.replace('Classroom 2-A', 'Class A Homeroom'),
    timeOfDay,
    cameraViewpoint,
    playTimeSeconds:
      typeof candidate.playTimeSeconds === 'number' && candidate.playTimeSeconds >= 0
        ? candidate.playTimeSeconds
        : 0,
    playerPosition,
    playerYaw: typeof candidate.playerYaw === 'number' ? candidate.playerYaw : Math.PI,
    missionProgress,
  };
}

/**
 * Validates and merges partial settings with DEFAULT_SETTINGS.
 */
export function sanitizeSettings(raw: unknown): GameSettings {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(DEFAULT_SETTINGS);
  }
  const obj = raw as Record<string, any>;
  const presets: GraphicsPreset[] = ['low', 'medium', 'high'];
  const shadows: ShadowQuality[] = ['off', 'low', 'medium', 'high'];
  const scales: ResolutionScale[] = [0.75, 1.0, 1.25];
  const mobileModes = ['auto', 'always', 'hidden'] as const;

  const preset: GraphicsPreset = presets.includes(obj.graphics?.preset)
    ? obj.graphics.preset
    : DEFAULT_SETTINGS.graphics.preset;
  const shadowQuality: ShadowQuality = shadows.includes(obj.graphics?.shadowQuality)
    ? obj.graphics.shadowQuality
    : DEFAULT_SETTINGS.graphics.shadowQuality;
  const resolutionScale: ResolutionScale = scales.includes(obj.graphics?.resolutionScale)
    ? obj.graphics.resolutionScale
    : DEFAULT_SETTINGS.graphics.resolutionScale;

  const showMobileControls = mobileModes.includes(obj.display?.showMobileControls)
    ? obj.display.showMobileControls
    : DEFAULT_SETTINGS.display.showMobileControls;

  const clampVol = (v: unknown, fallback: number) =>
    typeof v === 'number' && !Number.isNaN(v)
      ? Math.min(100, Math.max(0, Math.round(v)))
      : fallback;

  const sensitivity =
    typeof obj.camera?.sensitivity === 'number' && !Number.isNaN(obj.camera.sensitivity)
      ? Number(Math.min(2.0, Math.max(0.2, obj.camera.sensitivity)).toFixed(2))
      : DEFAULT_SETTINGS.camera.sensitivity;

  return {
    graphics: {
      preset,
      shadowQuality,
      resolutionScale,
    },
    display: {
      fullscreen: Boolean(obj.display?.fullscreen),
      showMobileControls,
    },
    audio: {
      masterVolume: clampVol(obj.audio?.masterVolume, DEFAULT_SETTINGS.audio.masterVolume),
      musicVolume: clampVol(obj.audio?.musicVolume, DEFAULT_SETTINGS.audio.musicVolume),
      sfxVolume: clampVol(obj.audio?.sfxVolume, DEFAULT_SETTINGS.audio.sfxVolume),
      muted: Boolean(obj.audio?.muted),
    },
    camera: {
      sensitivity,
      invertY: Boolean(obj.camera?.invertY),
    },
  };
}

export function mapPhaseToBodyState(phase: GamePhase): string {
  switch (phase) {
    case 'playing':
      return 'playing';
    case 'paused':
      return 'paused';
    case 'character-creation':
    case 'character-intro':
    case 'story-library':
    case 'phase-selection':
      return phase;
    case 'title':
    case 'loading':
    case 'exited':
    default:
      return 'title';
  }
}

export function getNextCameraViewpoint(current: CameraViewpointId): CameraViewpoint {
  const order: CameraViewpointId[] = [
    'courtyard_overview',
    'clock_tower',
    'sakura_avenue',
    'main_gate',
    'rooftop_terrace',
  ];
  const idx = order.indexOf(current);
  const nextId = order[(idx + 1) % order.length];
  return CAMERA_VIEWPOINTS[nextId];
}

export function getNextTimeOfDay(current: TimeOfDayPreset): AtmosphereConfig {
  const order: TimeOfDayPreset[] = ['morning', 'golden_hour', 'twilight'];
  const idx = order.indexOf(current);
  const nextId = order[(idx + 1) % order.length];
  return ATMOSPHERE_PRESETS[nextId];
}

export function getNextSchoolPeriod(current: SchoolPeriodId): SchoolPeriodConfig {
  const order: SchoolPeriodId[] = [
    'homeroom',
    'courtyard_recess',
    'club_activities',
    'after_school',
  ];
  const idx = order.indexOf(current);
  const nextId = order[(idx + 1) % order.length];
  return SCHOOL_PERIODS[nextId];
}

/**
 * Generates an intelligent, context-aware in-character NPC reply in English or Hinglish
 * driven by the NPC's specific Class (Class A, B, C, D), Personality, and Goal.
 */
export function generateSmartNpcReply(params: {
  npcId: string;
  npcName: string;
  npcRole: string;
  playerMessage: string;
  schoolPeriodLabel: string;
  npcMemories?: string[];
}): { reply: string; affinityBonus: number } {
  const { npcId, npcName, npcRole, playerMessage, schoolPeriodLabel, npcMemories = [] } = params;
  const msg = playerMessage.trim();
  const lower = msg.toLowerCase();
  const npcConfig = CAMPUS_INTERACTABLES.find((i) => i.id === npcId);
  const classTag = npcConfig?.academyClass ?? 'Hoshino Academy';
  const personality = npcConfig?.personalityType ?? 'Friendly';

  if (/\b(remember|last time|previous|before|yaad|pichli baar|pehle)\b/i.test(playerMessage) && npcMemories.length > 0) {
    const remembered = npcMemories.slice(-2).join('; ');
    return {
      reply: `Of course, I remember our earlier conversation: ${remembered}. What would you like to explore next?`,
      affinityBonus: 6,
    };
  }

  const isHinglish =
    /\b(kya|kaise|kaisa|kaisi|kaha|kahan|tum|aap|naam|bhai|dost|chalo|batao|accha|theek|haan|nahi|kar|rahe|ho|hai|mera|mujhe|kab|kyu|kyun|aur|sab|badhiya|sensei|sir)\b/i.test(
      lower
    );

  // 1. Project Hoshikaze / Mystery / Archive / Clues
  if (/\b(mystery|project|hoshikaze|archive|clue|emblem|record|secret|cabinet|history|past)\b/i.test(lower)) {
    if (isHinglish) {
      return {
        reply: `Main ${npcName} (${classTag}) hoon—Project Hoshikaze humare Class A, B, C aur D ka joint weather-and-starlight project tha! Library Archive, Train Station aur East Research Dome mein iske clues milenge (+15 XP)!`,
        affinityBonus: 15,
      };
    }
    return {
      reply: `As ${classTag}'s ${npcName}, I can tell you Project Hoshikaze united Class A, B, C, and D! Its records were split between the Library Archive, Train Station, and East Research Centre (+15 XP).`,
      affinityBonus: 15,
    };
  }

  // 2. Class A / Class B / Class C / Class D / Rivalry / Points
  if (/\b(class|points|cp|rank|rivalry|competition|test|quiz|exam)\b/i.test(lower)) {
    if (isHinglish) {
      return {
        reply: `Hoshino Academy mein sirf 4 classes hain: Class A, Class B, Class C aur Class D! Quizzes aur Story Phases complete karke apni class ke liye Class Points (CP) jeeto!`,
        affinityBonus: 14,
      };
    }
    return {
      reply: `At Hoshino Academy, Class A, Class B, Class C, and Class D compete for Class Points (CP) through quizzes, club teamwork, and Story Phases!`,
      affinityBonus: 14,
    };
  }

  // 3. Greetings / How are you (tailored to NPC Personality!)
  if (/\b(hi|hello|hey|namaste|kaise|kaisi|how are you|sup|yo|kem cho)\b/i.test(lower)) {
    if (isHinglish) {
      if (npcId === 'npc_takeda') {
        return {
          reply: `Namaste beta! Class A Homeroom mein swagat hai. Library ke archive records aur Story Phases zaroor complete karna!`,
          affinityBonus: 15,
        };
      }
      if (npcId === 'npc_hana') {
        return {
          reply: `Hello! Main Aiko (Class B Representative) hoon! Chalo Class A Homeroom, Library Archive aur naye Story Phases saath mein dekhte hain!`,
          affinityBonus: 12,
        };
      }
      if (npcId === 'npc_ren') {
        return {
          reply: `Hey bhai! Main Ren (Class A Representative) hoon—North Sports Field aur Class A quiz mein friendly rivalry match ke liye taiyaar ho?`,
          affinityBonus: 12,
        };
      }
      if (npcId === 'npc_aoi') {
        return {
          reply: `Namaste! Main Mika (Class C Representative) hoon—East Wing Library ke archive cabinet mein Project Hoshikaze ka naya clue mila hai!`,
          affinityBonus: 12,
        };
      }
      if (npcId === 'npc_sora') {
        return {
          reply: `Hey! Main Sora (Class D Representative) hoon! East Research Centre Dome aur Aquatics Pool mein Class D ki discoveries dekho!`,
          affinityBonus: 12,
        };
      }
      return {
        reply: `Namaste dost! Main ${npcName} (${classTag} · ${personality}) hoon! Story button se apne 9 phases zaroor check karo!`,
        affinityBonus: 12,
      };
    }

    if (npcId === 'npc_takeda') {
      return {
        reply: `Good day! Welcome to the Class A Homeroom at Hoshino Academy. Whenever you're curious about Project Hoshikaze, check the East Wing Library Archive!`,
        affinityBonus: 15,
      };
    }
    if (npcId === 'npc_hana') {
      return {
        reply: `Hi there! I'm Aiko from Class B! Welcome to Hoshino Academy—have you explored the Class A Homeroom, Library Archive, and Story Library yet?`,
        affinityBonus: 12,
      };
    }
    if (npcId === 'npc_ren') {
      return {
        reply: `Hey! As Class A Representative, I'm always training. Ready for a fair academic quiz or a friendly sprint on the North Athletic Track?`,
        affinityBonus: 12,
      };
    }
    if (npcId === 'npc_aoi') {
      return {
        reply: `Hello! I'm Mika from Class C—I've been sketching the faded star emblem and researching Project Hoshikaze in the East Library!`,
        affinityBonus: 12,
      };
    }
    if (npcId === 'npc_sora') {
      return {
        reply: `Hi! I'm Sora, Class D Representative! Come inspect the weather and starlight instruments inside our East Research Centre Dome!`,
        affinityBonus: 12,
      };
    }
    return {
      reply: `Hey! I'm ${npcName} (${classTag} · ${personality}). Goal right now: ${npcConfig?.currentGoal ?? 'Exploring campus during ' + schoolPeriodLabel}!`,
      affinityBonus: 12,
    };
  }

  // 4. Who are you / Name / Role
  if (/\b(name|naam|who are you|kaun ho|intro|role|goal)\b/i.test(lower)) {
    if (isHinglish) {
      return {
        reply: `Mera naam ${npcName} hai (${npcRole}, Personality: ${personality}). Mera goal hai: ${npcConfig?.currentGoal ?? 'Project Hoshikaze explore karna'}!`,
        affinityBonus: 10,
      };
    }
    return {
      reply: `I'm ${npcName} (${npcRole}, ${personality}). My current goal is: ${npcConfig?.currentGoal ?? 'Uncovering Project Hoshikaze with Classes A–D'}!`,
      affinityBonus: 10,
    };
  }

  // 5. General intelligent response referencing what the player typed & NPC personality
  if (isHinglish) {
    return {
      reply: `Haan, "${msg.slice(0, 42)}" bilkul sahi baat hai! Main (${npcName}, ${classTag}) is baat ko yaad rakhunga—chalo agla Story Phase complete karte hain!`,
      affinityBonus: 12,
    };
  }

  return {
    reply: `That's a thoughtful point about "${msg.slice(0, 44)}"! As someone in ${classTag} (${personality}), I'll remember this as we advance through ${schoolPeriodLabel}!`,
    affinityBonus: 12,
  };
}
