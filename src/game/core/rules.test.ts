import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceMissionProgress,
  applyGraphicsPreset,
  clampCameraPositionAgainstWalls,
  completeStoryPhaseProgress,
  computeAudioGain,
  computeEffectivePixelRatio,
  createInitialNPCRuntimeStates,
  dampValue,
  findNearestInteractable,
  generateSmartNpcReply,
  getAllStories,
  getCampusZoneLabel,
  getCurrentStoryChapter,
  getDeterministicStoryPack,
  getLoadingMessageForProgress,
  getNextCameraViewpoint,
  getNextSchoolPeriod,
  getNextTimeOfDay,
  getSakuraPetalCount,
  getShadowMapSize,
  getSkyWeatherDescription,
  getStoryCompletionPercentage,
  getStudentAcademicRank,
  isInsideSchoolBuilding,
  isPhaseUnlocked,
  isStoryUnlocked,
  mapPhaseToBodyState,
  resolveCampusCollisions,
  sanitizeSettings,
  stepAutonomousNPCs,
  stepPlayerPhysics,
  updateNpcRelationshipOnInteraction,
  validateSaveData,
  validateStoryDirectorPack,
} from './rules';
import { CAMPUS_INTERACTABLES, INITIAL_MISSION_PROGRESS } from '../../config/defaults';
import { PlayerPhysicsState } from '../../types/game';

test('applyGraphicsPreset maps presets to expected shadow and resolution settings', () => {
  const low = applyGraphicsPreset('low');
  assert.equal(low.preset, 'low');
  assert.equal(low.shadowQuality, 'off');
  assert.equal(low.resolutionScale, 0.75);

  const med = applyGraphicsPreset('medium');
  assert.equal(med.preset, 'medium');
  assert.equal(med.shadowQuality, 'medium');
  assert.equal(med.resolutionScale, 1.0);

  const high = applyGraphicsPreset('high');
  assert.equal(high.preset, 'high');
  assert.equal(high.shadowQuality, 'high');
  assert.equal(high.resolutionScale, 1.0);
});

test('getShadowMapSize and getSakuraPetalCount respect performance budgets', () => {
  assert.equal(getShadowMapSize('off'), 0);
  assert.equal(getShadowMapSize('low'), 512);
  assert.equal(getShadowMapSize('medium'), 1024);
  assert.equal(getShadowMapSize('high'), 1024);

  assert.equal(getSakuraPetalCount('low'), 45);
  assert.equal(getSakuraPetalCount('medium'), 90);
  assert.equal(getSakuraPetalCount('high'), 150);
});

test('computeEffectivePixelRatio caps at 1.0 on software WebGL and scales on GPU', () => {
  assert.equal(computeEffectivePixelRatio(2.0, 1.25, true), 1.0);
  assert.equal(computeEffectivePixelRatio(2.0, 0.75, false), 1.5);
  assert.equal(computeEffectivePixelRatio(1.0, 1.25, false), 1.25);
});

test('dampValue smoothly interpolates toward target and clamps dt', () => {
  const step = dampValue(0, 10, 5, 0.016);
  assert.ok(step > 0 && step < 10);
  const clampedStep = dampValue(0, 10, 5, 2.0);
  const maxAllowed = dampValue(0, 10, 5, 0.05);
  assert.equal(clampedStep, maxAllowed);
});

test('computeAudioGain respects master, channel, and muted state', () => {
  assert.equal(computeAudioGain(80, 50, false), 0.4);
  assert.equal(computeAudioGain(80, 50, true), 0);
  assert.equal(computeAudioGain(100, 100, false), 1.0);
});

test('getLoadingMessageForProgress returns stage-matched messages', () => {
  assert.match(getLoadingMessageForProgress(0), /Initializing/i);
  assert.match(getLoadingMessageForProgress(30), /Synthesizing/i);
  assert.match(getLoadingMessageForProgress(60), /Constructing/i);
  assert.match(getLoadingMessageForProgress(85), /Calibrating/i);
  assert.match(getLoadingMessageForProgress(98), /Preparing/i);
});

test('validateSaveData accepts valid save objects and rejects malformed input', () => {
  assert.equal(validateSaveData(null), null);
  assert.equal(validateSaveData({ id: '' }), null);

  const valid = validateSaveData({
    id: 'slot-1',
    version: 5,
    timestamp: 1700000000000,
    chapterTitle: 'Prologue — A New Beginning',
    locationName: 'Hoshino Academy Courtyard',
    timeOfDay: 'golden_hour',
    cameraViewpoint: 'clock_tower',
    playTimeSeconds: 125,
    playerPosition: { x: 2.5, y: 0, z: 18 },
  });

  assert.ok(valid);
  assert.equal(valid.id, 'slot-1');
  assert.equal(valid.cameraViewpoint, 'clock_tower');
  assert.equal(valid.playerPosition?.x, 2.5);
});

test('sanitizeSettings recovers safely from partial or invalid values', () => {
  const sanitized = sanitizeSettings({
    graphics: { preset: 'invalid', shadowQuality: 'low', resolutionScale: 0.75 },
    audio: { masterVolume: 150, musicVolume: -10, sfxVolume: 65, muted: true },
    camera: { sensitivity: 5.0, invertY: true },
  });

  assert.equal(sanitized.graphics.preset, 'high');
  assert.equal(sanitized.graphics.shadowQuality, 'low');
  assert.equal(sanitized.graphics.resolutionScale, 0.75);
  assert.equal(sanitized.audio.masterVolume, 100);
  assert.equal(sanitized.audio.musicVolume, 0);
  assert.equal(sanitized.audio.sfxVolume, 65);
  assert.equal(sanitized.audio.muted, true);
  assert.equal(sanitized.camera.sensitivity, 2.0);
  assert.equal(sanitized.camera.invertY, true);
});

test('mapPhaseToBodyState and viewpoint/time cycling work deterministically', () => {
  assert.equal(mapPhaseToBodyState('loading'), 'title');
  assert.equal(mapPhaseToBodyState('title'), 'title');
  assert.equal(mapPhaseToBodyState('playing'), 'playing');
  assert.equal(mapPhaseToBodyState('paused'), 'paused');

  const nextCam = getNextCameraViewpoint('courtyard_overview');
  assert.equal(nextCam.id, 'clock_tower');

  const nextTod = getNextTimeOfDay('morning');
  assert.equal(nextTod.id, 'golden_hour');

  const nextPeriod = getNextSchoolPeriod('homeroom');
  assert.equal(nextPeriod.id, 'courtyard_recess');
});

test('resolveCampusCollisions prevents wall tunneling, clamps camera, and supports Hoshino Academy regions', () => {
  const pushedFromFountain = resolveCampusCollisions(0, 11.0, 0.45);
  const distFromFountainCenter = Math.hypot(
    pushedFromFountain.x - 0,
    pushedFromFountain.z - 10
  );
  assert.ok(distFromFountainCenter >= 5.19);

  // Walking through central front doors (x = 0, z = -10.5) is unobstructed!
  const insideDoorway = resolveCampusCollisions(0, -10.5, 0.45);
  assert.equal(insideDoorway.x, 0);
  assert.equal(insideDoorway.z, -10.5);
  assert.equal(isInsideSchoolBuilding(-14.2, -16.0), true);
  assert.equal(getCampusZoneLabel(-14.2, -16.0), 'Inside Class A Homeroom');
  assert.equal(getCampusZoneLabel(14.2, -16.0), 'Library & Archive Room');

  // Walking or sprinting into the left front wall (x = -10, z = -9.8, coming from z = -8.8) pushes player back outside (z >= -8.91)
  const pushedFromLeftWall = resolveCampusCollisions(
    -10,
    -9.8,
    0.45,
    undefined,
    undefined,
    -10,
    -8.8
  );
  assert.ok(pushedFromLeftWall.z >= -9.35 + 0.44);

  // Walking or sprinting into a Class A Homeroom student desk (-14.2, -15.0) pushes the player out of the desk AABB!
  const pushedFromClassroomDesk = resolveCampusCollisions(
    -14.2,
    -15.0,
    0.45,
    undefined,
    undefined,
    -12.5,
    -15.0
  );
  assert.ok(pushedFromClassroomDesk.x >= -13.5 + 0.44);

  // Hoshino Academy region labels & walkable Vermilion Bridge over West Koi Pond
  assert.equal(getCampusZoneLabel(0, 88), 'Hoshino Train Station');
  assert.equal(getCampusZoneLabel(60, 8), 'East Aquatics Swimming Pool');
  assert.equal(getCampusZoneLabel(66, -26), 'Hoshino Research Centre & Dome');
  assert.equal(getCampusZoneLabel(-45, -34), 'Hoshino Student Dormitory');
  assert.equal(getCampusZoneLabel(-66, 8), 'West Koi Garden & Bridge');
  assert.equal(getCampusZoneLabel(0, -70), 'Mountain Torii Shrine');
  const onKoiBridge = resolveCampusCollisions(-66.0, 8.0, 0.45);
  assert.equal(onKoiBridge.x, -66.0);
  assert.equal(onKoiBridge.z, 8.0);

  // Camera raycast clamps camera position when a wall lies between player and camera
  const clampedCam = clampCameraPositionAgainstWalls(-10, -8.5, -10, -12.5);
  assert.ok(clampedCam.z > -9.35);

  // Hoshino Academic Rank progression
  assert.equal(getStudentAcademicRank(15).rankTitle, 'New Transfer Student');
  assert.equal(getStudentAcademicRank(60).rankTitle, 'Honor Roll Classmate');
  assert.equal(getStudentAcademicRank(120).rankTitle, 'Hoshino Council Scholar');
  assert.equal(getStudentAcademicRank(190).rankTitle, 'Hoshikaze Archive Guardian');
});

test('stepPlayerPhysics moves player, triggers jump, and blocks walking through NPC bodies', () => {
  const initial: PlayerPhysicsState = {
    x: 0,
    y: 0,
    z: 22,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: Math.PI,
    isGrounded: true,
    coyoteTimer: 0.1,
    jumpBufferTimer: 0,
    isSprinting: false,
    walkPhase: 0,
    squashY: 1,
    squashXZ: 1,
  };

  const step1 = stepPlayerPhysics(
    initial,
    {
      moveX: 0,
      moveZ: -1,
      cameraYaw: 0,
      sprintHeld: true,
      jumpJustPressed: true,
      jumpHeld: true,
    },
    0.03
  );

  assert.ok(step1.nextState.z < initial.z);
  assert.ok(step1.nextState.y > 0);
  assert.equal(step1.nextState.isGrounded, false);
  assert.ok(step1.distanceDelta > 0);

  // Player-vs-NPC physical collision check: player at (0, 20.85) walking straight into NPC at (0, 20.0)
  const nearNpcPlayer: PlayerPhysicsState = {
    ...initial,
    x: 0,
    z: 20.85,
  };
  const blockingNpc = [
    {
      id: 'npc_test_blocker',
      x: 0,
      y: 0,
      z: 20.0,
      yaw: 0,
      walkPhase: 0,
      isMoving: false,
      waypointIndex: 0,
      pauseTimer: 2,
      isGreetingPlayer: true,
      greetingAnim: 'wave' as const,
      greetingBubble: 'Hi!',
      emotionalState: 'Friendly',
      currentActivity: 'Standing',
    },
  ];
  const collidedStep = stepPlayerPhysics(
    nearNpcPlayer,
    {
      moveX: 0,
      moveZ: -1,
      cameraYaw: 0,
      sprintHeld: true,
      jumpJustPressed: false,
      jumpHeld: false,
    },
    0.05,
    blockingNpc
  );
  const distToNpc = Math.hypot(
    collidedStep.nextState.x - 0,
    collidedStep.nextState.z - 20.0
  );
  // Player radius (0.45) + NPC radius (0.46) = 0.91 -> must not penetrate!
  assert.ok(distToNpc >= 0.90);
});

test('findNearestInteractable and advanceMissionProgress track objectives, chapters, clues, and items', () => {
  const found = findNearestInteractable(-3.2, 15.0);
  assert.ok(found.target);
  assert.equal(found.target.id, 'npc_hana');
  assert.equal(found.target.name, 'Aiko Hoshino');

  const foundSensei = findNearestInteractable(-14.0, -18.0);
  assert.ok(foundSensei.target);
  assert.equal(foundSensei.target.id, 'npc_takeda');

  let progress = structuredClone(INITIAL_MISSION_PROGRESS);
  progress = advanceMissionProgress(progress, {
    distanceDelta: 16.5,
    enteredInterior: true,
  });
  assert.equal(progress.distanceWalked, 16.5);
  assert.equal(progress.visitedInterior, true);

  progress = advanceMissionProgress(progress, {
    interactedId: 'npc_hana',
    reputationDelta: 45,
    customMessageSent: true,
    rewardItemName: 'Hoshino Campus Map & Orientation Pass',
    completedStoryPackId: 'pack_prologue',
    clueUnlocked: 'Clue #2: A library note mentions Project Hoshikaze.',
  });
  assert.equal(progress.talkedToHana, true);
  assert.equal(progress.customMessagesSent, 1);
  assert.ok(progress.inventoryItems?.includes('Hoshino Campus Map & Orientation Pass'));
  assert.ok(progress.completedStoryPackIds?.includes('pack_prologue'));
  assert.ok(
    progress.discoveredClues?.includes('Clue #2: A library note mentions Project Hoshikaze.')
  );
  assert.ok((progress.chapterIndex ?? 0) >= 2);
});

test('stepAutonomousNPCs moves 14 Class A-D/Faculty NPCs with personality behavior and pauses near player', () => {
  const initialNpcs = createInitialNPCRuntimeStates(CAMPUS_INTERACTABLES);
  assert.equal(initialNpcs.length, 14);

  // Far player -> Aiko (index 0, pauseTimer 0) moves toward waypoint 1
  const stepped = stepAutonomousNPCs(
    initialNpcs,
    CAMPUS_INTERACTABLES,
    0,
    30,
    null,
    0.05
  );
  assert.equal(stepped[0].isMoving, true);
  assert.ok(stepped[0].walkPhase > 0);
  assert.ok((stepped[0].emotionalState ?? '').length > 0);
  assert.ok((stepped[0].currentActivity ?? '').length > 0);

  // Nearby player right next to Aiko -> Aiko stops moving, faces player, and triggers proximity greeting animation
  const pausedNearPlayer = stepAutonomousNPCs(
    stepped,
    CAMPUS_INTERACTABLES,
    stepped[0].x + 0.5,
    stepped[0].z + 0.5,
    null,
    0.05
  );
  assert.equal(pausedNearPlayer[0].isMoving, false);
  assert.equal(pausedNearPlayer[0].isGreetingPlayer, true);
  assert.equal(pausedNearPlayer[0].greetingAnim, 'bow');
  assert.match(getSkyWeatherDescription('morning', 10), /Fair Cumulus/i);
  assert.match(getSkyWeatherDescription('golden_hour', 20), /Amber Clouds/i);
  assert.match(getSkyWeatherDescription('twilight', 30), /Starlit Sky/i);
});

test('generateSmartNpcReply and Story Director helpers validate Hoshino Academy narrative packs', () => {
  const hinglishReply = generateSmartNpcReply({
    npcId: 'npc_hana',
    npcName: 'Aiko Hoshino',
    npcRole: 'Orientation Guide & Student Council',
    playerMessage: 'Hello Aiko kaise ho?',
    schoolPeriodLabel: 'Period 2 · Courtyard Recess',
  });
  assert.match(hinglishReply.reply, /Aiko/i);
  assert.ok(hinglishReply.affinityBonus >= 10);

  const mysteryReply = generateSmartNpcReply({
    npcId: 'npc_aoi',
    npcName: 'Mika Aozora',
    npcRole: 'Art, Culture & Archive Club',
    playerMessage: 'Tell me about Project Hoshikaze mystery',
    schoolPeriodLabel: 'Period 3 · Club Activities',
  });
  assert.match(mysteryReply.reply, /Project Hoshikaze/i);

  assert.equal(getCurrentStoryChapter(10).index, 0);
  assert.equal(getCurrentStoryChapter(125).index, 3);
  assert.equal(getCurrentStoryChapter(430).index, 8);

  const nextPack = getDeterministicStoryPack(40, ['pack_prologue_arrival']);
  assert.equal(nextPack.id, 'pack_ch1_library_clue');
  assert.equal(nextPack.options.length, 4);

  const validated = validateStoryDirectorPack(
    {
      kind: 'quiz',
      title: 'Archive Key Check',
      summary: 'Test summary',
      chapter: 'Chapter 3 — The Forgotten Records',
      location: 'Library & Archive Room',
      storyText: 'Mika holds up the brass key.',
      unlockAtXp: 80,
      question: 'Where does the key fit?',
      options: ['East Library Cabinet', 'Soccer Goal', 'Ramen Counter', 'Pool Block'],
      correctOption: 0,
      explanation: 'It fits the East Library Archive Cabinet.',
    },
    80,
    []
  );
  assert.equal(validated.kind, 'quiz');
  assert.equal(validated.correctOption, 0);
  assert.equal(validated.options.length, 4);
});

test('V7.0 Story Library sequential phase unlocking, Class A-D points, and NPC relationship memories work', () => {
  const baseProgress = structuredClone(INITIAL_MISSION_PROGRESS);
  const allStories = getAllStories(baseProgress.customStories ?? []);
  assert.equal(allStories.length, 8);

  // Story 01 is unlocked initially, Story 02 is locked until Story 01 phases are completed
  assert.equal(
    isStoryUnlocked(allStories[0].id, baseProgress.completedStoryIds ?? [], allStories),
    true
  );
  assert.equal(
    isStoryUnlocked(allStories[1].id, baseProgress.completedStoryIds ?? [], allStories),
    false
  );

  // Phase 1 of Story 01 is unlocked; Phase 2 is locked until Phase 1 completes
  assert.equal(
    isPhaseUnlocked(
      allStories[0].id,
      1,
      baseProgress.completedPhaseKeys ?? [],
      baseProgress.completedStoryIds ?? [],
      allStories
    ),
    true
  );
  assert.equal(
    isPhaseUnlocked(
      allStories[0].id,
      2,
      baseProgress.completedPhaseKeys ?? [],
      baseProgress.completedStoryIds ?? [],
      allStories
    ),
    false
  );
  assert.equal(
    getStoryCompletionPercentage(allStories[0].id, baseProgress.completedPhaseKeys ?? []),
    0
  );

  // Complete Phase 1 of Story 01
  const afterPhase1 = completeStoryPhaseProgress(baseProgress, allStories[0].id, 1);
  assert.equal(
    isPhaseUnlocked(
      allStories[0].id,
      2,
      afterPhase1.completedPhaseKeys ?? [],
      afterPhase1.completedStoryIds ?? [],
      allStories
    ),
    true
  );
  assert.equal(afterPhase1.activePhaseNumber, 2);
  assert.ok(
    (afterPhase1.classPoints?.['Class D'] ?? 0) >
      (baseProgress.classPoints?.['Class D'] ?? 0)
  );

  // Update NPC relationship and memory on interaction
  const aikoNpc = CAMPUS_INTERACTABLES.find((i) => i.id === 'npc_hana')!;
  const updatedRelMap = updateNpcRelationshipOnInteraction(
    afterPhase1.npcRelationships,
    aikoNpc,
    12,
    'Greeted Aiko during first day orientation in the courtyard.'
  );
  const aikoRel = updatedRelMap['npc_hana'];
  assert.ok(aikoRel);
  assert.ok(
    aikoRel.friendship > (baseProgress.npcRelationships?.['npc_hana']?.friendship ?? 0)
  );
  assert.ok(aikoRel.memories.some((m: string) => m.includes('Greeted Aiko')));
});



