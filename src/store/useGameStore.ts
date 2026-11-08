import { create } from 'zustand';
import {
  ActiveModal,
  CameraMode,
  CameraViewpointId,
  CampusInteractable,
  CharacterCustomization,
  DialogueChatEntry,
  EquippedHandItem,
  GamePhase,
  GameSettings,
  GraphicsPreset,
  GuidanceLevel,
  MissionProgressState,
  ObjectiveInteractionType,
  PhaseCompletionSummary,
  ResolutionScale,
  SaveSlotData,
  SchoolPeriodId,
  ShadowQuality,
  StoryDirectorPack,
  StoryLibraryItem,
  TimeOfDayPreset,
} from '../types/game';
import {
  advanceMissionProgress,
  applyGraphicsPreset,
  borrowLibraryBook,
  completeStoryPhaseProgress,
  generateSmartNpcReply,
  getActiveStoryAndPhase,
  getAllStories,
  getCampusZoneLabel,
  getCurrentStoryChapter,
  getDeterministicStoryPack,
  getLoadingMessageForProgress,
  getNextCameraViewpoint,
  getNextSchoolPeriod,
  getNextTimeOfDay,
  getPhaseObjectiveState,
  isInsideSchoolBuilding,
  isPhaseUnlocked,
  isStoryUnlocked,
  mapPhaseToBodyState,
  purchaseCafeteriaMeal,
  readLibraryBook,
  returnLibraryBook,
  toggleCampusDoor,
  validateObjectiveAction,
  validateStoryDirectorPack,
} from '../game/core/rules';
import {
  ActiveObjectModalType,
  ActivePlayerObjectInteraction,
  ContextualPromptCandidate,
  LIBRARY_BOOKS,
  LibraryBookCategory,
  WorldInteractableObject,
} from '../game/systems/ObjectInteractionSystem';
import { SaveLoadManager } from '../game/systems/SaveLoadManager';
import { audioManager } from '../game/systems/AudioManager';
import {
  CAMERA_VIEWPOINTS,
  CAMPUS_INTERACTABLES,
  CANONICAL_STORY_PACKS,
  INITIAL_CHARACTER_CUSTOMIZATION,
  INITIAL_MISSION_PROGRESS,
  SCHOOL_PERIODS,
} from '../config/defaults';
import { sharedInputBridge } from '../game/systems/InputBridge';

export interface ActiveDialogueSession {
  target: CampusInteractable;
  lineIndex: number;
  messages: DialogueChatEntry[];
  isNpcTyping: boolean;
}

function buildPackFromActivePhase(progress: MissionProgressState): StoryDirectorPack {
  const { story, phase } = getActiveStoryAndPhase(progress);
  return {
    id: phase.id,
    kind: phase.phaseNumber % 2 === 0 ? 'quiz' : 'adventure',
    title: `${story.title} · ${phase.title}`,
    summary: phase.description,
    chapter: `${story.subtitle} (${phase.title})`,
    location: phase.location,
    storyText: `${phase.description} Main Objectives: ${phase.mainObjectives.join(' · ')}.`,
    unlockAtXp: 0,
    question: phase.question,
    options: phase.options,
    correctOption: phase.correctOption,
    explanation: phase.explanation,
    clueReward: phase.clueReward,
    xpReward: phase.rewardXp,
  };
}

interface GameStoreState {
  phase: GamePhase;
  activeModal: ActiveModal;
  loadingProgress: number;
  loadingMessage: string;
  sceneReady: boolean;
  savedSlot: SaveSlotData | null;
  settings: GameSettings;
  cameraMode: CameraMode;
  activeViewpoint: CameraViewpointId;
  timeOfDay: TimeOfDayPreset;
  schoolPeriod: SchoolPeriodId;
  hudCollapsed: boolean;
  sessionStartTime: number;

  // V7.0 Story Library, Phase Selection & Gameplay State
  selectedStoryId: string;
  nearbyInteractable: CampusInteractable | null;
  activeDialogue: ActiveDialogueSession | null;
  missionProgress: MissionProgressState;
  isSprintingUI: boolean;
  activeStoryPack: StoryDirectorPack;
  storyModalOpen: boolean;
  storyLoading: boolean;
  lastQuizFeedback: {
    selectedOption: number;
    isCorrect: boolean;
    explanation: string;
  } | null;

  // V8.0 Universal Object Interaction State
  contextualPrompt: ContextualPromptCandidate | null;
  activeObjectInteraction: ActivePlayerObjectInteraction | null;
  activeObjectModal: ActiveObjectModalType;
  selectedBookshelfCategory: LibraryBookCategory | 'All';
  activeReadingBookId: string | null;
  activeReadingPageIndex: number;
  activeNoticeObject: WorldInteractableObject | null;

  // V9.0 Guided Gameplay, Dynamic Hint System & Phase Completion State
  phaseCompletionSummary: PhaseCompletionSummary | null;
  objectiveFeedbackToast: string | null;

  // Actions
  setLoadingProgress: (progress: number) => void;
  markSceneReady: () => void;
  initializeStore: () => Promise<void>;
  setPhase: (phase: GamePhase) => void;
  setActiveModal: (modal: ActiveModal) => void;
  beginNewGameCharacterCreation: () => void;
  updateCharacterCustomization: (partial: Partial<CharacterCustomization>) => void;
  completeCharacterCreation: () => void;
  completeCharacterIntro: () => void;
  openStoryLibrary: () => void;
  selectStoryFromLibrary: (storyId: string) => void;
  startStoryPhase: (storyId: string, phaseNumber: number) => Promise<void>;
  completeCurrentStoryPhase: () => void;
  generateEndlessStory: () => Promise<void>;
  startNewGameSession: () => Promise<void>;
  continueSavedSession: () => void;
  saveCurrentSession: () => Promise<void>;
  returnToMainMenu: () => Promise<void>;

  // Settings actions
  setGraphicsPreset: (preset: GraphicsPreset) => void;
  setShadowQuality: (shadowQuality: ShadowQuality) => void;
  setResolutionScale: (scale: ResolutionScale) => void;
  setFullscreen: (fullscreen: boolean) => Promise<void>;
  setShowMobileControls: (mode: 'auto' | 'always' | 'hidden') => void;
  setGuidanceLevel: (level: GuidanceLevel) => void;
  setMasterVolume: (val: number) => void;
  setMusicVolume: (val: number) => void;
  setSfxVolume: (val: number) => void;
  toggleMute: () => void;
  setCameraSensitivity: (val: number) => void;
  setCameraInvertY: (invert: boolean) => void;
  resetSettingsToDefault: () => void;

  // In-scene & Story Director actions
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;
  setActiveViewpoint: (viewpoint: CameraViewpointId) => void;
  cycleViewpoint: () => void;
  setTimeOfDay: (timeOfDay: TimeOfDayPreset) => void;
  cycleTimeOfDay: () => void;
  cycleSchoolPeriod: () => void;
  toggleHudCollapsed: () => void;
  setNearbyInteractable: (target: CampusInteractable | null) => void;
  openInteractionDialogue: (target?: CampusInteractable) => void;
  selectDialogueChoice: (
    choiceLabel: string,
    nextLineIndex: number,
    reputationBonus?: number
  ) => void;
  sendCustomDialogueMessage: (playerMessage: string) => Promise<void>;
  advanceOrCloseDialogue: () => void;
  closeDialogue: () => void;
  recordMovementDistance: (distanceDelta: number) => void;
  recordInteriorVisit: () => void;
  teleportToZone: (x: number, z: number, yaw?: number) => void;
  claimHonorDiploma: () => void;
  setIsSprintingUI: (sprinting: boolean) => void;
  setStoryModalOpen: (open: boolean) => void;
  submitStoryPackAnswer: (optionIndex: number) => void;
  requestNextStoryDirectorPack: () => Promise<void>;

  // V8.0 Universal Object Interaction Actions
  setContextualPrompt: (prompt: ContextualPromptCandidate | null) => void;
  triggerContextualInteraction: () => void;
  exitObjectInteraction: () => void;
  setActiveObjectModal: (modal: ActiveObjectModalType) => void;
  setSelectedBookshelfCategory: (cat: LibraryBookCategory | 'All') => void;
  borrowBook: (bookId: string) => void;
  openBookReader: (bookId: string) => void;
  setReadingPage: (pageIdx: number) => void;
  returnBook: (bookId: string) => void;
  orderCafeteriaMeal: (itemId: string) => boolean;
  toggleDoor: (doorId: string) => void;
  completeComputerLabActivity: () => void;
  completeScienceMicroscopeActivity: () => void;

  // V9.0 Guided Objective Engine Actions
  setEquippedHandItem: (item: EquippedHandItem) => void;
  notifyObjectiveEvent: (action: {
    type: ObjectiveInteractionType;
    targetId?: string;
    zoneName?: string;
    distanceToTarget?: number;
  }) => void;
  closePhaseCompletionModal: (continueToNextPhase?: boolean) => void;
}

function syncBodyDataset(phase: GamePhase): void {
  if (typeof document !== 'undefined' && document.body) {
    document.body.dataset.state = mapPhaseToBodyState(phase);
  }
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialSettings = SaveLoadManager.loadSettings();
  audioManager.updateSettings(initialSettings.audio);
  const initialMission = structuredClone(INITIAL_MISSION_PROGRESS);

  return {
    phase: 'loading',
    activeModal: 'none',
    loadingProgress: 20,
    loadingMessage: getLoadingMessageForProgress(20),
    sceneReady: false,
    savedSlot: null,
    settings: initialSettings,
    cameraMode: 'follow',
    activeViewpoint: 'courtyard_overview',
    timeOfDay: 'golden_hour',
    schoolPeriod: 'courtyard_recess',
    hudCollapsed: false,
    sessionStartTime: Date.now(),

    selectedStoryId: 'story_01',
    nearbyInteractable: null,
    activeDialogue: null,
    missionProgress: initialMission,
    isSprintingUI: false,
    activeStoryPack: buildPackFromActivePhase(initialMission),
    storyModalOpen: false,
    storyLoading: false,
    lastQuizFeedback: null,

    contextualPrompt: null,
    activeObjectInteraction: null,
    activeObjectModal: 'none',
    selectedBookshelfCategory: 'All',
    activeReadingBookId: null,
    activeReadingPageIndex: 0,
    activeNoticeObject: null,
    phaseCompletionSummary: null,
    objectiveFeedbackToast: null,

    setLoadingProgress: (progress: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(progress)));
      set({
        loadingProgress: clamped,
        loadingMessage: getLoadingMessageForProgress(clamped),
      });
    },

    markSceneReady: () => {
      set({ sceneReady: true });
    },

    initializeStore: async () => {
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : null;
      const isAutostart = params?.get('autostart') === '1';
      const currentPhase = get().phase;
      const targetPhase: GamePhase =
        currentPhase === 'loading' ? (isAutostart ? 'playing' : 'title') : currentPhase;

      syncBodyDataset(targetPhase);
      if (targetPhase === 'playing') {
        audioManager.startBgm(get().timeOfDay);
      }
      set({
        loadingProgress: 100,
        loadingMessage: getLoadingMessageForProgress(100),
        phase: targetPhase,
        sessionStartTime: Date.now(),
      });

      const savedSlot = await SaveLoadManager.loadPrimarySave();
      if (savedSlot) {
        const mp = savedSlot.missionProgress ?? structuredClone(INITIAL_MISSION_PROGRESS);
        mp.characterCustomization = {
          ...structuredClone(INITIAL_CHARACTER_CUSTOMIZATION),
          ...(mp.characterCustomization ?? {}),
          academyClass: 'Class D',
        };
        const pack = buildPackFromActivePhase(mp);
        set({
          savedSlot,
          missionProgress: mp,
          selectedStoryId: mp.activeStoryId ?? 'story_01',
          activeStoryPack: pack,
        });
      }
    },

    setPhase: (phase: GamePhase) => {
      syncBodyDataset(phase);
      if (phase === 'playing') {
        audioManager.startBgm(get().timeOfDay);
      }
      set({ phase, activeModal: 'none' });
    },

    setActiveModal: (modal: ActiveModal) => {
      set({ activeModal: modal });
    },

    beginNewGameCharacterCreation: () => {
      audioManager.playConfirmChime();
      const freshMission = structuredClone(INITIAL_MISSION_PROGRESS);
      sharedInputBridge.playerX = 0;
      sharedInputBridge.playerY = 0;
      sharedInputBridge.playerZ = 22;
      sharedInputBridge.playerYaw = 0;
      syncBodyDataset('character-creation');
      set({
        phase: 'character-creation',
        activeModal: 'none',
        missionProgress: freshMission,
        selectedStoryId: 'story_01',
        activeStoryPack: buildPackFromActivePhase(freshMission),
        lastQuizFeedback: null,
        activeDialogue: null,
      });
    },

    updateCharacterCustomization: (partial: Partial<CharacterCustomization>) => {
      const curMp = get().missionProgress;
      const curCustom =
        curMp.characterCustomization ?? structuredClone(INITIAL_CHARACTER_CUSTOMIZATION);
      const updatedCustom: CharacterCustomization = {
        ...curCustom,
        ...partial,
      };
      const nextMp: MissionProgressState = {
        ...curMp,
        characterCustomization: updatedCustom,
      };
      set({ missionProgress: nextMp });
    },

    completeCharacterCreation: () => {
      audioManager.playConfirmChime();
      syncBodyDataset('character-intro');
      set({
        phase: 'character-intro',
        activeModal: 'none',
      });
      void get().saveCurrentSession();
    },

    completeCharacterIntro: () => {
      audioManager.playConfirmChime();
      syncBodyDataset('story-library');
      set({
        phase: 'story-library',
        activeModal: 'none',
      });
      void get().saveCurrentSession();
    },

    openStoryLibrary: () => {
      audioManager.playClick();
      syncBodyDataset('story-library');
      set({
        phase: 'story-library',
        activeModal: 'none',
        storyModalOpen: false,
      });
    },

    selectStoryFromLibrary: (storyId: string) => {
      const mp = get().missionProgress;
      const allStories = getAllStories(mp.customStories ?? []);
      if (!isStoryUnlocked(storyId, mp.completedStoryIds ?? [], allStories)) {
        audioManager.playCancel();
        return;
      }
      audioManager.playClick();
      syncBodyDataset('phase-selection');
      set({
        selectedStoryId: storyId,
        phase: 'phase-selection',
        activeModal: 'none',
      });
    },

    startStoryPhase: async (storyId: string, phaseNumber: number) => {
      const mp = get().missionProgress;
      const allStories = getAllStories(mp.customStories ?? []);
      if (
        !isPhaseUnlocked(
          storyId,
          phaseNumber,
          mp.completedPhaseKeys ?? [],
          mp.completedStoryIds ?? [],
          allStories
        )
      ) {
        audioManager.playCancel();
        return;
      }

      audioManager.playConfirmChime();
      audioManager.startBgm(get().timeOfDay);
      sharedInputBridge.playerYaw = Math.PI;

      const updatedMp: MissionProgressState = {
        ...mp,
        activeStoryId: storyId,
        activePhaseNumber: phaseNumber,
      };
      const objState = getPhaseObjectiveState(updatedMp, allStories);
      updatedMp.activeObjectiveId = objState.activeObjective?.id ?? null;
      const pack = buildPackFromActivePhase(updatedMp);

      syncBodyDataset('playing');
      set({
        phase: 'playing',
        activeModal: 'none',
        selectedStoryId: storyId,
        missionProgress: updatedMp,
        activeStoryPack: pack,
        lastQuizFeedback: null,
        storyModalOpen: false,
        phaseCompletionSummary: null,
        objectiveFeedbackToast: null,
        cameraMode: 'follow',
        sessionStartTime: Date.now(),
      });
      await get().saveCurrentSession();
    },

    completeCurrentStoryPhase: () => {
      // V9.0 Strict Sequential Rule: Phase completion only happens when all phase objectives are validated!
      const mp = get().missionProgress;
      const allStories = getAllStories(mp.customStories ?? []);
      const objState = getPhaseObjectiveState(mp, allStories);
      if (!objState.isPhaseAllObjectivesComplete) {
        audioManager.playCancel();
        set({
          objectiveFeedbackToast: objState.activeObjective
            ? `Complete current objective first: ${objState.activeObjective.shortHint}`
            : 'Complete all phase objectives in sequence first.',
        });
        return;
      }
      const storyId = mp.activeStoryId ?? 'story_01';
      const phaseNum = mp.activePhaseNumber ?? 1;
      audioManager.playConfirmChime();

      const nextMp = completeStoryPhaseProgress(mp, storyId, phaseNum, allStories);
      const nextPack = buildPackFromActivePhase(nextMp);

      set({
        missionProgress: nextMp,
        selectedStoryId: nextMp.activeStoryId ?? storyId,
        activeStoryPack: nextPack,
      });
      void get().saveCurrentSession();
    },

    generateEndlessStory: async () => {
      const mp = get().missionProgress;
      const customStories = [...(mp.customStories ?? [])];
      const nextStoryNumber = 9 + customStories.length;
      const storyId = `story_0${nextStoryNumber}`;
      audioManager.playConfirmChime();

      const newStory: StoryLibraryItem = {
        id: storyId,
        storyNumber: nextStoryNumber,
        title: `Chronicle ${nextStoryNumber}: Starlight Horizon`,
        subtitle: `Story 0${nextStoryNumber} · AI Story Director Chronicle`,
        description:
          'A newly generated Hoshino Academy adventure uniting Class A, Class B, Class C, and Class D across the Observatory Dome, Town Station, and Mountain Shrine.',
        themeGradient: 'from-indigo-600 via-purple-700 to-slate-900',
        accentColor: '#38bdf8',
        unlockedByDefault: true,
        phases: Array.from({ length: 9 }, (_, i) => {
          const pNum = i + 1;
          return {
            id: `${storyId}_phase_${pNum}`,
            phaseNumber: pNum,
            title: `Phase 0${pNum}: Starlight Discovery ${pNum}`,
            description: `Collaborate with Aiko, Ren, Mika, and Sora in Phase 0${pNum} of Chronicle ${nextStoryNumber}.`,
            location:
              pNum % 3 === 0
                ? 'Hoshino Research Centre & Dome'
                : pNum % 2 === 0
                  ? 'Library & Archive Room'
                  : 'Hoshino Academy Courtyard',
            themeColor: '#38bdf8',
            mainObjectives: [
              `Explore campus during Phase 0${pNum}`,
              `Coordinate with Class A–D representatives`,
              `Complete the Phase 0${pNum} discovery checkpoint`,
            ],
            optionalObjectives: [`Earn bonus Class Points for ${mp.characterCustomization?.academyClass ?? 'Class A'}`],
            relevantNpcIds: ['npc_hana', 'npc_ren', 'npc_aoi', 'npc_sora'],
            rewardXp: 40 + pNum * 5,
            rewardCp: 25 + pNum * 3,
            rewardPp: 80 + pNum * 10,
            question: `In Phase 0${pNum} of Chronicle ${nextStoryNumber}, how do Classes A, B, C, and D advance the Starlight Horizon archive?`,
            options: [
              'Through collaborative research, fair rivalry, and verified campus clues',
              'By abandoning the academy',
              'By locking all classrooms',
              'By skipping every club activity',
            ],
            correctOption: 0,
            explanation: 'Teamwork across all four classes unlocks the next sequential phase of Starlight Horizon!',
            clueReward: `Chronicle ${nextStoryNumber} · Starlight Clue #${pNum}`,
          };
        }),
      };

      const nextMp: MissionProgressState = {
        ...mp,
        customStories: [...customStories, newStory],
      };
      set({
        missionProgress: nextMp,
        selectedStoryId: newStory.id,
      });
      await get().saveCurrentSession();
    },

    startNewGameSession: async () => {
      audioManager.playConfirmChime();
      audioManager.startBgm('golden_hour');
      const now = Date.now();
      const freshMission = structuredClone(INITIAL_MISSION_PROGRESS);
      sharedInputBridge.playerX = 0;
      sharedInputBridge.playerY = 0;
      sharedInputBridge.playerZ = 22;
      sharedInputBridge.playerYaw = Math.PI;

      const optimisticSave: SaveSlotData = {
        id: 'slot_primary',
        version: 7,
        timestamp: now,
        chapterTitle: 'Story 01 · Phase 01: First Day at Hoshino',
        locationName: 'Hoshino Academy Courtyard',
        timeOfDay: 'golden_hour',
        cameraViewpoint: 'courtyard_overview',
        playTimeSeconds: 0,
        playerPosition: { x: 0, y: 0, z: 22 },
        playerYaw: Math.PI,
        missionProgress: freshMission,
      };

      syncBodyDataset('playing');
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      set({
        savedSlot: optimisticSave,
        phase: 'playing',
        activeModal: 'none',
        cameraMode: 'follow',
        activeViewpoint: 'courtyard_overview',
        timeOfDay: 'golden_hour',
        schoolPeriod: 'courtyard_recess',
        missionProgress: freshMission,
        selectedStoryId: 'story_01',
        activeStoryPack: buildPackFromActivePhase(freshMission),
        lastQuizFeedback: null,
        activeDialogue: null,
        sessionStartTime: now,
      });

      await SaveLoadManager.savePrimarySlot({
        version: 7,
        timestamp: now,
        chapterTitle: optimisticSave.chapterTitle,
        locationName: optimisticSave.locationName,
        timeOfDay: optimisticSave.timeOfDay,
        cameraViewpoint: optimisticSave.cameraViewpoint,
        playTimeSeconds: 0,
        playerPosition: optimisticSave.playerPosition,
        playerYaw: optimisticSave.playerYaw,
        missionProgress: freshMission,
      });
    },

    continueSavedSession: () => {
      const saved = get().savedSlot;
      if (!saved) return;
      audioManager.playConfirmChime();
      audioManager.startBgm(saved.timeOfDay);
      syncBodyDataset('playing');
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (saved.playerPosition) {
        sharedInputBridge.playerX = saved.playerPosition.x;
        sharedInputBridge.playerY = saved.playerPosition.y;
        sharedInputBridge.playerZ = saved.playerPosition.z;
      }
      if (typeof saved.playerYaw === 'number') {
        sharedInputBridge.playerYaw = saved.playerYaw;
      }

      const mp = saved.missionProgress ?? structuredClone(INITIAL_MISSION_PROGRESS);
      set({
        phase: 'playing',
        activeModal: 'none',
        cameraMode: 'follow',
        activeViewpoint: saved.cameraViewpoint,
        timeOfDay: saved.timeOfDay,
        missionProgress: mp,
        selectedStoryId: mp.activeStoryId ?? 'story_01',
        activeStoryPack: buildPackFromActivePhase(mp),
        activeDialogue: null,
        sessionStartTime: Date.now(),
      });
    },

    saveCurrentSession: async () => {
      const state = get();
      const elapsedSec = Math.max(
        0,
        Math.round((Date.now() - state.sessionStartTime) / 1000)
      );
      const prevPlayTime = state.savedSlot?.playTimeSeconds ?? 0;
      const now = Date.now();
      const { story, phase } = getActiveStoryAndPhase(state.missionProgress);

      const optimistic: SaveSlotData = {
        id: 'slot_primary',
        version: 7,
        timestamp: now,
        chapterTitle: `${story.title} · ${phase.title}`,
        locationName:
          state.cameraMode === 'follow'
            ? getCampusZoneLabel(sharedInputBridge.playerX, sharedInputBridge.playerZ)
            : CAMERA_VIEWPOINTS[state.activeViewpoint].label,
        timeOfDay: state.timeOfDay,
        cameraViewpoint: state.activeViewpoint,
        playTimeSeconds: prevPlayTime + elapsedSec,
        playerPosition: {
          x: Number(sharedInputBridge.playerX.toFixed(2)),
          y: Number(sharedInputBridge.playerY.toFixed(2)),
          z: Number(sharedInputBridge.playerZ.toFixed(2)),
        },
        playerYaw: Number(sharedInputBridge.playerYaw.toFixed(2)),
        missionProgress: state.missionProgress,
      };

      set({
        savedSlot: optimistic,
        sessionStartTime: now,
      });

      await SaveLoadManager.savePrimarySlot({
        version: 7,
        timestamp: now,
        chapterTitle: optimistic.chapterTitle,
        locationName: optimistic.locationName,
        timeOfDay: optimistic.timeOfDay,
        cameraViewpoint: optimistic.cameraViewpoint,
        playTimeSeconds: optimistic.playTimeSeconds,
        playerPosition: optimistic.playerPosition,
        playerYaw: optimistic.playerYaw,
        missionProgress: optimistic.missionProgress,
      });
    },

    returnToMainMenu: async () => {
      audioManager.playCancel();
      syncBodyDataset('title');
      set({
        phase: 'title',
        activeModal: 'none',
        activeDialogue: null,
      });
      await get().saveCurrentSession();
    },

    setGraphicsPreset: (preset: GraphicsPreset) => {
      const current = get().settings;
      const graphics = applyGraphicsPreset(preset);
      const next: GameSettings = { ...current, graphics };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setShadowQuality: (shadowQuality: ShadowQuality) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        graphics: { ...current.graphics, shadowQuality },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setResolutionScale: (resolutionScale: ResolutionScale) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        graphics: { ...current.graphics, resolutionScale },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setFullscreen: async (fullscreen: boolean) => {
      if (typeof document !== 'undefined') {
        try {
          if (fullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          } else if (!fullscreen && document.fullscreenElement) {
            await document.exitFullscreen();
          }
        } catch {
          // Ignore fullscreen error in embedded WebView/iframe
        }
      }
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        display: { ...current.display, fullscreen },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setShowMobileControls: (showMobileControls: 'auto' | 'always' | 'hidden') => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        display: { ...current.display, showMobileControls },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setGuidanceLevel: (guidanceLevel: GuidanceLevel) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        display: { ...current.display, guidanceLevel },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setMasterVolume: (masterVolume: number) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        audio: {
          ...current.audio,
          masterVolume: Math.min(100, Math.max(0, Math.round(masterVolume))),
        },
      };
      audioManager.updateSettings(next.audio);
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setMusicVolume: (musicVolume: number) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        audio: {
          ...current.audio,
          musicVolume: Math.min(100, Math.max(0, Math.round(musicVolume))),
        },
      };
      audioManager.updateSettings(next.audio);
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setSfxVolume: (sfxVolume: number) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        audio: {
          ...current.audio,
          sfxVolume: Math.min(100, Math.max(0, Math.round(sfxVolume))),
        },
      };
      audioManager.updateSettings(next.audio);
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    toggleMute: () => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        audio: {
          ...current.audio,
          muted: !current.audio.muted,
        },
      };
      audioManager.updateSettings(next.audio);
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setCameraSensitivity: (sensitivity: number) => {
      const current = get().settings;
      const clamped = Number(Math.min(2.0, Math.max(0.2, sensitivity)).toFixed(2));
      const next: GameSettings = {
        ...current,
        camera: { ...current.camera, sensitivity: clamped },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    setCameraInvertY: (invertY: boolean) => {
      const current = get().settings;
      const next: GameSettings = {
        ...current,
        camera: { ...current.camera, invertY },
      };
      SaveLoadManager.saveSettings(next);
      set({ settings: next });
    },

    resetSettingsToDefault: () => {
      const fresh = SaveLoadManager.loadSettings();
      const defaults: GameSettings = {
        graphics: applyGraphicsPreset('high'),
        display: {
          fullscreen: fresh.display.fullscreen,
          showMobileControls: 'always',
          guidanceLevel: 'standard',
        },
        audio: { masterVolume: 80, musicVolume: 70, sfxVolume: 85, muted: false },
        camera: { sensitivity: 1.0, invertY: false },
      };
      audioManager.updateSettings(defaults.audio);
      SaveLoadManager.saveSettings(defaults);
      set({ settings: defaults });
    },

    setCameraMode: (cameraMode: CameraMode) => {
      audioManager.playClick();
      set({ cameraMode });
    },

    toggleCameraMode: () => {
      const nextMode: CameraMode = get().cameraMode === 'follow' ? 'overview' : 'follow';
      audioManager.playClick();
      set({ cameraMode: nextMode });
    },

    setActiveViewpoint: (activeViewpoint: CameraViewpointId) => {
      audioManager.playClick();
      set({ activeViewpoint, cameraMode: 'overview' });
      if (get().phase === 'playing') {
        void get().saveCurrentSession();
      }
    },

    cycleViewpoint: () => {
      const next = getNextCameraViewpoint(get().activeViewpoint);
      get().setActiveViewpoint(next.id);
    },

    setTimeOfDay: (timeOfDay: TimeOfDayPreset) => {
      audioManager.playClick();
      audioManager.setBgmMood(timeOfDay);
      set({ timeOfDay });
      if (get().phase === 'playing') {
        void get().saveCurrentSession();
      }
    },

    cycleTimeOfDay: () => {
      const next = getNextTimeOfDay(get().timeOfDay);
      get().setTimeOfDay(next.id);
    },

    cycleSchoolPeriod: () => {
      const nextPeriod = getNextSchoolPeriod(get().schoolPeriod);
      audioManager.playConfirmChime();
      audioManager.setBgmMood(nextPeriod.defaultAtmosphere);
      set({
        schoolPeriod: nextPeriod.id,
        timeOfDay: nextPeriod.defaultAtmosphere,
      });
      if (get().phase === 'playing') {
        void get().saveCurrentSession();
      }
    },

    toggleHudCollapsed: () => {
      audioManager.playClick();
      set((s) => ({ hudCollapsed: !s.hudCollapsed }));
    },

    setNearbyInteractable: (nearbyInteractable: CampusInteractable | null) => {
      if (get().nearbyInteractable?.id !== nearbyInteractable?.id) {
        set({ nearbyInteractable });
      }
    },

    openInteractionDialogue: (explicitTarget?: CampusInteractable) => {
      let target = explicitTarget ?? get().nearbyInteractable;
      if (!target) {
        let bestDist = Infinity;
        for (const item of CAMPUS_INTERACTABLES) {
          const d = Math.hypot(
            sharedInputBridge.playerX - item.position.x,
            sharedInputBridge.playerZ - item.position.z
          );
          if (d < bestDist) {
            bestDist = d;
            target = item;
          }
        }
      }
      if (!target) return;
      audioManager.playDialogueBlip();
      const firstLine = target.dialogue[0];
      const nextMission = advanceMissionProgress(get().missionProgress, {
        interactedId: target.id,
        rewardItemName: target.rewardItemName,
      });
      set({
        activeDialogue: {
          target,
          lineIndex: 0,
          messages: [
            {
              id: `msg_${Date.now()}_0`,
              sender: 'npc',
              speakerName: target.name,
              text: firstLine?.text ?? `Hello! I'm ${target.name}.`,
            },
          ],
          isNpcTyping: false,
        },
        missionProgress: nextMission,
      });
      get().notifyObjectiveEvent({ type: 'talk_npc', targetId: target.id });
      void get().saveCurrentSession();
    },

    selectDialogueChoice: (
      choiceLabel: string,
      nextLineIndex: number,
      reputationBonus?: number
    ) => {
      const active = get().activeDialogue;
      if (!active) return;
      audioManager.playDialogueBlip();
      const nextMission = advanceMissionProgress(get().missionProgress, {
        interactedId: active.target.id,
        reputationDelta: reputationBonus ?? 10,
      });

      const targetLine =
        active.target.dialogue[nextLineIndex] ??
        active.target.dialogue[active.target.dialogue.length - 1];

      const updatedMessages: DialogueChatEntry[] = [
        ...active.messages,
        {
          id: `msg_${Date.now()}_p`,
          sender: 'player',
          speakerName: 'You',
          text: choiceLabel,
        },
        ...(targetLine
          ? [
              {
                id: `msg_${Date.now()}_n`,
                sender: 'npc' as const,
                speakerName: active.target.name,
                text: targetLine.text,
              },
            ]
          : []),
      ];

      set({
        activeDialogue: {
          ...active,
          lineIndex: Math.min(nextLineIndex, active.target.dialogue.length - 1),
          messages: updatedMessages,
        },
        missionProgress: nextMission,
      });
      // A conversation counts once when it is opened, not once per reply/choice.
    },

    sendCustomDialogueMessage: async (playerMessage: string) => {
      const trimmed = playerMessage.trim();
      const active = get().activeDialogue;
      if (!trimmed || !active || active.isNpcTyping) return;

      audioManager.playClick();
      const playerEntry: DialogueChatEntry = {
        id: `msg_${Date.now()}_user`,
        sender: 'player',
        speakerName: 'You',
        text: trimmed,
      };

      const historySnapshot = [...active.messages, playerEntry];
      set({
        activeDialogue: {
          ...active,
          messages: historySnapshot,
          isNpcTyping: true,
        },
      });

      const periodLabel = SCHOOL_PERIODS[get().schoolPeriod].label;
      const smartFallback = generateSmartNpcReply({
        npcId: active.target.id,
        npcName: active.target.name,
        npcRole: active.target.role,
        playerMessage: trimmed,
        schoolPeriodLabel: periodLabel,
      });

      let replyText = smartFallback.reply;
      let bonus = smartFallback.affinityBonus;

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 1600);
        const res = await fetch('/api/npc-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            npcId: active.target.id,
            npcName: active.target.name,
            npcRole: active.target.role,
            npcPersona: active.target.persona,
            playerMessage: trimmed,
            schoolPeriod: periodLabel,
            history: historySnapshot.slice(-6).map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          }),
        });
        window.clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = (await res.json()) as {
            reply?: string;
            affinityBonus?: number;
          };
          if (data.reply && data.reply.trim().length > 0) {
            replyText = data.reply.trim();
          }
          if (typeof data.affinityBonus === 'number') {
            bonus = data.affinityBonus;
          }
        } else {
          await new Promise((resolve) => window.setTimeout(resolve, 240));
        }
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 240));
      }

      audioManager.playDialogueBlip();
      const currentActive = get().activeDialogue;
      if (!currentActive || currentActive.target.id !== active.target.id) return;

      const nextMission = advanceMissionProgress(get().missionProgress, {
        interactedId: active.target.id,
        reputationDelta: bonus,
        customMessageSent: true,
        customMessageText: trimmed,
        rewardItemName: active.target.rewardItemName,
      });

      set({
        activeDialogue: {
          ...currentActive,
          messages: [
            ...currentActive.messages,
            {
              id: `msg_${Date.now()}_npc`,
              sender: 'npc',
              speakerName: active.target.name,
              text: replyText,
            },
          ],
          isNpcTyping: false,
        },
        missionProgress: nextMission,
      });
      // Sending additional messages in the same chat cannot satisfy later phases.
      void get().saveCurrentSession();
    },

    advanceOrCloseDialogue: () => {
      const active = get().activeDialogue;
      if (!active) return;
      const nextIdx = active.lineIndex + 1;
      if (nextIdx >= active.target.dialogue.length) {
        audioManager.playCancel();
        set({ activeDialogue: null });
        void get().saveCurrentSession();
      } else {
        audioManager.playDialogueBlip();
        const nextLine = active.target.dialogue[nextIdx];
        set({
          activeDialogue: {
            ...active,
            lineIndex: nextIdx,
            messages: [
              ...active.messages,
              {
                id: `msg_${Date.now()}_line_${nextIdx}`,
                sender: 'npc',
                speakerName: active.target.name,
                text: nextLine.text,
              },
            ],
          },
        });
      }
    },

    closeDialogue: () => {
      audioManager.playCancel();
      set({ activeDialogue: null });
      void get().saveCurrentSession();
    },

    recordMovementDistance: (distanceDelta: number) => {
      if (distanceDelta <= 0) return;
      const nextMission = advanceMissionProgress(get().missionProgress, {
        distanceDelta,
      });
      set({ missionProgress: nextMission });

      // Check if active sequential objective is an 'enter_zone' trigger
      const allStories = getAllStories(nextMission.customStories ?? []);
      const objState = getPhaseObjectiveState(nextMission, allStories);
      if (objState.activeObjective?.requiredInteractionType === 'enter_zone') {
        const targetPos = objState.activeObjective.targetPosition;
        const dist = Math.hypot(
          sharedInputBridge.playerX - targetPos.x,
          sharedInputBridge.playerZ - targetPos.z
        );
        const zoneLabel = getCampusZoneLabel(
          sharedInputBridge.playerX,
          sharedInputBridge.playerZ
        );
        if (dist <= 7.5) {
          get().notifyObjectiveEvent({
            type: 'enter_zone',
            zoneName: zoneLabel,
            distanceToTarget: dist,
          });
        }
      }
    },

    recordInteriorVisit: () => {
      if (get().missionProgress.visitedInterior) return;
      const nextMission = advanceMissionProgress(get().missionProgress, {
        enteredInterior: true,
      });
      set({ missionProgress: nextMission });
      void get().saveCurrentSession();
    },

    teleportToZone: (x: number, z: number, yaw = Math.PI) => {
      sharedInputBridge.teleportRequest = { x, z, yaw };
      sharedInputBridge.playerX = x;
      sharedInputBridge.playerY = 0;
      sharedInputBridge.playerZ = z;
      sharedInputBridge.playerYaw = yaw;
      const inside = isInsideSchoolBuilding(x, z);
      const nextMission = inside
        ? advanceMissionProgress(get().missionProgress, { enteredInterior: true })
        : get().missionProgress;
      set({
        cameraMode: 'follow',
        missionProgress: nextMission,
        activeObjectInteraction: null,
        activeObjectModal: 'none',
      });
      const zoneLabel = getCampusZoneLabel(x, z);
      const allStories = getAllStories(nextMission.customStories ?? []);
      const objState = getPhaseObjectiveState(nextMission, allStories);
      if (objState.activeObjective?.requiredInteractionType === 'enter_zone') {
        const dist = Math.hypot(
          x - objState.activeObjective.targetPosition.x,
          z - objState.activeObjective.targetPosition.z
        );
        get().notifyObjectiveEvent({
          type: 'enter_zone',
          zoneName: zoneLabel,
          distanceToTarget: dist,
        });
      }
      void get().saveCurrentSession();
    },

    claimHonorDiploma: () => {
      audioManager.playConfirmChime();
      const current = get().missionProgress;
      const alreadyClaimed = current.inventoryItems?.includes('Hoshikaze Archive Medal');
      const nextMission = advanceMissionProgress(current, {
        reputationDelta: alreadyClaimed ? 10 : 50,
        rewardItemName: 'Hoshikaze Archive Medal',
        enteredInterior: true,
      });
      set({ missionProgress: nextMission });
      void get().saveCurrentSession();
    },

    setIsSprintingUI: (isSprintingUI: boolean) => {
      if (get().isSprintingUI !== isSprintingUI) {
        set({ isSprintingUI });
      }
    },

    setStoryModalOpen: (storyModalOpen: boolean) => {
      if (storyModalOpen) {
        audioManager.playClick();
      } else {
        audioManager.playCancel();
      }
      set({ storyModalOpen });
    },

    submitStoryPackAnswer: (optionIndex: number) => {
      const pack = get().activeStoryPack;
      const isCorrect = optionIndex === pack.correctOption;
      if (isCorrect) {
        audioManager.playConfirmChime();
        set({
          lastQuizFeedback: {
            selectedOption: optionIndex,
            isCorrect: true,
            explanation: pack.explanation,
          },
        });
      } else {
        audioManager.playDialogueBlip();
        set({
          lastQuizFeedback: {
            selectedOption: optionIndex,
            isCorrect: false,
            explanation: `Not quite! Hint: ${pack.explanation}`,
          },
        });
      }
    },

    requestNextStoryDirectorPack: async () => {
      const state = get();
      if (state.storyLoading) return;
      audioManager.playClick();

      const mp = state.missionProgress;
      const xp = mp.reputationPoints;
      const completedIds = mp.completedStoryPackIds ?? [];
      const { story, phase } = getActiveStoryAndPhase(mp);
      const location = getCampusZoneLabel(
        sharedInputBridge.playerX,
        sharedInputBridge.playerZ
      );
      const fallbackPack = buildPackFromActivePhase(mp);

      set({ storyLoading: true, lastQuizFeedback: null });

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 1800);
        const res = await fetch('/api/story-director', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            xp,
            chapter: `${story.title} · ${phase.title}`,
            location,
            completedStoryPackIds: completedIds,
            discoveredClues: mp.discoveredClues ?? [],
          }),
        });
        window.clearTimeout(timeoutId);

        if (res.ok) {
          const data = (await res.json()) as { pack?: unknown };
          const validated = validateStoryDirectorPack(data.pack, xp, completedIds);
          set({
            activeStoryPack: validated,
            storyLoading: false,
            lastQuizFeedback: null,
          });
          return;
        }
      } catch {
        // Fall through to active phase pack
      }

      set({
        activeStoryPack: fallbackPack,
        storyLoading: false,
        lastQuizFeedback: null,
      });
    },

    setContextualPrompt: (prompt: ContextualPromptCandidate | null) => {
      const cur = get().contextualPrompt;
      if (cur?.id === prompt?.id && cur?.actionVerb === prompt?.actionVerb) {
        return;
      }
      set({ contextualPrompt: prompt });
    },

    triggerContextualInteraction: () => {
      const state = get();
      // If currently sitting/studying/eating with no modal open, pressing E stands up
      if (state.activeObjectInteraction && state.activeObjectModal === 'none') {
        get().exitObjectInteraction();
        return;
      }

      const prompt = state.contextualPrompt;
      if (!prompt) {
        if (state.nearbyInteractable) {
          get().openInteractionDialogue(state.nearbyInteractable);
        }
        return;
      }

      if (prompt.sourceKind === 'npc' && prompt.npcTarget) {
        get().openInteractionDialogue(prompt.npcTarget);
        return;
      }

      const obj = prompt.objectTarget;
      if (!obj) return;

      if (obj.objectType === 'door') {
        get().toggleDoor(obj.id);
        return;
      }

      audioManager.playConfirmChime();

      let nextMp = advanceMissionProgress(state.missionProgress, {
        interactedId: obj.id,
        reputationDelta: obj.xpReward ?? 10,
      });

      // Equip notebook in hand when studying at a desk if no book is equipped
      if (
        obj.defaultPosture === 'study' &&
        (!nextMp.equippedHandItem || nextMp.equippedHandItem === 'none')
      ) {
        nextMp = { ...nextMp, equippedHandItem: 'notebook' };
      }

      let nextObjectInteraction: ActivePlayerObjectInteraction | null =
        state.activeObjectInteraction;

      if (obj.defaultPosture && obj.defaultPosture !== 'none') {
        const anchor = obj.anchorPosition ?? obj.position;
        const yaw = obj.anchorYaw ?? 0;
        // NOTE: Do NOT set sharedInputBridge.teleportRequest here so AcademyCanvas smoothly glides
        // the player onto the chair/desk without snapping the camera yaw!
        nextObjectInteraction = {
          objectId: obj.id,
          label: obj.label,
          objectType: obj.objectType,
          posture: obj.defaultPosture,
          anchorPosition: anchor,
          anchorYaw: yaw,
          startedAt: Date.now(),
        };
      }

      const nextModal: ActiveObjectModalType = obj.opensModal ?? 'none';
      const nextCat: LibraryBookCategory | 'All' =
        obj.bookshelfCategory ?? state.selectedBookshelfCategory;

      set({
        missionProgress: nextMp,
        activeObjectInteraction: nextObjectInteraction,
        activeObjectModal: nextModal,
        selectedBookshelfCategory: nextCat,
        activeNoticeObject: nextModal === 'notice_reader' ? obj : null,
      });

      // Validate against active sequential objective based on object type / posture
      if (obj.objectType === 'computer') {
        get().notifyObjectiveEvent({ type: 'use_computer', targetId: obj.id });
      } else if (obj.objectType === 'microscope') {
        get().notifyObjectiveEvent({ type: 'use_microscope', targetId: obj.id });
      } else if (
        obj.defaultPosture === 'sit' ||
        obj.defaultPosture === 'study' ||
        obj.defaultPosture === 'eat'
      ) {
        get().notifyObjectiveEvent({ type: 'sit_object', targetId: obj.id });
      } else if (
        obj.objectType === 'notice_board' ||
        obj.objectType === 'blackboard' ||
        obj.objectType === 'locker' ||
        obj.objectType === 'map_board'
      ) {
        get().notifyObjectiveEvent({ type: 'inspect_object', targetId: obj.id });
      }

      void get().saveCurrentSession();
    },

    exitObjectInteraction: () => {
      audioManager.playCancel();
      const curMp = get().missionProgress;
      const nextEquipped: EquippedHandItem =
        curMp.equippedHandItem === 'notebook'
          ? (curMp.borrowedBookIds?.length ?? 0) > 0
            ? 'book'
            : 'none'
          : curMp.equippedHandItem ?? 'none';
      set({
        missionProgress: {
          ...curMp,
          equippedHandItem: nextEquipped,
        },
        activeObjectInteraction: null,
        activeObjectModal: 'none',
        activeReadingBookId: null,
        activeNoticeObject: null,
      });
    },

    setActiveObjectModal: (modal: ActiveObjectModalType) => {
      if (modal === 'none') {
        audioManager.playCancel();
      } else {
        audioManager.playClick();
      }
      set({ activeObjectModal: modal });
    },

    setSelectedBookshelfCategory: (selectedBookshelfCategory: LibraryBookCategory | 'All') => {
      audioManager.playClick();
      set({ selectedBookshelfCategory });
    },

    borrowBook: (bookId: string) => {
      audioManager.playConfirmChime();
      const book = LIBRARY_BOOKS.find((b) => b.id === bookId);
      const nextMp = borrowLibraryBook(get().missionProgress, bookId);
      set({ missionProgress: nextMp });
      get().notifyObjectiveEvent({
        type: 'borrow_book',
        targetId: book?.shelfId ?? bookId,
      });
      void get().saveCurrentSession();
    },

    openBookReader: (bookId: string) => {
      audioManager.playConfirmChime();
      const book = LIBRARY_BOOKS.find((b) => b.id === bookId);
      if (!book) return;
      const nextMp = readLibraryBook(get().missionProgress, bookId);
      set({
        missionProgress: nextMp,
        activeReadingBookId: bookId,
        activeReadingPageIndex: 0,
        activeObjectModal: 'book_reader',
        activeObjectInteraction: get().activeObjectInteraction ?? {
          objectId: `reading_${bookId}`,
          label: book.title,
          objectType: 'bookshelf',
          posture: 'read',
          anchorPosition: {
            x: sharedInputBridge.playerX,
            y: sharedInputBridge.playerY,
            z: sharedInputBridge.playerZ,
          },
          anchorYaw: sharedInputBridge.playerYaw,
          startedAt: Date.now(),
        },
      });
      get().notifyObjectiveEvent({ type: 'read_book', targetId: bookId });
      void get().saveCurrentSession();
    },

    setReadingPage: (pageIdx: number) => {
      audioManager.playClick();
      set({ activeReadingPageIndex: Math.max(0, pageIdx) });
    },

    returnBook: (bookId: string) => {
      audioManager.playConfirmChime();
      const nextMp = returnLibraryBook(get().missionProgress, bookId);
      set({
        missionProgress: nextMp,
        activeReadingBookId:
          get().activeReadingBookId === bookId ? null : get().activeReadingBookId,
      });
      get().notifyObjectiveEvent({ type: 'return_book', targetId: bookId });
      void get().saveCurrentSession();
    },

    orderCafeteriaMeal: (itemId: string) => {
      const { nextProgress, purchased } = purchaseCafeteriaMeal(
        get().missionProgress,
        itemId
      );
      if (!purchased) {
        audioManager.playCancel();
        return false;
      }
      audioManager.playConfirmChime();
      // Smoothly transition player to sitting and eating at the cafeteria table with bento in hand
      const eatAnchor = { x: -26.2, y: 0, z: 3.8 };

      set({
        missionProgress: nextProgress,
        activeObjectModal: 'none',
        activeObjectInteraction: {
          objectId: 'obj_cafeteria_seat_north',
          label: 'Cafeteria Dining Seat (Having Lunch)',
          objectType: 'cafeteria_seat',
          posture: 'eat',
          anchorPosition: eatAnchor,
          anchorYaw: -Math.PI / 2,
          startedAt: Date.now(),
        },
      });
      get().notifyObjectiveEvent({
        type: 'purchase_food',
        targetId: 'obj_cafeteria_counter',
      });
      void get().saveCurrentSession();
      return true;
    },

    toggleDoor: (doorId: string) => {
      audioManager.playClick();
      const nextMp = toggleCampusDoor(get().missionProgress, doorId);
      set({ missionProgress: nextMp });
      get().notifyObjectiveEvent({ type: 'open_door', targetId: doorId });
      void get().saveCurrentSession();
    },

    completeComputerLabActivity: () => {
      audioManager.playConfirmChime();
      const curMp = get().missionProgress;
      const nextMp = advanceMissionProgress(curMp, {
        interactedId: 'computer_lab_coding_challenge',
        reputationDelta: 25,
        clueUnlocked: 'Computer Lab Digital Archive Index',
      });
      if (nextMp.skills) {
        nextMp.skills.problemSolving = Math.min(100, nextMp.skills.problemSolving + 4);
        nextMp.skills.academics = Math.min(100, nextMp.skills.academics + 3);
      }
      set({ missionProgress: nextMp });
      get().notifyObjectiveEvent({
        type: 'use_computer',
        targetId: 'obj_computer_lab_terminal',
      });
      void get().saveCurrentSession();
    },

    completeScienceMicroscopeActivity: () => {
      audioManager.playConfirmChime();
      const curMp = get().missionProgress;
      const nextMp = advanceMissionProgress(curMp, {
        interactedId: 'science_lab_microscope_analysis',
        reputationDelta: 20,
        clueUnlocked: 'Science Lab Optical Chronometer Calibration Log',
      });
      if (nextMp.skills) {
        nextMp.skills.observation = Math.min(100, nextMp.skills.observation + 4);
        nextMp.skills.academics = Math.min(100, nextMp.skills.academics + 2);
      }
      set({ missionProgress: nextMp });
      get().notifyObjectiveEvent({
        type: 'use_microscope',
        targetId: 'obj_science_lab_microscope',
      });
      void get().saveCurrentSession();
    },

    setEquippedHandItem: (item: EquippedHandItem) => {
      audioManager.playClick();
      const curMp = get().missionProgress;
      set({
        missionProgress: {
          ...curMp,
          equippedHandItem: item,
        },
      });
    },

    notifyObjectiveEvent: (action) => {
      const curMp = get().missionProgress;
      const allStories = getAllStories(curMp.customStories ?? []);
      const result = validateObjectiveAction(curMp, action, allStories);

      if (!result.matched) {
        if (result.clarificationMessage && action.type !== 'enter_zone') {
          set({ objectiveFeedbackToast: result.clarificationMessage });
        }
        return;
      }

      audioManager.playConfirmChime();
      const nextPack = buildPackFromActivePhase(result.nextProgress);
      const toastText = result.completedObjective
        ? `✓ Objective Complete: ${result.completedObjective.title} (+${result.completedObjective.rewardXp} XP)`
        : null;

      set({
        missionProgress: result.nextProgress,
        selectedStoryId: result.nextProgress.activeStoryId ?? curMp.activeStoryId ?? 'story_01',
        activeStoryPack: nextPack,
        objectiveFeedbackToast: toastText,
        phaseCompletionSummary:
          result.phaseJustCompleted && result.phaseCompletionSummary
            ? result.phaseCompletionSummary
            : get().phaseCompletionSummary,
      });

      void get().saveCurrentSession();
    },

    closePhaseCompletionModal: (continueToNextPhase = true) => {
      const summary = get().phaseCompletionSummary;
      audioManager.playConfirmChime();
      set({
        phaseCompletionSummary: null,
        objectiveFeedbackToast: null,
      });

      if (!continueToNextPhase && summary) {
        syncBodyDataset('phase-selection');
        set({
          phase: 'phase-selection',
          selectedStoryId: summary.storyId,
          activeModal: 'none',
        });
      }
      void get().saveCurrentSession();
    },
  };
});

