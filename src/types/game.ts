export type GamePhase =
  | 'loading'
  | 'title'
  | 'character-creation'
  | 'character-intro'
  | 'story-library'
  | 'phase-selection'
  | 'playing'
  | 'paused'
  | 'exited';

export type ActiveModal =
  | 'none'
  | 'new-game-confirm'
  | 'profile'
  | 'settings'
  | 'credits'
  | 'exit-confirm';

export type AcademyClassId = 'Class A' | 'Class B' | 'Class C' | 'Class D';

export type PersonalityTrait =
  | 'Calm'
  | 'Intelligent'
  | 'Friendly'
  | 'Confident'
  | 'Competitive'
  | 'Introverted'
  | 'Curious'
  | 'Creative';

export type CharacterOutfitId =
  | 'uniform_blazer'
  | 'summer_vest'
  | 'casual_hoodie'
  | 'sports_tracksuit';

export type CharacterAccessoryId = 'none' | 'glasses' | 'armband' | 'headphones';

export interface CharacterCustomization {
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  academyClass: AcademyClassId;
  faceStyle: number;
  hairStyle: 'spiky' | 'parted' | 'bob' | 'long';
  hairColor: number;
  eyeColor: number;
  skinColor: number;
  heightScale: number;
  bodyScale: number;
  outfit: CharacterOutfitId;
  accessory: CharacterAccessoryId;
  personality: PersonalityTrait;
  hometown: string;
  previousSchool: string;
  reasonForJoining: string;
  personalGoal: string;
}

export interface PlayerSkills {
  academics: number;
  communication: number;
  leadership: number;
  creativity: number;
  sports: number;
  problemSolving: number;
  observation: number;
}

export interface NPCRelationshipState {
  npcId: string;
  friendship: number; // 0 to 100
  trust: number; // 0 to 100
  respect: number; // 0 to 100
  rivalry: number; // 0 to 100
  familiarity: number; // 0 to 100
  memories: string[];
}

export interface StoryPhaseItem {
  id: string;
  phaseNumber: number; // 1 to 9
  title: string;
  description: string;
  location: string;
  themeColor: string;
  mainObjectives: string[];
  optionalObjectives: string[];
  relevantNpcIds: string[];
  rewardXp: number;
  rewardCp: number;
  rewardPp: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  clueReward: string;
}

export interface StoryLibraryItem {
  id: string;
  storyNumber: number;
  title: string;
  subtitle: string;
  description: string;
  themeGradient: string;
  accentColor: string;
  unlockedByDefault?: boolean;
  phases: StoryPhaseItem[];
}

export type GraphicsPreset = 'low' | 'medium' | 'high';
export type ShadowQuality = 'off' | 'low' | 'medium' | 'high';
export type ResolutionScale = 0.75 | 1.0 | 1.25;

export type TimeOfDayPreset = 'morning' | 'golden_hour' | 'twilight';

export type SchoolPeriodId =
  | 'homeroom'
  | 'courtyard_recess'
  | 'club_activities'
  | 'after_school';

export interface SchoolPeriodConfig {
  id: SchoolPeriodId;
  periodNumber: number;
  label: string;
  timeRange: string;
  defaultAtmosphere: TimeOfDayPreset;
  activityHint: string;
}

export type CameraMode = 'follow' | 'overview';

export type CameraViewpointId =
  | 'courtyard_overview'
  | 'clock_tower'
  | 'sakura_avenue'
  | 'main_gate'
  | 'rooftop_terrace';

export interface GraphicsSettings {
  preset: GraphicsPreset;
  shadowQuality: ShadowQuality;
  resolutionScale: ResolutionScale;
}

export interface DisplaySettings {
  fullscreen: boolean;
  showMobileControls: 'auto' | 'always' | 'hidden';
}

export interface AudioSettings {
  masterVolume: number; // 0 to 100
  musicVolume: number; // 0 to 100
  sfxVolume: number; // 0 to 100
  muted: boolean;
}

export interface CameraSettings {
  sensitivity: number; // 0.2 to 2.0
  invertY: boolean;
}

export interface GameSettings {
  graphics: GraphicsSettings;
  display: DisplaySettings;
  audio: AudioSettings;
  camera: CameraSettings;
}

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export type StoryPackKind = 'adventure' | 'quiz' | 'test' | 'event';

export interface StoryDirectorPack {
  id: string;
  kind: StoryPackKind;
  title: string;
  summary: string;
  chapter: string;
  location: string;
  storyText: string;
  unlockAtXp: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  clueReward?: string;
  xpReward?: number;
}

export interface MissionProgressState {
  distanceWalked: number;
  talkedToHana: boolean;
  inspectedCount: number;
  interactedIds: string[];
  reputationPoints: number;
  customMessagesSent?: number;
  inventoryItems?: string[];
  visitedInterior?: boolean;
  chapterIndex?: number;
  completedStoryPackIds?: string[];
  discoveredClues?: string[];
  // V7.0 Extended Progression State
  characterCustomization?: CharacterCustomization;
  skills?: PlayerSkills;
  cpPoints?: number;
  ppPoints?: number;
  classPoints?: Record<AcademyClassId, number>;
  activeStoryId?: string;
  activePhaseNumber?: number;
  completedPhaseKeys?: string[]; // format: `${storyId}:phase_${phaseNumber}`
  completedStoryIds?: string[];
  npcRelationships?: Record<string, NPCRelationshipState>;
  customStories?: StoryLibraryItem[];
}

export interface SaveSlotData {
  id: string;
  version: number;
  timestamp: number;
  chapterTitle: string;
  locationName: string;
  timeOfDay: TimeOfDayPreset;
  cameraViewpoint: CameraViewpointId;
  playTimeSeconds: number;
  playerPosition?: Vector3Tuple;
  playerYaw?: number;
  missionProgress?: MissionProgressState;
}

export interface CameraViewpoint {
  id: CameraViewpointId;
  label: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface AtmosphereConfig {
  id: TimeOfDayPreset;
  label: string;
  timeDisplay: string;
  skyTopColor: string;
  skyHorizonColor: string;
  fogColor: string;
  fogDensity: number;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  windowEmissiveIntensity: number;
  lanternIntensity: number;
}

// ============================================================================
// Autonomous AI NPC Brain, Dialogue & Physics Types
// ============================================================================

export interface DialogueChoice {
  label: string;
  nextLineIndex: number;
  reputationBonus?: number;
}

export interface DialogueLine {
  speaker: string;
  role: string;
  text: string;
  choices?: DialogueChoice[];
}

export interface DialogueChatEntry {
  id: string;
  sender: 'player' | 'npc';
  speakerName: string;
  text: string;
}

export type NpcGreetingAnimationType = 'bow' | 'wave' | 'nod' | 'cheer';

export interface CampusInteractable {
  id: string;
  name: string;
  role: string;
  kind: 'npc' | 'landmark';
  position: Vector3Tuple;
  facingYaw: number;
  interactionRadius: number;
  hairColor: number;
  blazerColor: number;
  accentColor: number;
  gender?: 'male' | 'female';
  academyClass?: AcademyClassId | 'Faculty' | 'Town';
  personalityType?: PersonalityTrait;
  currentGoal?: string;
  longTermGoal?: string;
  emotionalState?: string;
  currentActivity?: string;
  persona?: string;
  greetingText?: string;
  greetingAnim?: NpcGreetingAnimationType;
  patrolWaypoints?: Vector3Tuple[];
  walkSpeed?: number;
  rewardItemName?: string;
  dialogue: DialogueLine[];
}

export interface NPCRuntimeState {
  id: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  waypointIndex: number;
  pauseTimer: number;
  walkPhase: number;
  isMoving: boolean;
  isGreetingPlayer?: boolean;
  greetingAnim?: NpcGreetingAnimationType;
  currentActivity?: string;
  emotionalState?: string;
  talkingWithNpcId?: string | null;
}

export interface AmbientNpcBanter {
  id: string;
  speakerA: string;
  speakerB: string;
  lineA: string;
  lineB: string;
}

export interface AABBCollider2D {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CircleCollider2D {
  id: string;
  x: number;
  z: number;
  radius: number;
}

export interface PlayerPhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  isGrounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  isSprinting: boolean;
  walkPhase: number;
  squashY: number;
  squashXZ: number;
}

export interface IPlayerControllerFoundation {
  readonly isEnabled: boolean;
  readonly spawnPosition: Vector3Tuple;
  readonly facingAngleRad: number;
  initialize(): void;
  dispose(): void;
}

export interface IPhysicsFoundation {
  readonly engineName: 'rapier-foundation';
  readonly gravity: Vector3Tuple;
  readonly isInitialized: boolean;
  stepSimulation(dt: number): void;
}

export interface INPCSystemFoundation {
  readonly registeredCount: number;
  getScheduleSlot(timeOfDay: TimeOfDayPreset): string;
}

export interface IDialogueSystemFoundation {
  readonly isDialogueActive: boolean;
  readonly activeSpeakerId: string | null;
}

export interface IInteractionSystemFoundation {
  readonly interactionRadiusMeters: number;
  readonly focusedTargetId: string | null;
}

export interface IMissionSystemFoundation {
  readonly currentPhaseLabel: string;
  readonly activeObjectives: string[];
}

export interface ISchoolTimetableFoundation {
  readonly currentPeriodName: string;
  readonly bellSchedule: Array<{ time: string; period: string }>;
}

export interface IInventorySystemFoundation {
  readonly capacity: number;
  readonly items: Array<{ id: string; name: string; category: string }>;
}
