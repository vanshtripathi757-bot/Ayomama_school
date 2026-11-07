import React, { useEffect, useRef, useState } from 'react';
import {
  ATMOSPHERE_PRESETS,
  CAMERA_VIEWPOINTS,
  NPC_AMBIENT_BANTERS,
  SCHOOL_PERIODS,
  STORY_CHAPTER_ARC,
} from '../../config/defaults';
import {
  getActiveStoryAndPhase,
  getCampusZoneLabel,
  getCurrentStoryChapter,
  getSkyWeatherDescription,
  getStudentAcademicRank,
  getStoryPhaseObjectiveStatus,
  getStoryObjectiveHint,
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
import { useGameStore } from '../../store/useGameStore';
import { CameraViewpointId } from '../../types/game';
import { LIBRARY_BOOKS, getOwnedLibraryBookIds } from '../../game/systems/LibraryBookSystem';
import { TRANSIT_DESTINATIONS } from '../../game/systems/TransitSystem';
import { getOwnedTownItemIds, getTownShopItems } from '../../game/systems/TownShopSystem';

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
  const nearbyWorldObject = useGameStore((s) => s.nearbyWorldObject);
  const activeWorldInteraction = useGameStore((s) => s.activeWorldInteraction);
  const activeDialogue = useGameStore((s) => s.activeDialogue);
  const missionProgress = useGameStore((s) => s.missionProgress);
  const isSprintingUI = useGameStore((s) => s.isSprintingUI);
  const activeStoryPack = useGameStore((s) => s.activeStoryPack);
  const storyModalOpen = useGameStore((s) => s.storyModalOpen);
  const storyLoading = useGameStore((s) => s.storyLoading);
  const lastQuizFeedback = useGameStore((s) => s.lastQuizFeedback);

  const setPhase = useGameStore((s) => s.setPhase);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveViewpoint = useGameStore((s) => s.setActiveViewpoint);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const returnToMainMenu = useGameStore((s) => s.returnToMainMenu);
  const openInteractionDialogue = useGameStore((s) => s.openInteractionDialogue);
  const beginWorldInteraction = useGameStore((s) => s.beginWorldInteraction);
  const endWorldInteraction = useGameStore((s) => s.endWorldInteraction);
  const takeLibraryBook = useGameStore((s) => s.takeLibraryBook);
  const returnLibraryBook = useGameStore((s) => s.returnLibraryBook);
  const purchaseTownItem = useGameStore((s) => s.purchaseTownItem);
  const teleportToZone = useGameStore((s) => s.teleportToZone);
  const selectDialogueChoice = useGameStore((s) => s.selectDialogueChoice);
  const sendCustomDialogueMessage = useGameStore((s) => s.sendCustomDialogueMessage);
  const closeDialogue = useGameStore((s) => s.closeDialogue);
  const claimHonorDiploma = useGameStore((s) => s.claimHonorDiploma);
  const setIsSprintingUI = useGameStore((s) => s.setIsSprintingUI);
  const setStoryModalOpen = useGameStore((s) => s.setStoryModalOpen);
  const submitStoryPackAnswer = useGameStore((s) => s.submitStoryPackAnswer);
  const requestNextStoryDirectorPack = useGameStore((s) => s.requestNextStoryDirectorPack);
  const openStoryLibrary = useGameStore((s) => s.openStoryLibrary);

  // Upper-Right Unified Hub Drawer state (keeps the main screen 100% clean when closed)
  const [hubOpen, setHubOpen] = useState(false);

  // Compact Virtual Joystick visual knob state (px offset from center, max 26px)
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickPointerIdRef = useRef<number | null>(null);

  // Custom typed message state for NPC chat
  const [customMessageInput, setCustomMessageInput] = useState('');
  const [readingBookId, setReadingBookId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Subtle, tap-to-dismiss Ambient NPC-to-NPC conversation toast
  const [banterIndex, setBanterIndex] = useState(0);
  const [banterVisible, setBanterVisible] = useState(true);
  useEffect(() => {
    if (phase !== 'playing') return;
    audioManager.startBgm(timeOfDay);
    const timer = window.setInterval(() => {
      setBanterIndex((prev) => (prev + 1) % NPC_AMBIENT_BANTERS.length);
      setBanterVisible(true);
    }, 14000);
    return () => window.clearInterval(timer);
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

      if (activeDialogue) {
        if (e.code === 'Escape') {
          e.preventDefault();
          closeDialogue();
        }
        return;
      }

      if (activeWorldInteraction) {
        if (e.code === 'Escape') {
          e.preventDefault();
          endWorldInteraction();
        }
        return;
      }

      if (isTypingInInput) return;

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        audioManager.playClick();
        setPhase(phase === 'playing' ? 'paused' : 'playing');
      } else if (phase === 'playing') {
        if ((e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'Enter') && nearbyInteractable) {
          e.preventDefault();
          openInteractionDialogue();
        } else if ((e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'Enter') && nearbyWorldObject) {
          e.preventDefault();
          const action = nearbyWorldObject.actions.find((item) => item.enabled !== false);
          if (action) beginWorldInteraction(nearbyWorldObject.id, action.id);
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
    activeDialogue,
    nearbyInteractable,
    nearbyWorldObject,
    activeWorldInteraction,
    setPhase,
    setCameraMode,
    setActiveModal,
    toggleMute,
    setActiveViewpoint,
    openInteractionDialogue,
    beginWorldInteraction,
    endWorldInteraction,
    closeDialogue,
  ]);

  // Reset mobile joystick if phase changes or dialogue opens
  useEffect(() => {
    if (phase !== 'playing' || activeDialogue !== null || activeWorldInteraction !== null) {
      setKnobOffset({ x: 0, y: 0 });
      resetMobileInputBridge();
      setMobileSprintHeld(false);
      setIsSprintingUI(false);
    }
  }, [phase, activeDialogue, activeWorldInteraction, setIsSprintingUI]);

  if (phase !== 'playing' && phase !== 'paused') return null;

  const activeTownShopId =
    activeWorldInteraction?.objectId === 'town-manga-shop-counter'
      ? 'manga-shop'
      : activeWorldInteraction?.objectId === 'town-konbini-counter'
        ? 'konbini'
        : null;
  const ownedTownItemIds = getOwnedTownItemIds(missionProgress.inventoryItems);
  const currentCpBalance = missionProgress.cpPoints ?? 0;

  const atmo = ATMOSPHERE_PRESETS[timeOfDay];
  const periodCfg = SCHOOL_PERIODS[schoolPeriod];
  const viewpointList = Object.values(CAMERA_VIEWPOINTS);
  const currentBanter = NPC_AMBIENT_BANTERS[banterIndex % NPC_AMBIENT_BANTERS.length];
  const currentZoneName = getCampusZoneLabel(
    sharedInputBridge.playerX,
    sharedInputBridge.playerZ
  );
  const skyWeatherLabel = getSkyWeatherDescription(
    timeOfDay,
    Math.floor(missionProgress.distanceWalked * 2)
  );

  // Hoshino Academy Story Chapter & Active Sequential Phase
  const activeChapter = getCurrentStoryChapter(missionProgress.reputationPoints);
  const phaseObjectiveStatus = getStoryPhaseObjectiveStatus(missionProgress);
  const { story: activeStoryObj, phase: activePhaseObj } =
    getActiveStoryAndPhase(missionProgress);
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
      {/* Top Bar: Clean Left Space + Compact Tap-to-Dismiss NPC Whisper + Single Upper-Right Hub Button */}
      <div className="w-full px-3 pt-2.5 flex items-start justify-between gap-2">
        <div className="w-8" />

        {/* Subtle, Single-Line Translucent NPC-to-NPC Whisper (Tap with finger to dismiss!) */}
        {phase === 'playing' && !activeDialogue && banterVisible && currentBanter && (
          <div
            data-testid="ambient-npc-banter-box"
            onClick={() => setBanterVisible(false)}
            title="Tap to dismiss"
            className="pointer-events-auto max-w-xs sm:max-w-md rounded bg-[#080e1c]/48 hover:bg-[#080e1c]/65 border border-slate-400/25 px-2.5 py-1 text-[11px] text-slate-100 flex items-center gap-2 cursor-pointer transition-opacity"
          >
            <div className="truncate">
              <span className="font-semibold text-rose-300">
                {currentBanter.speakerA.split(' ')[0]}:
              </span>{' '}
              <span className="text-slate-200">&ldquo;{currentBanter.lineA}&rdquo;</span>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">✕</span>
          </div>
        )}

        {/* Upper-Right Compact Profile + Story Chronicle + Menu Buttons */}
        <div className="pointer-events-auto relative flex items-center gap-1.5">
          <button
            type="button"
            data-testid="top-right-profile-btn"
            onClick={() => {
              audioManager.playClick();
              setHubOpen(false);
              setStoryModalOpen(false);
              setActiveModal('profile');
            }}
            className="min-h-[34px] px-2.5 py-1 rounded bg-[#0a101f]/80 hover:bg-[#16223d] border border-sky-400/50 text-xs font-semibold text-sky-200 shadow-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>👤 {playerClass}</span>
          </button>

          <button
            type="button"
            data-testid="top-right-story-btn"
            onClick={() => {
              audioManager.startBgm(timeOfDay);
              setHubOpen(false);
              setStoryModalOpen(!storyModalOpen);
            }}
            className="min-h-[34px] px-2.5 py-1 rounded bg-[#0a101f]/80 hover:bg-[#16223d] border border-amber-400/50 text-xs font-semibold text-amber-200 shadow-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>📖 Story</span>
            <span className="font-mono text-[10px] text-amber-300">
              P.0{activePhaseObj.phaseNumber}
            </span>
          </button>

          <button
            type="button"
            data-testid="top-right-hub-btn"
            onClick={() => {
              audioManager.playClick();
              audioManager.startBgm(timeOfDay);
              setStoryModalOpen(false);
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

      {phase === 'playing' && !storyModalOpen && !activeDialogue && (
        <div data-testid="live-mission-clue" className="pointer-events-auto absolute top-14 left-3 z-10 w-[min(82vw,280px)] rounded-lg bg-[#071426]/90 border border-emerald-400/35 px-3 py-2 shadow-lg backdrop-blur-sm">
          <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-300">Current Mission · {phaseObjectiveStatus.completedCount}/{phaseObjectiveStatus.total}</div>
          {phaseObjectiveStatus.nextObjective ? (
            <>
              <div className="mt-1 text-[11px] font-semibold text-white">{phaseObjectiveStatus.nextObjective}</div>
              <div className="mt-1 text-[10px] leading-relaxed text-amber-100">{getStoryObjectiveHint(missionProgress)}</div>
            </>
          ) : (
            <div className="mt-1 text-[11px] text-emerald-200">All objectives complete. Open Story &amp; Quiz to finish this phase.</div>
          )}
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
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  data-testid="open-story-director-btn"
                  onClick={() => {
                    setHubOpen(false);
                    setStoryModalOpen(true);
                  }}
                  className="py-1.5 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] text-center cursor-pointer transition-colors"
                >
                  📖 Story &amp; Quiz
                </button>
                <button
                  type="button"
                  data-testid="claim-diploma-btn"
                  onClick={() => claimHonorDiploma()}
                  className="py-1.5 px-2 rounded bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-[11px] text-center cursor-pointer transition-colors truncate"
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

      {/* Bottom Area: Proximity Greeting Bubble + Interaction Pill + Compact Mobile Controls */}
      <div className="w-full flex flex-col items-center pb-2.5 px-3 gap-1.5">
        {/* Proximity-Based NPC Greeting Bubble + Tap-to-Chat Pill (with NPC Class & Personality!) */}
        {phase === 'playing' && nearbyInteractable && !activeDialogue && (
          <div className="flex flex-col items-center gap-1 max-w-xs sm:max-w-sm">
            {nearbyInteractable.greetingText && (
              <div
                data-testid="proximity-greeting-bubble"
                onClick={() => openInteractionDialogue()}
                className="pointer-events-auto px-3 py-1 rounded-lg bg-[#081022]/82 border border-amber-300/45 shadow-md text-center cursor-pointer"
              >
                <div className="text-[10px] font-semibold text-amber-300">
                  {nearbyInteractable.name.split(' ')[0]}
                  {nearbyInteractable.academyClass
                    ? ` · ${nearbyInteractable.academyClass}`
                    : ''}
                  {nearbyInteractable.personalityType
                    ? ` · ${nearbyInteractable.personalityType}`
                    : ''}
                </div>
                <div className="text-[11px] text-slate-100 leading-snug">
                  &ldquo;{nearbyInteractable.greetingText}&rdquo;
                </div>
              </div>
            )}
            <button
              type="button"
              data-testid="interaction-prompt-banner"
              onClick={() => openInteractionDialogue()}
              className="pointer-events-auto px-3 py-1 rounded-full bg-[#0a1224]/75 hover:bg-[#142242]/90 border border-emerald-400/60 shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-[10px] font-mono font-bold text-white">
                TAP
              </span>
              <span className="text-[11px] font-semibold text-white">
                Chat: {nearbyInteractable.name.split(' ')[0]}
                {nearbyInteractable.academyClass
                  ? ` (${nearbyInteractable.academyClass})`
                  : ''}
              </span>
            </button>
          </div>
        )}

        {/* Contextual world-object action: shown only for a registered nearby target. */}
        {phase === 'playing' && nearbyWorldObject && !nearbyInteractable && !activeDialogue && !activeWorldInteraction && (
          <div
            data-testid="world-object-interaction-prompt"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-cyan-300/55 bg-[#081326]/90 px-3 py-1.5 shadow-lg backdrop-blur-sm"
          >
            <span className="text-[10px] font-mono font-bold text-cyan-200">OBJECT</span>
            <span className="max-w-[150px] truncate text-[11px] font-semibold text-white">
              {nearbyWorldObject.displayName}
            </span>
            <button
              type="button"
              data-testid="world-object-action-button"
              onClick={() => {
                const action = nearbyWorldObject.actions.find((item) => item.enabled !== false);
                if (action) beginWorldInteraction(nearbyWorldObject.id, action.id);
              }}
              className="rounded-full bg-cyan-600 px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-cyan-500"
            >
              {nearbyWorldObject.actions.find((item) => item.enabled !== false)?.label ?? 'Interact'}
            </button>
          </div>
        )}

        {phase === 'playing' && activeWorldInteraction && (
          <div
            data-testid="active-world-interaction"
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-lg border border-cyan-300/45 bg-[#07111f]/95 px-3 py-2 shadow-xl backdrop-blur-md"
          >
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-200">
                Interaction mode
              </div>
              <div className="max-w-[210px] truncate text-xs font-semibold text-white">
                {activeWorldInteraction.actionLabel} · {activeWorldInteraction.displayName}
              </div>
            </div>
            <button
              type="button"
              data-testid="exit-world-interaction"
              onClick={endWorldInteraction}
              className="shrink-0 rounded-md border border-slate-400/40 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
            >
              Exit
            </button>
          </div>
        )}

        {phase === 'playing' && activeTownShopId && (
          <div
            data-testid="town-shop-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Hoshino town shop"
            className="pointer-events-auto fixed left-1/2 top-1/2 z-30 w-[min(92vw,520px)] max-h-[78vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-amber-300/40 bg-[#081326]/97 p-4 text-slate-100 shadow-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">Hoshino Town · Shopping Street</div>
                <h2 className="text-base font-bold text-white">
                  {activeTownShopId === 'manga-shop' ? 'Manga, Books & Keepsakes' : 'Konbini Mart'}
                </h2>
                <p className="text-[11px] text-slate-300">Available Class Points: {currentCpBalance} CP</p>
              </div>
              <button type="button" onClick={endWorldInteraction} className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700">Close</button>
            </div>
            <div className="space-y-2">
              {getTownShopItems(activeTownShopId).map((item) => {
                const owned = ownedTownItemIds.includes(item.id);
                const canAfford = currentCpBalance >= item.priceCp;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/80 p-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="mt-1 text-[10px] text-slate-400">{item.description}</div>
                      <div className="mt-1 text-[10px] font-mono text-amber-300">{item.priceCp} CP</div>
                    </div>
                    <button
                      type="button"
                      disabled={owned || !canAfford}
                      onClick={() => purchaseTownItem(item.id)}
                      className="shrink-0 rounded-md bg-amber-600 px-3 py-2 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      {owned ? 'Owned' : canAfford ? 'Buy' : 'Need CP'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === 'playing' && activeWorldInteraction?.objectId === 'station-ticket-terminal' && (
          <div
            data-testid="railway-destinations-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Hoshino railway destinations"
            className="pointer-events-auto fixed left-1/2 top-1/2 z-30 w-[min(92vw,520px)] max-h-[78vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-cyan-300/40 bg-[#081326]/97 p-4 text-slate-100 shadow-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Hoshino Electric Railway</div>
                <h2 className="text-base font-bold text-white">Choose your destination</h2>
                <p className="text-[11px] text-slate-300">Select a district to travel there instantly.</p>
              </div>
              <button type="button" onClick={endWorldInteraction} className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700">Close</button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TRANSIT_DESTINATIONS.map((destination) => (
                <button
                  key={destination.id}
                  type="button"
                  data-testid={`transit-${destination.id}`}
                  onClick={() => {
                    teleportToZone(destination.position.x, destination.position.z, destination.yaw);
                    endWorldInteraction();
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-left transition-colors hover:border-cyan-400/70 hover:bg-slate-800"
                >
                  <span className="block text-xs font-bold text-white">{destination.label}</span>
                  <span className="mt-1 block text-[10px] leading-relaxed text-slate-400">{destination.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'playing' && activeWorldInteraction?.actionId === 'browse-books' && (
          <div
            data-testid="library-books-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Academy library books"
            className="pointer-events-auto fixed left-1/2 top-1/2 z-30 w-[min(92vw,560px)] max-h-[78vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-amber-300/40 bg-[#081326]/97 p-4 text-slate-100 shadow-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-700 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">Seiran Academy · Library</div>
                <h2 className="text-base font-bold text-white">Browse the shelves</h2>
                <p className="text-[11px] text-slate-300">Take a book to keep it in your saved bag. Open it here to read.</p>
              </div>
              <button type="button" onClick={endWorldInteraction} className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700">Close</button>
            </div>
            <div className="space-y-2">
              {LIBRARY_BOOKS.map((book) => {
                const owned = getOwnedLibraryBookIds(inventoryItems).includes(book.id);
                const isReading = readingBookId === book.id;
                return (
                  <article key={book.id} className="rounded-lg border border-slate-700 bg-[#101d33] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wide text-cyan-300">{book.category} · {book.author}</div>
                        <h3 className="text-sm font-semibold text-white">{book.title}</h3>
                        <p className="mt-1 text-[11px] text-slate-300">{book.summary}</p>
                      </div>
                      <span className="shrink-0 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{owned ? 'In bag' : 'On shelf'}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!owned ? (
                        <button type="button" data-testid={`take-book-${book.id}`} onClick={() => takeLibraryBook(book.id)} className="rounded bg-cyan-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-cyan-600">Take book</button>
                      ) : (
                        <>
                          <button type="button" onClick={() => setReadingBookId(isReading ? null : book.id)} className="rounded bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-500">{isReading ? 'Close reading' : 'Read book'}</button>
                          <button type="button" onClick={() => { returnLibraryBook(book.id); if (isReading) setReadingBookId(null); }} className="rounded border border-amber-300/40 bg-amber-950/50 px-3 py-1.5 text-[11px] font-semibold text-amber-100 hover:bg-amber-900/60">Return book</button>
                        </>
                      )}
                    </div>
                    {isReading && (
                      <div data-testid={`book-reading-${book.id}`} className="mt-3 space-y-2 rounded bg-[#050b17] p-3 text-xs leading-relaxed text-slate-200">
                        <div className="font-semibold text-amber-200">{book.title}</div>
                        {book.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-2 text-[10px] text-slate-400">
              <span>Books in bag: {getOwnedLibraryBookIds(inventoryItems).length}</span>
              <span>Progress is saved with your session</span>
            </div>
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

            {/* Compact 40px Right Action Pad (Chat, Jump, Run, Cam) */}
            <div
              data-testid="mobile-action-pad"
              className="pointer-events-auto grid grid-cols-2 gap-1.5 items-center"
            >
              <button
                type="button"
                data-testid="mobile-btn-interact"
                onClick={() => {
                  audioManager.startBgm(timeOfDay);
                  openInteractionDialogue();
                  triggerMobileInteract();
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border shadow-md flex items-center justify-center transition-colors cursor-pointer touch-none ${
                  nearbyInteractable
                    ? 'bg-emerald-600/85 border-emerald-300 text-white'
                    : 'bg-[#0d1528]/65 border-indigo-400/50 text-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold">CHAT</span>
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

      {/* Hoshino Academy Story Chronicle & AI Story Director Modal (Sections 6, 11 & 14) */}
      {storyModalOpen && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center bg-[#050914]/82 px-3 py-4"
          onClick={() => setStoryModalOpen(false)}
        >
          <div
            data-testid="story-director-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-director-title"
            className="w-full max-w-lg max-h-[86vh] overflow-y-auto rounded-xl bg-[#091124]/95 border border-amber-400/45 p-4 shadow-2xl text-slate-100 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2.5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                  {activeStoryObj.subtitle} · {activePhaseObj.title}
                </div>
                <h2
                  id="story-director-title"
                  className="font-display text-base sm:text-lg font-bold text-white"
                >
                  {activeStoryObj.title} ({activeChapter.title})
                </h2>
                <div className="text-[11px] text-indigo-200">
                  Class: {playerClass} · CP: {missionProgress.cpPoints ?? 50} · PP: {missionProgress.ppPoints ?? 150}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  data-testid="open-library-from-modal-btn"
                  onClick={() => openStoryLibrary()}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white cursor-pointer"
                >
                  📚 Story Library
                </button>
                <button
                  type="button"
                  data-testid="story-modal-close-btn"
                  onClick={() => setStoryModalOpen(false)}
                  className="px-2.5 py-1 rounded bg-rose-600/85 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 9-Chapter Continuity Ribbon */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STORY_CHAPTER_ARC.map((ch) => {
                const unlocked = missionProgress.reputationPoints >= ch.unlockXp;
                const isCurrent = ch.index === activeChapter.index;
                return (
                  <div
                    key={ch.code}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 border ${
                      isCurrent
                        ? 'bg-amber-500/90 text-slate-950 font-bold border-amber-200'
                        : unlocked
                          ? 'bg-indigo-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900/70 text-slate-500 border-slate-800'
                    }`}
                  >
                    {ch.index === 0 ? 'Prologue' : ch.index === 8 ? 'Epilogue' : `Ch.${ch.index}`}
                  </div>
                );
              })}
            </div>

            {/* Active Story Director Activity Pack */}
            <div className="rounded-lg bg-[#0d1830] border border-indigo-400/35 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-600/80 text-[10px] font-mono font-bold uppercase text-white">
                  {activeStoryPack.kind} · {activeStoryPack.location}
                </span>
                <span className="text-[10px] font-mono text-amber-300">
                  +{activeStoryPack.xpReward ?? 25} XP
                </span>
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-amber-200">
                {activeStoryPack.title}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeStoryPack.storyText}
              </p>

              <div data-testid="phase-objective-tracker" className="rounded-lg bg-[#071426] border border-emerald-400/30 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Phase Mission Objectives</span>
                  <span className="text-[10px] font-mono text-slate-300">{phaseObjectiveStatus.completedCount}/{phaseObjectiveStatus.total} complete</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all" style={{ width: `${phaseObjectiveStatus.total ? (phaseObjectiveStatus.completedCount / phaseObjectiveStatus.total) * 100 : 0}%` }} />
                </div>
                <ol className="space-y-1.5 text-[11px]">
                  {phaseObjectiveStatus.objectives.map((objective, index) => {
                    const done = phaseObjectiveStatus.completedIndexes.includes(index);
                    return (
                      <li key={`${activeStoryObj.id}_${activePhaseObj.phaseNumber}_obj_${index}`} className={done ? 'text-emerald-300' : 'text-slate-200'}>
                        <span className="font-mono mr-1.5">{done ? '✓' : `${index + 1}.`}</span>{objective}
                      </li>
                    );
                  })}
                </ol>
                {!phaseObjectiveStatus.quizUnlocked && phaseObjectiveStatus.nextObjective && (
                  <div className="rounded bg-amber-950/50 border border-amber-400/30 p-2 text-[11px] text-amber-100">
                    <span className="font-bold">Next clue:</span> {getStoryObjectiveHint(missionProgress)}
                  </div>
                )}
                {phaseObjectiveStatus.quizUnlocked && (
                  <div className="text-[11px] font-semibold text-emerald-300">All required objectives complete. Phase quiz unlocked.</div>
                )}
              </div>
              {/* 4-Option Quiz / Activity Decision */}
              <div className={phaseObjectiveStatus.quizUnlocked ? 'pt-2 border-t border-slate-700/70 space-y-1.5' : 'hidden'}>
                <div className="text-xs font-semibold text-indigo-200">
                  ❓ {activeStoryPack.question}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {activeStoryPack.options.map((opt, idx) => {
                    const isSelected = lastQuizFeedback?.selectedOption === idx;
                    const isRight = idx === activeStoryPack.correctOption;
                    return (
                      <button
                        key={`${activeStoryPack.id}_opt_${idx}`}
                        type="button"
                        data-testid={`story-pack-option-${idx}`}
                        onClick={() => submitStoryPackAnswer(idx)}
                        className={`w-full text-left px-3 py-1.5 rounded border text-xs transition-colors cursor-pointer ${
                          isSelected && lastQuizFeedback?.isCorrect
                            ? 'bg-emerald-700/85 border-emerald-300 text-white font-semibold'
                            : isSelected && !lastQuizFeedback?.isCorrect
                              ? 'bg-amber-900/70 border-amber-400 text-amber-100'
                              : lastQuizFeedback?.isCorrect && isRight
                                ? 'bg-emerald-800/70 border-emerald-400 text-white'
                                : 'bg-[#122040] hover:bg-[#1a2e5a] border-slate-600/70 text-slate-100'
                        }`}
                      >
                        <span className="font-mono text-amber-300 mr-1.5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Constructive Feedback Banner */}
              {lastQuizFeedback && (
                <div
                  data-testid="story-quiz-feedback"
                  className={`p-2.5 rounded border text-xs ${
                    lastQuizFeedback.isCorrect
                      ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-100'
                      : 'bg-amber-950/80 border-amber-400/60 text-amber-100'
                  }`}
                >
                  <div className="font-bold mb-0.5">
                    {lastQuizFeedback.isCorrect
                      ? '✨ Episode Complete! (+XP & Archive Clue Recorded)'
                      : '💡 Friendly Hint — Try Again Anytime:'}
                  </div>
                  <div>{lastQuizFeedback.explanation}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-400">
                  Completed Episodes: {(missionProgress.completedStoryPackIds ?? []).length}/9
                </span>
                <button
                  type="button"
                  data-testid="next-story-pack-btn"
                  disabled={storyLoading}
                  onClick={() => {
                    void requestNextStoryDirectorPack();
                  }}
                  className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  {storyLoading ? 'Generating Episode...' : 'Next Story Activity ▸'}
                </button>
              </div>
            </div>

            {/* Project Hoshikaze Discovered Archive Clues */}
            <div className="rounded-lg bg-[#0b1326] border border-slate-700/80 p-2.5 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                🔍 Project Hoshikaze Archive Notebook ({discoveredClues.length} Clues)
              </div>
              <ul className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-slate-300 pr-1">
                {discoveredClues.map((clue, i) => (
                  <li key={i} className="leading-snug">
                    • {clue}
                  </li>
                ))}
              </ul>
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
