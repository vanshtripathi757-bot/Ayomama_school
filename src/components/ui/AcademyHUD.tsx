import React, { useEffect, useRef, useState } from 'react';
import {
  ATMOSPHERE_PRESETS,
  CAMERA_VIEWPOINTS,
  SCHOOL_PERIODS,
} from '../../config/defaults';
import {
  getCampusZoneLabel,
  getPhaseObjectiveState,
  getCurrentStoryChapter,
  getSkyWeatherDescription,
  getStudentAcademicRank,
} from '../../game/core/rules';
import { audioManager } from '../../game/systems/AudioManager';
import {
  resetMobileInputBridge,
  setMobileJoystick,
  setMobileSprintHeld,
  sharedInputBridge,
  triggerMobileInteract,
  triggerMobileJump,
  triggerMobileSprintToggle,
} from '../../game/systems/InputBridge';
import {
  CAFETERIA_MENU_ITEMS,
  LIBRARY_BOOKS,
  LibraryBookCategory,
} from '../../game/systems/ObjectInteractionSystem';
import { useGameStore } from '../../store/useGameStore';
import { CameraViewpointId, CharacterCustomization } from '../../types/game';

const BOOK_CATEGORIES: Array<LibraryBookCategory | 'All'> = [
  'All',
  'Fiction',
  'Science',
  'Mathematics',
  'History',
  'Literature',
  'Reference',
];

const CAMPUS_DIRECTORY_LOCATIONS: Array<{
  id: string;
  name: string;
  zone: string;
  x: number;
  z: number;
  yaw: number;
}> = [
  { id: 'loc_gate', name: 'Main Entrance & Security Booth', zone: 'Main Gate', x: -5.2, z: 33.4, yaw: -Math.PI / 2 },
  { id: 'loc_lobby', name: 'Main Academic Building Lobby', zone: '1F Central', x: 0, z: -14.2, yaw: Math.PI },
  { id: 'loc_class_a', name: 'Class A Classroom', zone: '1F West Wing', x: -14.2, z: -13.6, yaw: Math.PI },
  { id: 'loc_class_b', name: 'Class B Classroom', zone: '1F South-West Wing', x: -20.5, z: -1.4, yaw: Math.PI },
  { id: 'loc_class_c', name: 'Class C Classroom', zone: '1F South-East Wing', x: 20.5, z: -1.4, yaw: Math.PI },
  { id: 'loc_class_d', name: 'Class D Classroom', zone: '1F Far-West Wing', x: -29.5, z: -14.2, yaw: Math.PI },
  { id: 'loc_library', name: 'Multi-Section Academy Library', zone: '1F East Wing', x: 14.2, z: -19.0, yaw: Math.PI },
  { id: 'loc_comp_lab', name: 'Computer & Robotics Lab', zone: '1F Far-East Wing', x: 30.5, z: -14.5, yaw: Math.PI },
  { id: 'loc_sci_lab', name: 'Science Lab & Research Dome', zone: 'East Campus', x: 52.5, z: -20.2, yaw: Math.PI },
  { id: 'loc_cafe', name: 'West Cafeteria Pavilion', zone: 'West Campus', x: -28.8, z: 8.0, yaw: -Math.PI / 2 },
  { id: 'loc_auditorium', name: 'Auditorium & Amphitheater', zone: 'North-West', x: -66.0, z: -17.0, yaw: Math.PI },
  { id: 'loc_gym', name: 'East Gymnasium & Pool', zone: 'East Campus', x: 28.5, z: 8.0, yaw: Math.PI / 2 },
  { id: 'loc_dorm', name: '4-Story Student Dormitory', zone: 'North-West', x: -33.8, z: -34.5, yaw: -Math.PI / 2 },
  { id: 'loc_town', name: 'South Town Commercial District', zone: 'Open World', x: -13.0, z: 58.0, yaw: -Math.PI / 2 },
  { id: 'loc_station', name: 'Hoshino Commuter Train Station', zone: 'Open World', x: -8.0, z: 91.2, yaw: 0 },
  { id: 'loc_shrine', name: 'North Mountain Torii Shrine', zone: 'Open World', x: 0, z: -78.0, yaw: Math.PI },
];

export function AcademyHUD() {
  const phase = useGameStore((s) => s.phase);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const activeModal = useGameStore((s) => s.activeModal);
  const activeViewpoint = useGameStore((s) => s.activeViewpoint);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const schoolPeriod = useGameStore((s) => s.schoolPeriod);
  const muted = useGameStore((s) => s.settings.audio.muted);
  const showMobileControls = useGameStore((s) => s.settings.display.showMobileControls);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const activeDialogue = useGameStore((s) => s.activeDialogue);
  const missionProgress = useGameStore((s) => s.missionProgress);
  const isSprintingUI = useGameStore((s) => s.isSprintingUI);
  const phaseCompletionSummary = useGameStore((s) => s.phaseCompletionSummary);

  const setPhase = useGameStore((s) => s.setPhase);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveViewpoint = useGameStore((s) => s.setActiveViewpoint);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const returnToMainMenu = useGameStore((s) => s.returnToMainMenu);
  const openInteractionDialogue = useGameStore((s) => s.openInteractionDialogue);
  const selectDialogueChoice = useGameStore((s) => s.selectDialogueChoice);
  const sendCustomDialogueMessage = useGameStore((s) => s.sendCustomDialogueMessage);
  const closeDialogue = useGameStore((s) => s.closeDialogue);
  const claimHonorDiploma = useGameStore((s) => s.claimHonorDiploma);
  const setIsSprintingUI = useGameStore((s) => s.setIsSprintingUI);
  const closePhaseCompletionModal = useGameStore((s) => s.closePhaseCompletionModal);

  // V8.0 Universal Object Interaction State & Actions
  const contextualPrompt = useGameStore((s) => s.contextualPrompt);
  const activeObjectInteraction = useGameStore((s) => s.activeObjectInteraction);
  const activeObjectModal = useGameStore((s) => s.activeObjectModal);
  const selectedBookshelfCategory = useGameStore((s) => s.selectedBookshelfCategory);
  const activeReadingBookId = useGameStore((s) => s.activeReadingBookId);
  const activeReadingPageIndex = useGameStore((s) => s.activeReadingPageIndex);
  const activeNoticeObject = useGameStore((s) => s.activeNoticeObject);

  const triggerContextualInteraction = useGameStore((s) => s.triggerContextualInteraction);
  const exitObjectInteraction = useGameStore((s) => s.exitObjectInteraction);
  const setActiveObjectModal = useGameStore((s) => s.setActiveObjectModal);
  const setSelectedBookshelfCategory = useGameStore((s) => s.setSelectedBookshelfCategory);
  const borrowBook = useGameStore((s) => s.borrowBook);
  const openBookReader = useGameStore((s) => s.openBookReader);
  const setReadingPage = useGameStore((s) => s.setReadingPage);
  const returnBook = useGameStore((s) => s.returnBook);
  const orderCafeteriaMeal = useGameStore((s) => s.orderCafeteriaMeal);
  const completeComputerLabActivity = useGameStore((s) => s.completeComputerLabActivity);
  const completeScienceMicroscopeActivity = useGameStore(
    (s) => s.completeScienceMicroscopeActivity
  );
  const teleportToZone = useGameStore((s) => s.teleportToZone);
  const updateCharacterCustomization = useGameStore((s) => s.updateCharacterCustomization);

  // Lab activity feedback states
  const [labActivityToast, setLabActivityToast] = useState<string | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  // Upper-Right Unified Hub Drawer state (keeps the main screen 100% clean when closed)
  const [hubOpen, setHubOpen] = useState(false);

  // Compact Virtual Joystick visual knob state (px offset from center, max 26px)
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickPointerIdRef = useRef<number | null>(null);

  // Custom typed message state for NPC chat
  const [customMessageInput, setCustomMessageInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (phase === 'playing') audioManager.startBgm(timeOfDay);
  }, [phase, timeOfDay]);

  // Auto-scroll chat history when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeDialogue?.messages.length, activeDialogue?.isNpcTyping]);

  // Keyboard shortcuts during active session (disabled when typing in an input)
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'paused') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement | null;
      const isTypingInInput =
        targetEl?.tagName === 'INPUT' || targetEl?.tagName === 'TEXTAREA';

      if (activeModal !== 'none') {
        if (e.code === 'Escape') {
          setActiveModal('none');
        }
        return;
      }

      if (activeObjectModal !== 'none') {
        if (e.code === 'Escape') {
          e.preventDefault();
          exitObjectInteraction();
        }
        return;
      }

      if (activeDialogue) {
        if (e.code === 'Escape') {
          e.preventDefault();
          closeDialogue();
        }
        return;
      }

      if (isTypingInInput) return;

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (activeObjectInteraction) {
          e.preventDefault();
          exitObjectInteraction();
          return;
        }
        e.preventDefault();
        audioManager.playClick();
        setPhase(phase === 'playing' ? 'paused' : 'playing');
      } else if (phase === 'playing') {
        if (
          (e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'Enter') &&
          (contextualPrompt || nearbyInteractable || activeObjectInteraction)
        ) {
          e.preventDefault();
          triggerContextualInteraction();
        } else if (e.code === 'KeyC') {
          setCameraMode(cameraMode === 'follow' ? 'overview' : 'follow');
        } else if (e.code === 'KeyH') {
          setHubOpen((v) => !v);
        } else if (e.code === 'KeyM') {
          toggleMute();
        } else if (e.code === 'Digit1') {
          setActiveViewpoint('courtyard_overview');
        } else if (e.code === 'Digit2') {
          setActiveViewpoint('clock_tower');
        } else if (e.code === 'Digit3') {
          setActiveViewpoint('sakura_avenue');
        } else if (e.code === 'Digit4') {
          setActiveViewpoint('main_gate');
        } else if (e.code === 'Digit5') {
          setActiveViewpoint('rooftop_terrace');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    phase,
    cameraMode,
    activeModal,
    activeObjectModal,
    activeObjectInteraction,
    activeDialogue,
    contextualPrompt,
    nearbyInteractable,
    setPhase,
    setCameraMode,
    setActiveModal,
    toggleMute,
    setActiveViewpoint,
    triggerContextualInteraction,
    exitObjectInteraction,
    closeDialogue,
  ]);

  // Reset mobile joystick if phase changes or dialogue opens
  useEffect(() => {
    if (phase !== 'playing' || activeDialogue !== null) {
      setKnobOffset({ x: 0, y: 0 });
      resetMobileInputBridge();
      setMobileSprintHeld(false);
      setIsSprintingUI(false);
    }
  }, [phase, activeDialogue, setIsSprintingUI]);

  if (phase !== 'playing' && phase !== 'paused') return null;

  const atmo = ATMOSPHERE_PRESETS[timeOfDay];
  const periodCfg = SCHOOL_PERIODS[schoolPeriod];
  const viewpointList = Object.values(CAMERA_VIEWPOINTS);
  const currentZoneName = getCampusZoneLabel(
    sharedInputBridge.playerX,
    sharedInputBridge.playerZ
  );
  const skyWeatherLabel = getSkyWeatherDescription(
    timeOfDay,
    Math.floor(missionProgress.distanceWalked * 2)
  );

  // Live, sequential mission guidance is derived only from validated gameplay objectives.
  const activeChapter = getCurrentStoryChapter(missionProgress.reputationPoints);
  const objectiveState = getPhaseObjectiveState(missionProgress);
  const activeObjective = objectiveState.activeObjective;
  const discoveredClues = missionProgress.discoveredClues ?? [];
  const latestClue = discoveredClues.length > 0 ? discoveredClues[discoveredClues.length - 1] : null;
  const playerClass =
    missionProgress.characterCustomization?.academyClass ?? 'Class A';
  const walkMeters = Math.min(20, Math.floor(missionProgress.distanceWalked));
  const objInteriorOrWalkDone =
    Boolean(missionProgress.visitedInterior) || missionProgress.distanceWalked >= 20;
  const objHanaOrTakedaDone = missionProgress.talkedToHana;
  const customSentCount = missionProgress.customMessagesSent ?? 0;
  const objChatDone = customSentCount >= 1 || missionProgress.inspectedCount >= 2;
  const completedCount =
    (objInteriorOrWalkDone ? 1 : 0) +
    (objHanaOrTakedaDone ? 1 : 0) +
    (objChatDone ? 1 : 0);
  const inventoryItems = missionProgress.inventoryItems ?? ['Hoshino Student ID Card'];
  const discoveredClues = missionProgress.discoveredClues ?? [
    'Prologue Note: A faded star emblem is carved into the Hoshino Academy main portico.',
  ];

  // Determine whether mobile touch controls should be rendered
  const shouldRenderMobileControls =
    showMobileControls === 'always' ||
    (showMobileControls === 'auto' &&
      typeof window !== 'undefined' &&
      (window.innerWidth < 1024 || 'ontouchstart' in window));

  // Compact Virtual Joystick pointer handlers
  const updateJoystickFromClientPoint = (clientX: number, clientY: number) => {
    const el = joystickBaseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = 26;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const visualX = Math.cos(angle) * clampedDist;
    const visualY = Math.sin(angle) * clampedDist;
    setKnobOffset({ x: visualX, y: visualY });

    const normX = clampedDist < 4 ? 0 : visualX / maxRadius;
    const normY = clampedDist < 4 ? 0 : -visualY / maxRadius;
    setMobileJoystick(normX, normY, clampedDist >= 4);
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    audioManager.startBgm(timeOfDay);
    e.currentTarget.setPointerCapture(e.pointerId);
    joystickPointerIdRef.current = e.pointerId;
    updateJoystickFromClientPoint(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    updateJoystickFromClientPoint(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    joystickPointerIdRef.current = null;
    setKnobOffset({ x: 0, y: 0 });
    setMobileJoystick(0, 0, false);
  };

  const handleCustomMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customMessageInput.trim()) return;
    const msg = customMessageInput;
    setCustomMessageInput('');
    void sendCustomDialogueMessage(msg);
  };

  const speakLatestNpcMessage = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const latestNpcMessage = [...(activeDialogue?.messages ?? [])]
      .reverse()
      .find((message) => message.sender === 'npc');
    if (!latestNpcMessage) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestNpcMessage.text);
    utterance.lang = /[\\u0900-\\u097F]/.test(latestNpcMessage.text) ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
  };

  const dialogueInteractable = activeDialogue?.target ?? null;
  const currentDialogueLine =
    dialogueInteractable && activeDialogue
      ? dialogueInteractable.dialogue[activeDialogue.lineIndex]
      : null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between select-none">
      {/* Clean top bar: no rotating NPC message banners. */}
      <div className="w-full px-3 pt-2.5 flex items-start justify-end gap-2">
        {/* Upper-Right Profile, Campus Map and Menu Buttons */}
        <div className="pointer-events-auto relative flex items-center gap-1.5">
          <button
            type="button"
            data-testid="top-right-profile-btn"
            onClick={() => {
              audioManager.playClick();
              setHubOpen(false);
              setActiveModal('profile');
            }}
            className="min-h-[34px] px-2.5 py-1 rounded bg-[#0a101f]/80 hover:bg-[#16223d] border border-sky-400/50 text-xs font-semibold text-sky-200 shadow-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>👤 {playerClass}</span>
          </button>

          <button
            type="button"
            data-testid="top-right-map-btn"
            onClick={() => {
              audioManager.playClick();
              setHubOpen(false);
              setActiveModal('none');
              setActiveObjectModal('campus_map');
            }}
            className="min-h-[34px] px-2.5 py-1 rounded bg-[#0a101f]/80 hover:bg-[#16223d] border border-emerald-400/50 text-xs font-semibold text-emerald-200 shadow-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>🗺️ Map</span>
          </button>

          <button
            type="button"
            data-testid="top-right-hub-btn"
            onClick={() => {
              audioManager.playClick();
              audioManager.startBgm(timeOfDay);
              setHubOpen((v) => !v);
            }}
            className="min-h-[34px] px-3 py-1 rounded bg-[#0a101f]/75 hover:bg-[#16223d] border border-indigo-400/45 text-xs font-semibold text-slate-100 shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{hubOpen ? '✕ Close' : '☰ Menu'}</span>
            <span className="font-mono text-[10px] text-amber-300">
              {completedCount}/3
            </span>
          </button>
        </div>
      </div>

      {/* Persistent objective clue: replaces the removed rotating NPC message banner. */}
      {phase === 'playing' && !activeDialogue && (
        <div
          data-testid="active-objective-clue"
          className="pointer-events-none absolute top-14 left-3 z-10 w-[min(72vw,300px)] rounded-xl border border-amber-300/45 bg-[#071225]/90 px-3 py-2.5 text-slate-100 shadow-xl backdrop-blur-sm"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-amber-300">
            <span>Current Mission · Phase {String(missionProgress.activePhaseNumber ?? 1).padStart(2, '0')}</span>
            <span>{objectiveState.completedCount}/{objectiveState.totalObjectives}</span>
          </div>
          {activeObjective ? (
            <>
              <div className="mt-1 text-xs font-bold text-white">{activeObjective.title}</div>
              <div className="mt-1 text-[11px] leading-snug text-sky-100">CLUE: {activeObjective.shortHint}</div>
              <div className="mt-1 text-[10px] text-slate-400">Target: {activeObjective.targetName} · {activeObjective.targetLocationName}</div>
            </>
          ) : (
            <div className="mt-1 text-xs font-semibold text-emerald-200">All mission objectives completed.</div>
          )}
          {latestClue && <div className="mt-1.5 border-t border-slate-700/70 pt-1 text-[10px] leading-snug text-amber-100/90">ARCHIVE CLUE: {latestClue}</div>}
        </div>
      )}

      {phaseCompletionSummary && (
        <div className="fixed inset-0 z-40 pointer-events-auto flex items-center justify-center bg-[#030713]/85 px-4 py-6">
          <div data-testid="phase-completion-modal" role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-emerald-400/50 bg-[#091629] p-5 text-slate-100 shadow-2xl">
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Verified Mission Complete</div>
            <h2 className="mt-2 font-display text-xl font-bold text-white">{phaseCompletionSummary.phaseTitle}</h2>
            <p className="mt-2 text-sm text-slate-300">All {phaseCompletionSummary.tasksCompletedCount} required objectives were completed in sequence.</p>
            <p className="mt-3 text-xs text-amber-200">Rewards: +{phaseCompletionSummary.rewardXp} XP · +{phaseCompletionSummary.rewardCp} CP · +{phaseCompletionSummary.rewardPp} PP</p>
            {phaseCompletionSummary.nextPhaseTitle && <p className="mt-2 text-xs text-sky-200">Next: {phaseCompletionSummary.nextPhaseTitle}</p>}
            <button type="button" onClick={() => closePhaseCompletionModal(true)} className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500">Continue</button>
          </div>
        </div>
      )}

      {/* Upper-Right Expandable Menu Panel (Cleanly Organized · No Manual Weather or Teleport Cheats) */}
      {hubOpen && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto"
          onClick={() => setHubOpen(false)}
        >
          <div
            data-testid="top-right-hub-panel"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-3 w-72 sm:w-80 max-h-[82vh] overflow-y-auto rounded-lg bg-[#091020]/92 border border-indigo-400/45 p-3 shadow-2xl text-xs text-slate-100 space-y-2.5"
          >
            {/* 1. Header: Current Zone + Audio BGM/SFX, Settings & Pause */}
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 truncate">
                  {currentZoneName}
                </div>
                <div className="font-display text-sm font-semibold text-white">
                  Hoshino Academy · {atmo.timeDisplay}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  data-testid="hub-mute-btn"
                  onClick={() => toggleMute()}
                  className="px-2 py-1 rounded bg-[#131e36] hover:bg-[#1c2c4e] border border-slate-700 text-[11px] text-amber-200 cursor-pointer"
                >
                  {muted ? '🔇 Muted' : '♪ BGM On'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHubOpen(false);
                    setActiveModal('settings');
                  }}
                  className="px-2 py-1 rounded bg-[#131e36] hover:bg-[#1c2c4e] border border-slate-700 text-[11px] text-slate-200 cursor-pointer"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHubOpen(false);
                    setPhase(phase === 'paused' ? 'playing' : 'paused');
                  }}
                  className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] font-semibold text-white cursor-pointer"
                >
                  Pause
                </button>
              </div>
            </div>

            {/* 2. Read-Only Live Sky & Weather Cycle Status */}
            <div
              data-testid="sky-weather-status"
              className="rounded bg-[#0d182e]/85 border border-sky-400/30 px-2.5 py-1.5 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
                  Live Sky &amp; Weather Cycle
                </div>
                <div className="text-[11px] font-medium text-slate-100 truncate">
                  {skyWeatherLabel}
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-200 shrink-0">
                {periodCfg.label.split('·')[1]?.trim() ?? periodCfg.label}
              </span>
            </div>

            {/* 3. Hoshino Academy Chapter Arc, Objectives & Story Chronicle Button */}
            <div
              data-testid="mission-tracker-card"
              className="rounded bg-[#0d162c]/80 border border-slate-700/70 p-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                <span className="truncate">{activeChapter.title}</span>
                <span className="font-mono text-amber-300 shrink-0">
                  XP {missionProgress.reputationPoints}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 leading-snug">
                {activeChapter.objectiveSummary}
              </div>
              <div className="flex items-center justify-between text-[11px] bg-indigo-950/60 border border-indigo-400/25 rounded px-2 py-0.5">
                <span className="font-semibold text-amber-200 truncate">
                  🎓 {getStudentAcademicRank(missionProgress.reputationPoints).rankTitle}
                </span>
                <span className="font-mono text-[10px] text-emerald-300 shrink-0">
                  GPA {getStudentAcademicRank(missionProgress.reputationPoints).gpa}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span
                  className={
                    objInteriorOrWalkDone ? 'text-emerald-300 line-through' : 'text-slate-200'
                  }
                >
                  {objInteriorOrWalkDone ? '✓ ' : '• '}Explore Hoshino Campus / Interior
                </span>
                <span className="font-mono text-slate-400">
                  {missionProgress.visitedInterior ? 'Inside' : `${walkMeters}/20m`}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span
                  className={
                    objHanaOrTakedaDone ? 'text-emerald-300 line-through' : 'text-slate-200'
                  }
                >
                  {objHanaOrTakedaDone ? '✓ ' : '• '}Meet Aiko or Sensei Takeda
                </span>
                <span className="font-mono text-slate-400">
                  {objHanaOrTakedaDone ? 'Done' : 'Chat'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className={objChatDone ? 'text-emerald-300 line-through' : 'text-slate-200'}>
                  {objChatDone ? '✓ ' : '• '}Build Trust with Classmates
                </span>
                <span className="font-mono text-slate-400">
                  {customSentCount > 0 ? `${customSentCount} sent` : `${missionProgress.inspectedCount}/2`}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-300 flex justify-between">
                <span>Archive Clues ({discoveredClues.length}) · Bag ({inventoryItems.length}):</span>
                <span className="font-mono text-indigo-200 truncate">
                  {inventoryItems[inventoryItems.length - 1]}
                </span>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  data-testid="claim-diploma-btn"
                  onClick={() => claimHonorDiploma()}
                  className="w-full py-2 px-2 rounded bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-[11px] text-center cursor-pointer transition-colors truncate"
                >
                  {inventoryItems.includes('Hoshikaze Archive Medal')
                    ? '🏆 Medal Claimed'
                    : '🏆 Archive Medal (+50 XP)'}
                </button>
              </div>
            </div>

            {/* 4. Nearby Person Status (Only shows the single nearby person if in range) */}
            {nearbyInteractable && (
              <div className="space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Nearby Classmate / Landmark
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHubOpen(false);
                    openInteractionDialogue(nearbyInteractable);
                  }}
                  className="w-full px-2.5 py-1.5 rounded bg-emerald-900/70 hover:bg-emerald-700/80 border border-emerald-400/50 text-left text-[11px] font-semibold text-white cursor-pointer truncate"
                >
                  💬 Chat with {nearbyInteractable.name}
                </button>
              </div>
            )}

            {/* 5. Camera Mode & Scenic Viewpoints */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Camera Viewpoints
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setCameraMode('follow');
                    setHubOpen(false);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    cameraMode === 'follow'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#131d33] text-emerald-300'
                  }`}
                >
                  3rd-Person Cam
                </button>
                {viewpointList.map((item, idx) => {
                  const active = cameraMode === 'overview' && item.id === activeViewpoint;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveViewpoint(item.id as CameraViewpointId);
                        setHubOpen(false);
                      }}
                      className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#131d33] text-slate-300 hover:text-white'
                      }`}
                    >
                      {idx + 1}. {item.label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Area: V8.0 Universal Contextual Interaction Button + Active Posture Bar + Compact Mobile Controls */}
      <div className="w-full flex flex-col items-center pb-2.5 px-3 gap-1.5">
        {/* Active Object Posture Status & Stand Up / Exit Pill */}
        {phase === 'playing' &&
          activeObjectInteraction &&
          !activeDialogue &&
          activeObjectModal === 'none' && (
            <div className="flex flex-col items-center gap-1 max-w-xs sm:max-w-sm">
              <button
                type="button"
                data-testid="exit-interaction-btn"
                onClick={() => exitObjectInteraction()}
                className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#0a1428]/90 hover:bg-rose-950/90 border border-amber-400/70 shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-mono font-bold text-slate-950">
                  {activeObjectInteraction.posture === 'study'
                    ? '✍️ STUDYING'
                    : activeObjectInteraction.posture === 'eat'
                      ? '🍱 EATING'
                      : activeObjectInteraction.posture === 'read'
                        ? '📖 READING'
                        : activeObjectInteraction.posture === 'use_computer'
                          ? '💻 TERMINAL'
                          : '🪑 SEATED'}
                </span>
                <span className="text-xs font-semibold text-white">
                  {activeObjectInteraction.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  Stand Up [E]
                </span>
              </button>
            </div>
          )}

        {/* V8.0 Universal Contextual Floating Interaction Button (Only appears when near a valid interactable object or NPC!) */}
        {phase === 'playing' &&
          !activeObjectInteraction &&
          contextualPrompt &&
          !activeDialogue &&
          activeObjectModal === 'none' && (
            <div className="flex flex-col items-center gap-1 max-w-xs sm:max-w-md">
              <button
                type="button"
                data-testid="contextual-interaction-btn"
                onClick={() => triggerContextualInteraction()}
                className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#0a1224]/88 hover:bg-[#142242]/95 border border-emerald-400/70 shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-[10px] font-mono font-bold text-white">
                  {contextualPrompt.icon} [E]
                </span>
                <span
                  data-testid="interaction-prompt-banner"
                  className="text-xs font-bold text-emerald-200"
                >
                  {contextualPrompt.actionVerb}
                </span>
                <span className="text-[11px] font-medium text-slate-200 truncate max-w-[190px]">
                  · {contextualPrompt.label}
                </span>
              </button>
            </div>
          )}

        {/* Compact Small Mobile Touch Controls (Bottom-Left Stick + Bottom-Right Small Buttons) */}
        {phase === 'playing' && !activeDialogue && shouldRenderMobileControls && (
          <div className="w-full flex items-end justify-between px-1 sm:px-3 pointer-events-none">
            {/* Compact 80px Left Virtual Thumbstick */}
            <div className="pointer-events-auto flex flex-col items-center">
              <div
                ref={joystickBaseRef}
                data-testid="mobile-joystick-zone"
                role="slider"
                aria-label="Mobile Movement Thumbstick"
                aria-valuemin={-1}
                aria-valuemax={1}
                aria-valuenow={Math.round(knobOffset.y)}
                onPointerDown={handleJoystickPointerDown}
                onPointerMove={handleJoystickPointerMove}
                onPointerUp={handleJoystickPointerUp}
                onPointerCancel={handleJoystickPointerUp}
                className="relative w-20 h-20 rounded-full bg-[#0a101f]/52 border border-indigo-400/40 shadow-lg flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
              >
                <div className="w-8 h-8 rounded-full border border-slate-600/50 pointer-events-none" />
                <div
                  style={{
                    transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
                  }}
                  className="w-8 h-8 rounded-full bg-indigo-500/80 border border-indigo-200/90 shadow flex items-center justify-center pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
                </div>
              </div>
            </div>

            {/* Compact 40px Right Action Pad (Use/Chat, Jump, Run, Cam) */}
            <div
              data-testid="mobile-action-pad"
              className="pointer-events-auto grid grid-cols-2 gap-1.5 items-center"
            >
              <button
                type="button"
                data-testid="mobile-btn-interact"
                onClick={() => {
                  audioManager.startBgm(timeOfDay);
                  triggerContextualInteraction();
                  triggerMobileInteract();
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border shadow-md flex items-center justify-center transition-colors cursor-pointer touch-none ${
                  contextualPrompt || activeObjectInteraction
                    ? 'bg-emerald-600/90 border-emerald-300 text-white'
                    : 'bg-[#0d1528]/65 border-indigo-400/50 text-slate-100'
                }`}
              >
                <span className="text-[9px] font-bold uppercase">
                  {activeObjectInteraction
                    ? 'UP'
                    : contextualPrompt?.sourceKind === 'object'
                      ? 'USE'
                      : 'CHAT'}
                </span>
              </button>

              <button
                type="button"
                data-testid="mobile-btn-jump"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  audioManager.startBgm(timeOfDay);
                  triggerMobileJump(true);
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  triggerMobileJump(false);
                }}
                onPointerCancel={() => {
                  triggerMobileJump(false);
                }}
                onClick={() => {
                  triggerMobileJump(true);
                  window.setTimeout(() => triggerMobileJump(false), 120);
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-600/75 hover:bg-indigo-500 border border-indigo-300/70 text-white shadow-md flex items-center justify-center transition-colors cursor-pointer touch-none"
              >
                <span className="text-[10px] font-bold">JUMP</span>
              </button>

              <button
                type="button"
                data-testid="mobile-btn-sprint"
                onClick={() => {
                  audioManager.playClick();
                  const next = triggerMobileSprintToggle();
                  setIsSprintingUI(next);
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border shadow-md flex items-center justify-center transition-colors cursor-pointer touch-none ${
                  isSprintingUI
                    ? 'bg-amber-500/90 border-amber-200 text-slate-950 font-bold'
                    : 'bg-[#0d1528]/65 border-slate-500/60 text-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold">RUN</span>
              </button>

              <button
                type="button"
                data-testid="mobile-btn-camera"
                onClick={() => {
                  setCameraMode(cameraMode === 'follow' ? 'overview' : 'follow');
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0d1528]/65 border border-indigo-400/50 text-indigo-200 shadow-md flex items-center justify-center transition-colors cursor-pointer touch-none"
              >
                <span className="text-[10px] font-bold">CAM</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Elevated, Compact Translucent NPC Chat & Reply Box (Raised above bottom controls + Tap outside to close!) */}
      {phase === 'playing' && dialogueInteractable && activeDialogue && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-end justify-center px-3 pb-20 sm:pb-24"
          onClick={() => closeDialogue()}
        >
          <div
            data-testid="npc-dialogue-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="false"
            aria-labelledby="dialogue-speaker-name"
            className="w-full max-w-sm sm:max-w-md rounded-lg bg-[#080e1d]/62 border border-indigo-300/45 px-3 py-2.5 shadow-xl text-slate-100"
          >
            {/* Compact Header: ONLY the Active/Nearby Speaker Name, Class & Personality + ✕ Close Button */}
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-600/35">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3
                  id="dialogue-speaker-name"
                  className="font-display text-xs sm:text-sm font-bold text-amber-300 truncate"
                >
                  {dialogueInteractable.name}
                </h3>
                {dialogueInteractable.academyClass && (
                  <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-400/40 text-[9px] font-mono text-amber-200 shrink-0">
                    {dialogueInteractable.academyClass}
                    {dialogueInteractable.personalityType
                      ? ` · ${dialogueInteractable.personalityType}`
                      : ''}
                  </span>
                )}
                <span className="text-[10px] text-indigo-200/85 truncate hidden sm:inline">
                  · {dialogueInteractable.role}
                </span>
              </div>

              <button
                type="button"
                data-testid="dialogue-speak-btn"
                onClick={speakLatestNpcMessage}
                disabled={!('speechSynthesis' in window)}
                aria-label="Speak latest NPC reply"
                className="px-2 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-40 text-[11px] font-semibold text-white cursor-pointer shrink-0"
              >
                Speak
              </button>
              <button
                type="button"
                data-testid="dialogue-close-btn"
                onClick={() => closeDialogue()}
                aria-label="Close Chat Box"
                className="px-2 py-0.5 rounded bg-rose-600/80 hover:bg-rose-500 text-[11px] font-bold text-white cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Compact Scrollable Conversation Log */}
            <div
              ref={chatScrollRef}
              data-testid="dialogue-chat-history"
              className="max-h-24 sm:max-h-28 overflow-y-auto space-y-1.5 pr-1 mb-2"
            >
              {activeDialogue.messages.map((msg) => {
                const isPlayer = msg.sender === 'player';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] rounded px-2.5 py-1 text-xs leading-snug ${
                        isPlayer
                          ? 'bg-indigo-600/65 text-white'
                          : 'bg-[#0c1526]/75 border border-amber-300/30 text-slate-100'
                      }`}
                    >
                      <span className="font-semibold text-[10px] mr-1.5 text-amber-200">
                        {isPlayer ? 'You:' : `${msg.speakerName.split(' ')[0]}:`}
                      </span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              })}

              {activeDialogue.isNpcTyping && (
                <div className="text-[11px] text-amber-200 font-mono px-1">
                  {dialogueInteractable.name.split(' ')[0]} is replying...
                </div>
              )}
            </div>

            {/* Compact Quick Reply Chips */}
            {currentDialogueLine?.choices && currentDialogueLine.choices.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {currentDialogueLine.choices.map((choice, idx) => (
                  <button
                    key={choice.label}
                    type="button"
                    data-testid={`dialogue-choice-${idx}`}
                    onClick={() =>
                      selectDialogueChoice(
                        choice.label,
                        choice.nextLineIndex,
                        choice.reputationBonus
                      )
                    }
                    className="px-2 py-0.5 rounded bg-[#14223d]/70 hover:bg-indigo-600/80 border border-indigo-400/40 text-[11px] text-indigo-100 cursor-pointer truncate max-w-full"
                  >
                    ▸ {choice.label}
                  </button>
                ))}
              </div>
            )}

            {/* Compact Single-Line Custom Message Input + Send Button */}
            <form
              onSubmit={handleCustomMessageSubmit}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                data-testid="dialogue-custom-input"
                value={customMessageInput}
                onChange={(e) => setCustomMessageInput(e.target.value)}
                placeholder={`Type message to ${dialogueInteractable.name.split(' ')[0]}...`}
                className="flex-1 h-8 px-2.5 rounded bg-[#050a14]/75 border border-slate-500/50 focus:border-indigo-400 text-xs text-white placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                data-testid="dialogue-send-btn"
                disabled={!customMessageInput.trim()}
                className="h-8 px-3 rounded bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer shrink-0"
              >
                Send
              </button>
            </form>
            <div className="text-[10px] text-slate-300/75 text-center mt-1">
              Tap anywhere outside box or press ✕ to close
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* V8.0 UNIVERSAL OBJECT INTERACTION MODALS                              */}
      {/* ===================================================================== */}

      {/* 1. Multi-Section Library Bookshelf & Return Station Modal */}
      {activeObjectModal === 'library_bookshelf' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="library-bookshelf-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[86vh] overflow-y-auto rounded-xl bg-[#091224]/96 border border-indigo-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2.5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                  Hoshino Academy · Multi-Section Library Catalogue
                </div>
                <h2 className="font-display text-base sm:text-lg font-bold text-white">
                  📚 Browse, Borrow, Read &amp; Return Books
                </h2>
                <div className="text-[11px] text-indigo-200">
                  Borrowed Books: {(missionProgress.borrowedBookIds ?? []).length} · Read Books:{' '}
                  {(missionProgress.readBookIds ?? []).length}/{LIBRARY_BOOKS.length}
                </div>
              </div>
              <button
                type="button"
                data-testid="close-bookshelf-modal-btn"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {BOOK_CATEGORIES.map((cat) => {
                const active = selectedBookshelfCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    data-testid={`bookshelf-tab-${cat.toLowerCase()}`}
                    onClick={() => setSelectedBookshelfCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white border border-indigo-300'
                        : 'bg-[#111c35] text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {LIBRARY_BOOKS.filter(
                (b) =>
                  selectedBookshelfCategory === 'All' ||
                  b.category === selectedBookshelfCategory
              ).map((book) => {
                const isBorrowed = (missionProgress.borrowedBookIds ?? []).includes(book.id);
                const isRead = (missionProgress.readBookIds ?? []).includes(book.id);
                return (
                  <div
                    key={book.id}
                    data-testid={`library-book-card-${book.id}`}
                    className="rounded-lg bg-[#0d1830] border border-slate-700/80 p-3 flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-400/40 text-[10px] font-mono text-indigo-200">
                          {book.category}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300">
                          +{book.skillBonus.amount} {book.skillBonus.skill}
                        </span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-amber-200">
                        {book.title}
                      </h3>
                      <div className="text-[10px] text-slate-400">By {book.author}</div>
                      <p className="text-[11px] text-slate-200 leading-snug">{book.summary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        data-testid={`borrow-book-${book.id}`}
                        disabled={isBorrowed}
                        onClick={() => borrowBook(book.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                          isBorrowed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 opacity-80'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isBorrowed ? '✓ In Bag' : '📥 Take Book'}
                      </button>

                      <button
                        type="button"
                        data-testid={`read-book-${book.id}`}
                        onClick={() => openBookReader(book.id)}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white cursor-pointer"
                      >
                        📖 {isRead ? 'Read Again' : 'Read Book'}
                      </button>

                      {isBorrowed && (
                        <button
                          type="button"
                          data-testid={`return-book-${book.id}`}
                          onClick={() => returnBook(book.id)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[11px] font-semibold text-slate-200 cursor-pointer"
                        >
                          ↩ Return
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Multi-Page Book Reader Modal */}
      {activeObjectModal === 'book_reader' &&
        (() => {
          const book =
            LIBRARY_BOOKS.find((b) => b.id === activeReadingBookId) ?? LIBRARY_BOOKS[0];
          const totalPages = book.pages.length;
          const pageIdx = Math.min(activeReadingPageIndex, totalPages - 1);
          const isBorrowed = (missionProgress.borrowedBookIds ?? []).includes(book.id);

          return (
            <div
              className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/85 px-3 py-4"
              onClick={() => exitObjectInteraction()}
            >
              <div
                data-testid="book-reader-modal"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-xl bg-[#0b1529]/96 border border-amber-400/50 p-4 sm:p-5 shadow-2xl text-slate-100 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-700 pb-2.5">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                      {book.category} Section · By {book.author}
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-white">
                      📖 {book.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    data-testid="close-book-reader-btn"
                    onClick={() => exitObjectInteraction()}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
                  >
                    Stop Reading
                  </button>
                </div>

                <div
                  data-testid="book-reader-page-content"
                  className="rounded-lg bg-[#111e38] border border-indigo-400/30 p-4 min-h-[140px] flex flex-col justify-between space-y-3"
                >
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-serif">
                    {book.pages[pageIdx]}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 pt-2 border-t border-slate-700/70">
                    <span>
                      Page {pageIdx + 1} of {totalPages}
                    </span>
                    <span className="text-emerald-300">
                      Skill Bonus: +{book.skillBonus.amount} {book.skillBonus.skill}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="book-prev-page-btn"
                      disabled={pageIdx <= 0}
                      onClick={() => setReadingPage(pageIdx - 1)}
                      className="px-3 py-1.5 rounded bg-[#162444] hover:bg-[#1f325d] disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
                    >
                      ◀ Prev Page
                    </button>
                    <button
                      type="button"
                      data-testid="book-next-page-btn"
                      disabled={pageIdx >= totalPages - 1}
                      onClick={() => setReadingPage(pageIdx + 1)}
                      className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
                    >
                      Next Page ▶
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isBorrowed ? (
                      <button
                        type="button"
                        onClick={() => borrowBook(book.id)}
                        className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 cursor-pointer"
                      >
                        📥 Borrow Book
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => returnBook(book.id)}
                        className="px-2.5 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 cursor-pointer"
                      >
                        ↩ Return Book
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveObjectModal('library_bookshelf')}
                      className="px-2.5 py-1.5 rounded bg-[#162444] hover:bg-[#1f325d] text-xs font-semibold text-indigo-200 cursor-pointer"
                    >
                      📚 All Books
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* 3. Computer Lab Workstation Terminal Modal */}
      {activeObjectModal === 'computer_terminal' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="computer-terminal-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-[#071324]/96 border border-cyan-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                  Hoshino OS v8.0 · Computer &amp; Robotics Laboratory
                </div>
                <h2 className="font-display text-base font-bold text-white">
                  💻 Digital Research &amp; Coding Workstation
                </h2>
              </div>
              <button
                type="button"
                data-testid="exit-computer-btn"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                Exit Computer
              </button>
            </div>

            <div className="rounded-lg bg-[#040b16] border border-cyan-500/35 p-3 font-mono text-xs space-y-2">
              <div className="text-cyan-300">
                &gt; SYSTEM TASK: Calibrate Project Hoshikaze 4-Class Telemetry Array
              </div>
              <div className="text-slate-300 text-[11px]">
                Compiling meteorological sensor nodes across Class A, Class B, Class C, and
                Class D terminals...
              </div>
              {labActivityToast && (
                <div className="p-2 rounded bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-[11px]">
                  {labActivityToast}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  data-testid="complete-computer-challenge-btn"
                  onClick={() => {
                    completeComputerLabActivity();
                    setLabActivityToast(
                      '✓ Telemetry Array Synchronized! Earned +25 XP, +4 Problem Solving & Digital Archive Clue!'
                    );
                  }}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  ▶ Execute Telemetry Algorithm (+25 XP)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveObjectModal('library_bookshelf')}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  📚 Open Digital Library Catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Science Lab Optical Microscope Modal */}
      {activeObjectModal === 'science_microscope' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="science-microscope-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-[#081526]/96 border border-emerald-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                  Hoshino Science Laboratory · Optical Bench
                </div>
                <h2 className="font-display text-base font-bold text-white">
                  🔬 Binocular Research Microscope
                </h2>
              </div>
              <button
                type="button"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                Step Away
              </button>
            </div>

            <div className="flex gap-1.5">
              {[
                {
                  title: 'Sakura Epidermal Cells (400x)',
                  desc: 'Delicate hexagonal cell walls with anthocyanin pigment vacuoles from the courtyard cherry trees.',
                },
                {
                  title: 'Koi Pond Micro-Flora (600x)',
                  desc: 'Symbiotic oxygenating diatoms thriving in the West Koi Garden basin.',
                },
                {
                  title: 'Quartz Chronometer Crystal (800x)',
                  desc: 'Precision-cut piezoelectric lattice used in the original Project Hoshikaze solar chronometer!',
                },
              ].map((slide, idx) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setSelectedSlideIndex(idx)}
                  className={`flex-1 p-2 rounded border text-[11px] font-semibold cursor-pointer ${
                    selectedSlideIndex === idx
                      ? 'bg-emerald-700/80 border-emerald-300 text-white'
                      : 'bg-[#102038] border-slate-700 text-slate-300'
                  }`}
                >
                  Slide #{idx + 1}
                </button>
              ))}
            </div>

            <div className="rounded-lg bg-[#05101e] border border-emerald-500/40 p-3 text-xs space-y-1.5">
              <div className="font-bold text-emerald-300">
                Active Specimen:{' '}
                {
                  [
                    'Sakura Epidermal Cells (400x)',
                    'Koi Pond Micro-Flora (600x)',
                    'Quartz Chronometer Crystal (800x)',
                  ][selectedSlideIndex]
                }
              </div>
              <p className="text-slate-200 text-[11px]">
                {
                  [
                    'Delicate hexagonal cell walls with anthocyanin pigment vacuoles from the courtyard cherry trees.',
                    'Symbiotic oxygenating diatoms thriving in the West Koi Garden basin.',
                    'Precision-cut piezoelectric lattice used in the original Project Hoshikaze solar chronometer!',
                  ][selectedSlideIndex]
                }
              </p>
              {labActivityToast && (
                <div className="p-2 rounded bg-emerald-950 border border-emerald-400/50 text-emerald-200 text-[11px]">
                  {labActivityToast}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                data-testid="record-microscope-btn"
                onClick={() => {
                  completeScienceMicroscopeActivity();
                  setLabActivityToast(
                    '✓ Specimen logged in Science Lab Journal! (+20 XP & +4 Observation)'
                  );
                }}
                className="px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                🔬 Record Lab Observation (+20 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Cafeteria Menu & Meal Order Modal */}
      {activeObjectModal === 'cafeteria_menu' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="cafeteria-menu-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-[#0b1324]/96 border border-amber-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                  West Cafeteria Pavilion · Student Dining Counter
                </div>
                <h2 className="font-display text-base font-bold text-white">
                  🍱 Campus Lunch Menu (Personal Points: {missionProgress.ppPoints ?? 150} PP)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CAFETERIA_MENU_ITEMS.map((item) => {
                const canAfford = (missionProgress.ppPoints ?? 150) >= item.pricePp;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg bg-[#111e36] border border-slate-700 p-3 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                        <span>{item.name}</span>
                        <span className="font-mono text-emerald-300">{item.pricePp} PP</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      data-testid={`order-meal-${item.id}`}
                      disabled={!canAfford}
                      onClick={() => orderCafeteriaMeal(item.id)}
                      className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      🍴 Order &amp; Sit to Eat (+{item.xpBonus} XP)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Interactive Campus Map & Building Floor Directory Modal */}
      {(activeObjectModal === 'campus_map' || activeObjectModal === 'elevator_floor') && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="campus-map-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-[#091224]/96 border border-sky-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-sky-300">
                  Hoshino Academy · Interactive Architecture &amp; District Directory
                </div>
                <h2 className="font-display text-base sm:text-lg font-bold text-white">
                  🗺️ Campus Buildings, Classrooms A–D &amp; Open World Map
                </h2>
              </div>
              <button
                type="button"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPUS_DIRECTORY_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  data-testid={`directory-nav-${loc.id}`}
                  onClick={() => {
                    teleportToZone(loc.x, loc.z, loc.yaw);
                  }}
                  className="p-2.5 rounded-lg bg-[#101e38] hover:bg-indigo-900/80 border border-slate-700 hover:border-sky-400/60 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{loc.name}</div>
                    <div className="text-[10px] font-mono text-sky-300">{loc.zone}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-[10px] font-mono text-sky-200 shrink-0">
                    Go ▸
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Noticeboard / Blackboard / Locker / Reception Reader Modal */}
      {activeObjectModal === 'notice_reader' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="notice-reader-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-[#0a1428]/96 border border-indigo-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="font-display text-sm sm:text-base font-bold text-amber-200">
                📋 {activeNoticeObject?.noticeTitle ?? activeNoticeObject?.label ?? 'Campus Notice'}
              </h2>
              <button
                type="button"
                data-testid="close-notice-modal-btn"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {activeNoticeObject?.noticeBody ??
                'Official Hoshino Academy notice for Classes A, B, C, and D.'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-mono">
              <span>✓ Inspection Recorded (+{activeNoticeObject?.xpReward ?? 15} XP)</span>
              <button
                type="button"
                onClick={() => exitObjectInteraction()}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Dormitory Wardrobe & Rest Modal */}
      {activeObjectModal === 'wardrobe_outfit' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/84 px-3 py-4"
          onClick={() => exitObjectInteraction()}
        >
          <div
            data-testid="wardrobe-outfit-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-[#0a1428]/96 border border-indigo-400/50 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="font-display text-base font-bold text-white">
                👕 Student Dormitory Wardrobe &amp; Rest
              </h2>
              <button
                type="button"
                onClick={() => exitObjectInteraction()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'uniform_blazer', label: 'Navy Academy Blazer' },
                  { id: 'summer_vest', label: 'Summer Knit Vest' },
                  { id: 'track_jacket', label: 'Athletics Tracksuit' },
                  { id: 'council_gold', label: 'Council Gold-Trim' },
                ] as Array<{ id: CharacterCustomization['outfit']; label: string }>
              ).map((o) => {
                const active =
                  missionProgress.characterCustomization?.outfit === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => updateCharacterCustomization({ outfit: o.id })}
                    className={`p-2.5 rounded border text-xs font-semibold cursor-pointer ${
                      active
                        ? 'bg-indigo-600 border-indigo-300 text-white'
                        : 'bg-[#111e36] border-slate-700 text-slate-200'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Focused Pause Modal Card when phase === 'paused' */}
      {phase === 'paused' && activeModal === 'none' && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#060912]/80 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-modal-title"
        >
          <div className="w-full max-w-md rounded-lg bg-[#0d1424] border border-indigo-500/40 p-6 shadow-2xl text-slate-100">
            <div className="text-xs font-medium tracking-widest text-indigo-300 mb-1">
              SESSION PAUSED
            </div>
            <h2
              id="pause-modal-title"
              className="font-display text-2xl font-semibold text-white mb-4"
            >
              Hoshino Academy · The School Chronicles
            </h2>

            <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
              <div className="p-3 rounded bg-[#11192c] border border-slate-800">
                <div className="text-slate-400">Experience (XP)</div>
                <div className="font-mono font-semibold text-amber-300 mt-0.5">
                  {missionProgress.reputationPoints} XP
                </div>
              </div>
              <div className="p-3 rounded bg-[#11192c] border border-slate-800">
                <div className="text-slate-400">Campus Time</div>
                <div className="font-mono tabular-nums font-semibold text-amber-300 mt-0.5">
                  {atmo.timeDisplay}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  audioManager.playConfirmChime();
                  setPhase('playing');
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Resume School Session
              </button>

              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  setActiveModal('settings');
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded bg-[#141e33] hover:bg-[#1b2945] border border-slate-700 text-sm font-medium text-slate-200 transition-colors cursor-pointer"
              >
                Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  void returnToMainMenu();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded bg-[#141e33] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-sm font-medium text-slate-200 hover:text-rose-200 transition-colors cursor-pointer"
              >
                Save & Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

