import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ATMOSPHERE_PRESETS,
  CAMPUS_INTERACTABLES,
} from '../../config/defaults';
import { useGameStore } from '../../store/useGameStore';
import { PlayerPhysicsState } from '../../types/game';
import { AcademyCameraController } from '../camera/CameraController';
import {
  computeEffectivePixelRatio,
  createInitialNPCRuntimeStates,
  dampAngle,
  findNearestInteractable,
  getSakuraPetalCount,
  getShadowMapSize,
  isInsideSchoolBuilding,
  stepAutonomousNPCs,
  stepPlayerPhysics,
} from '../core/rules';
import {
  applyCharacterCustomizationToRig,
  CharacterActorRig,
  createAnimeCharacterRig,
  createNoticeBoardLandmark,
  updateCharacterRigAnimation,
} from '../entities/AnimeCharacterBuilder';
import { buildAcademyEnvironment } from '../environment/AcademyModels';
import { loadImportedStudentRig } from '../entities/ImportedStudentRig';
import type { ImportedStudentRig } from '../entities/ImportedStudentRig';
import { createProceduralTextureSet } from '../environment/ProceduralTextures';
import { audioManager } from '../systems/AudioManager';
import { sharedInputBridge } from '../systems/InputBridge';
import { findBestContextualInteraction } from '../systems/ObjectInteractionSystem';

const _petalDummy = new THREE.Object3D();
const _sunColor = new THREE.Color();
const _hemiSkyColor = new THREE.Color();
const _hemiGroundColor = new THREE.Color();
const _fogColor = new THREE.Color();

export function AcademyCanvas() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Store mutable references for the 60Hz loop so React state updates never recreate WebGLRenderer
  const stateRef = useRef({
    phase: useGameStore.getState().phase,
    cameraMode: useGameStore.getState().cameraMode,
    activeViewpoint: useGameStore.getState().activeViewpoint,
    timeOfDay: useGameStore.getState().timeOfDay,
    settings: useGameStore.getState().settings,
    activeDialogue: useGameStore.getState().activeDialogue,
    nearbyInteractableId: useGameStore.getState().nearbyInteractable?.id ?? null,
    contextualPromptId: useGameStore.getState().contextualPrompt?.id ?? null,
    activeObjectInteraction: useGameStore.getState().activeObjectInteraction,
    activeObjectModal: useGameStore.getState().activeObjectModal,
    openDoorIds:
      useGameStore.getState().missionProgress.openDoorIds ?? [
        'door_main_front',
        'door_class_a',
        'door_class_b',
        'door_class_c',
        'door_class_d',
        'door_library',
      ],
    characterCustomization:
      useGameStore.getState().missionProgress.characterCustomization,
  });

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      stateRef.current = {
        phase: state.phase,
        cameraMode: state.cameraMode,
        activeViewpoint: state.activeViewpoint,
        timeOfDay: state.timeOfDay,
        settings: state.settings,
        activeDialogue: state.activeDialogue,
        nearbyInteractableId: state.nearbyInteractable?.id ?? null,
        contextualPromptId: state.contextualPrompt?.id ?? null,
        activeObjectInteraction: state.activeObjectInteraction,
        activeObjectModal: state.activeObjectModal,
        openDoorIds:
          state.missionProgress.openDoorIds ?? [
            'door_main_front',
            'door_class_a',
            'door_class_b',
            'door_class_c',
            'door_class_d',
            'door_library',
          ],
        characterCustomization: state.missionProgress.characterCustomization,
      };
    });
    return unsub;
  }, []);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    // 1. Software-WebGL Guard (detect SwiftShader / llvmpipe / software renderer)
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Initialize WebGLRenderer with resilient mobile/WebView fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: 'default',
        });
      } catch {
        useGameStore.getState().markSceneReady();
        void useGameStore.getState().initializeStore();
        return;
      }
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const initialSettings = stateRef.current.settings;
    const initialDpr = computeEffectivePixelRatio(
      window.devicePixelRatio || 1,
      initialSettings.graphics.resolutionScale,
      isSoftwareGl
    );
    renderer.setPixelRatio(initialDpr);
    renderer.setSize(
      mountEl.clientWidth || window.innerWidth,
      mountEl.clientHeight || window.innerHeight
    );

    const shadowsEnabled =
      !isSoftwareGl && initialSettings.graphics.shadowQuality !== 'off';
    renderer.shadowMap.enabled = shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.setAttribute('data-testid', 'academy-webgl-canvas');
    renderer.domElement.className = 'block w-full h-full outline-none touch-none';
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // 3. Create Scene, Studio RoomEnvironment & Atmosphere
    const scene = new THREE.Scene();
    const initialAtmo = ATMOSPHERE_PRESETS[stateRef.current.timeOfDay];
    scene.background = new THREE.Color(initialAtmo.fogColor);
    const sceneFog = new THREE.FogExp2(initialAtmo.fogColor, initialAtmo.fogDensity);
    scene.fog = sceneFog;

    let envTarget: THREE.WebGLRenderTarget | null = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envTarget.texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback if float/half-float PMREM is unsupported on legacy mobile WebView
    }

    // 4. Camera & Controller
    const camera = new THREE.PerspectiveCamera(
      50,
      (mountEl.clientWidth || window.innerWidth) /
        Math.max(1, mountEl.clientHeight || window.innerHeight),
      0.2,
      240
    );
    const cameraController = new AcademyCameraController();

    // 5. Balanced Studio & Outdoor Lighting (Warm Key Light + Cool Hemisphere Fill)
    const hemiLight = new THREE.HemisphereLight(
      initialAtmo.hemiSkyColor,
      initialAtmo.hemiGroundColor,
      initialAtmo.hemiIntensity
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      initialAtmo.sunColor,
      initialAtmo.sunIntensity
    );
    sunLight.position.set(...initialAtmo.sunPosition);
    sunLight.castShadow = shadowsEnabled;

    const initialShadowSize = getShadowMapSize(initialSettings.graphics.shadowQuality) || 1024;
    sunLight.shadow.mapSize.width = initialShadowSize;
    sunLight.shadow.mapSize.height = initialShadowSize;
    const d = 38;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 135;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Subtle cool rim light from behind the academy clock tower
    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.45);
    rimLight.position.set(0, 26, -45);
    scene.add(rimLight);

    // 6. Build Procedural Textures & 3D Academy Environment
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextureSet(maxAniso);
    const academyEnv = buildAcademyEnvironment(textures);
    scene.add(academyEnv.rootGroup);

    // 7. Build Phase 2 Playable Anime Protagonist & Campus NPCs / Landmarks
    const entitiesGroup = new THREE.Group();
    entitiesGroup.name = 'AcademyEntitiesGroup';
    scene.add(entitiesGroup);

    let playerState: PlayerPhysicsState = {
      x: sharedInputBridge.playerX,
      y: sharedInputBridge.playerY,
      z: sharedInputBridge.playerZ,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: sharedInputBridge.playerYaw,
      isGrounded: true,
      coyoteTimer: 0.1,
      jumpBufferTimer: 0,
      isSprinting: false,
      walkPhase: 0,
      squashY: 1,
      squashXZ: 1,
    };

    const protagonistRig = createAnimeCharacterRig({
      hairColor: 0x1e1b4b, // Deep anime indigo-black spiky hair
      blazerColor: 0x172554, // Seiran navy male blazer
      accentColor: 0xe11d48, // Crimson school necktie
      gender: 'male',
      isProtagonist: true,
      contactShadowMap: textures.contactShadowMap,
    });
    protagonistRig.root.position.set(playerState.x, playerState.y, playerState.z);
    protagonistRig.root.rotation.y = playerState.yaw;
    entitiesGroup.add(protagonistRig.root);

    // Instantiate Campus NPCs & Notice Board Landmark
    let npcStates = createInitialNPCRuntimeStates(CAMPUS_INTERACTABLES);
    let academicSessionId: number | null = null;
    let lastAcademicCheckpoint = 0;
    const checkpointNpcAcademics = () => {
      const store = useGameStore.getState();
      if (store.phase !== 'playing') return;
      const npcAcademicRecords = Object.fromEntries(
        npcStates.map((npc) => [
          npc.id,
          {
            academicProgress: Number((npc.academicProgress ?? 0).toFixed(3)),
            motivation: Number((npc.motivation ?? 0).toFixed(3)),
          },
        ])
      );
      useGameStore.setState({
        missionProgress: { ...store.missionProgress, npcAcademicRecords },
      });
      void useGameStore.getState().saveCurrentSession();
    };
    const npcRigs: Array<{
      id: string;
      rig: CharacterActorRig;
    }> = [];
    const landmarkDisposers: Array<() => void> = [];

    for (const item of CAMPUS_INTERACTABLES) {
      if (item.kind === 'npc') {
        const npcRig = createAnimeCharacterRig({
          hairColor: item.hairColor,
          blazerColor: item.blazerColor,
          accentColor: item.accentColor,
          gender:
            item.gender ??
            (item.id === 'npc_ren' ||
            item.id === 'npc_kaito' ||
            item.id === 'npc_takeda' ||
            item.id === 'npc_haruto' ||
            item.id === 'npc_daichi' ||
            item.id === 'npc_riku' ||
            item.id === 'npc_kenzo'
              ? 'male'
              : 'female'),
          isProtagonist: false,
          contactShadowMap: textures.contactShadowMap,
        });
        npcRig.root.position.set(item.position.x, item.position.y, item.position.z);
        npcRig.root.rotation.y = item.facingYaw;
        entitiesGroup.add(npcRig.root);
        npcRigs.push({
          id: item.id,
          rig: npcRig,
        });
      } else if (item.id === 'landmark_notice_board') {
        const board = createNoticeBoardLandmark(textures.contactShadowMap);
        board.root.position.set(item.position.x, item.position.y, item.position.z);
        board.root.rotation.y = item.facingYaw;
        entitiesGroup.add(board.root);
        landmarkDisposers.push(board.dispose);
      }
    }

    // Upgrade Aiko's visual actor to the supplied Sketchfab student model when the
    // asset is present. Keep the existing procedural actor as a safe 404/error fallback.
    let importedStudentRig: ImportedStudentRig | null = null;
    let sceneDisposed = false;
    const aikoFallbackRig = npcRigs.find((entry) => entry.id === 'npc_hana')?.rig;
    if (aikoFallbackRig) {
      void loadImportedStudentRig()
        .then((rig) => {
          if (sceneDisposed) {
            rig.dispose();
            return;
          }
          importedStudentRig = rig;
          rig.root.position.copy(aikoFallbackRig.root.position);
          rig.root.rotation.y = aikoFallbackRig.root.rotation.y;
          entitiesGroup.add(rig.root);
          aikoFallbackRig.root.visible = false;
        })
        .catch((error: unknown) => {
          // Keep the procedural Aiko actor visible if the optional GLB is not installed.
          aikoFallbackRig.root.visible = true;
          console.info('Imported student model unavailable; using procedural NPC fallback.', error);
        });
    }

    // Homeroom visual attendance: populate every class with background classmates.
    // These non-interactive crowd actors are lightweight visual students; named NPCs retain
    // their own autonomous schedules, dialogue, relationships and story progression.
    const classroomCrowd: Array<{
      rig: CharacterActorRig;
      homePeriodOnly: boolean;
      phase: number;
    }> = [];
    const classroomLayouts = [
      // Nine seated classmates per room (three columns by three rows) make all four
      // homerooms read as active classes instead of sparsely populated demo spaces.
      { classId: 'A', color: 0x172554, accent: 0x38bdf8, cols: [-18.2, -14.2, -10.2], rows: [-17.2, -15.0, -12.8], count: 9 },
      { classId: 'B', color: 0x1e293b, accent: 0x38bdf8, cols: [-24.5, -20.5, -16.5], rows: [-4.6, -2.2, 0.2], count: 9 },
      { classId: 'C', color: 0x1e293b, accent: 0xa855f7, cols: [16.5, 20.5, 24.5], rows: [-4.6, -2.2, 0.2], count: 9 },
      { classId: 'D', color: 0x1e293b, accent: 0x10b981, cols: [-34.0, -30.0, -26.0], rows: [-17.2, -15.0, -12.8], count: 9 },
    ] as const;
    const crowdHair = [0x312e81, 0x7c2d12, 0x0f766e, 0x334155, 0x9d174d, 0x4c1d95];
    let crowdIndex = 0;
    for (const layout of classroomLayouts) {
      for (let student = 0; student < layout.count; student++) {
        const col = student % layout.cols.length;
        const row = Math.floor(student / layout.cols.length);
        const x = layout.cols[col];
        const z = layout.rows[row] + 0.68;
        const rig = createAnimeCharacterRig({
          hairColor: crowdHair[crowdIndex % crowdHair.length],
          blazerColor: layout.color,
          accentColor: layout.accent,
          gender: crowdIndex % 2 === 0 ? 'female' : 'male',
          isProtagonist: false,
          contactShadowMap: textures.contactShadowMap,
        });
        rig.root.position.set(x, 0, z);
        rig.root.rotation.y = 0;
        rig.root.visible = false;
        entitiesGroup.add(rig.root);
        classroomCrowd.push({ rig, homePeriodOnly: true, phase: crowdIndex * 0.73 });
        crowdIndex++;
      }
    }

    // Pre-compile shaders on hardware GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Initialize store progress & readiness
    useGameStore.getState().markSceneReady();
    void useGameStore.getState().initializeStore();

    // 8. Pointer & Keyboard Controls + Focus Hygiene
    const heldKeys = new Set<string>();
    let jumpKeyJustPressed = false;

    const onPointerDown = (e: PointerEvent) => {
      const p = stateRef.current.phase;
      if (p !== 'playing' && p !== 'character-creation' && p !== 'character-intro') return;
      cameraController.onPointerDown(e.clientX, e.clientY, e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const p = stateRef.current.phase;
      if (p !== 'playing' && p !== 'character-creation' && p !== 'character-intro') return;
      const { sensitivity, invertY } = stateRef.current.settings.camera;
      cameraController.onPointerMove(
        e.clientX,
        e.clientY,
        sensitivity,
        invertY,
        e.pointerId
      );
    };
    const onPointerUp = (e: PointerEvent) => {
      cameraController.onPointerUp(e.pointerId);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      heldKeys.add(e.code);
      if (e.code === 'Space' && !e.repeat) {
        jumpKeyJustPressed = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };
    const onBlur = () => {
      heldKeys.clear();
      cameraController.onPointerUp();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Track state diffs
    let prevViewpoint = stateRef.current.activeViewpoint;
    let prevShadowQuality = initialSettings.graphics.shadowQuality;
    let prevResScale = initialSettings.graphics.resolutionScale;
    let prevPreset = initialSettings.graphics.preset;
    let totalWalkedForFootsteps = 0;
    let lastFootstepDist = 0;
    let unsavedWalkDistance = 0;
    let stepCount = 0;
    let wasInsideSchool = false;

    // 9. Animation Loop State & Responsive ResizeObserver
    let frameId = 0;
    let isDisposed = false;
    let lastTime = performance.now();
    let elapsedTotal = 0;

    const handleResize = () => {
      if (!mountEl || isDisposed) return;
      const w = Math.max(1, mountEl.clientWidth || window.innerWidth);
      const h = Math.max(1, mountEl.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      cameraController.update(
        camera,
        stateRef.current.phase,
        stateRef.current.cameraMode,
        stateRef.current.activeViewpoint,
        playerState,
        elapsedTotal,
        0.016,
        academyEnv.rootGroup
      );
      renderer.render(scene, camera);
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountEl);
    window.addEventListener('resize', handleResize);

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (isDisposed) return;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

      const {
        phase,
        cameraMode,
        activeViewpoint,
        timeOfDay,
        settings,
        activeDialogue,
        nearbyInteractableId,
      } = stateRef.current;

      // Sync dynamic Graphics Settings changes immediately
      if (settings.graphics.resolutionScale !== prevResScale) {
        prevResScale = settings.graphics.resolutionScale;
        const nextDpr = computeEffectivePixelRatio(
          window.devicePixelRatio || 1,
          prevResScale,
          isSoftwareGl
        );
        renderer.setPixelRatio(nextDpr);
        handleResize();
      }

      if (settings.graphics.shadowQuality !== prevShadowQuality) {
        prevShadowQuality = settings.graphics.shadowQuality;
        const enableShad = !isSoftwareGl && prevShadowQuality !== 'off';
        renderer.shadowMap.enabled = enableShad;
        sunLight.castShadow = enableShad;
        const mapSz = getShadowMapSize(prevShadowQuality);
        if (mapSz > 0 && sunLight.shadow.mapSize.width !== mapSz) {
          sunLight.shadow.mapSize.set(mapSz, mapSz);
          sunLight.shadow.map?.dispose();
          sunLight.shadow.map = null;
        }
        renderer.shadowMap.needsUpdate = true;
      }

      if (settings.graphics.preset !== prevPreset) {
        prevPreset = settings.graphics.preset;
        academyEnv.petalInstancedMesh.count = getSakuraPetalCount(prevPreset);
      }

      if (activeViewpoint !== prevViewpoint) {
        prevViewpoint = activeViewpoint;
        cameraController.resetOffsets();
      }

      // Advance simulation clock when not paused
      if (phase !== 'paused') {
        elapsedTotal += dt;

        if (phase === 'playing') {
          // Consume any requested quick-zone teleport (e.g., Classroom 2-A, Library, North Track)
          if (sharedInputBridge.teleportRequest) {
            const req = sharedInputBridge.teleportRequest;
            sharedInputBridge.teleportRequest = null;
            playerState.x = req.x;
            playerState.y = 0;
            playerState.z = req.z;
            playerState.vx = 0;
            playerState.vy = 0;
            playerState.vz = 0;
            playerState.yaw = req.yaw;
            cameraController.setCameraYaw(0);
            audioManager.playDoorTransition();
          }

          // Consume one-shot mobile interact press
          if (sharedInputBridge.mobileInteractJustPressed) {
            sharedInputBridge.mobileInteractJustPressed = false;
            if (!activeDialogue) {
              useGameStore.getState().triggerContextualInteraction();
            }
          }

          const { activeObjectInteraction, activeObjectModal, openDoorIds } =
            stateRef.current;

          // Smoothly animate hinged campus doors based on openDoorIds
          for (const [doorId, pivot] of Object.entries(academyEnv.doorPivots)) {
            const isOpen = openDoorIds.includes(doorId);
            const targetAngle = isOpen
              ? doorId === 'door_class_b' || doorId === 'door_class_c'
                ? Math.PI * 0.45
                : -Math.PI * 0.48
              : 0;
            pivot.rotation.y = dampAngle(pivot.rotation.y, targetAngle, 7.5, dt);
          }

          // Gather WASD + Arrow movement or camera orbit depending on cameraMode
          // Note: moveZ < 0 is forward (-Z), moveZ > 0 is backward (+Z)
          let kbMoveX = 0;
          let kbMoveZ = 0;
          const movementLocked =
            Boolean(activeDialogue) ||
            Boolean(activeObjectInteraction) ||
            activeObjectModal !== 'none';

          if (!movementLocked) {
            if (heldKeys.has('KeyA')) kbMoveX -= 1;
            if (heldKeys.has('KeyD')) kbMoveX += 1;
            if (heldKeys.has('KeyW')) kbMoveZ -= 1;
            if (heldKeys.has('KeyS')) kbMoveZ += 1;

            if (cameraMode === 'follow') {
              if (heldKeys.has('ArrowLeft')) kbMoveX -= 1;
              if (heldKeys.has('ArrowRight')) kbMoveX += 1;
              if (heldKeys.has('ArrowUp')) kbMoveZ -= 1;
              if (heldKeys.has('ArrowDown')) kbMoveZ += 1;

              // Q / E rotate camera yaw smoothly on desktop
              const keyOrbitSpeed = 1.45 * dt * settings.camera.sensitivity;
              if (heldKeys.has('KeyQ')) {
                cameraController.applyKeyRotation(-keyOrbitSpeed, 0);
              }
              if (heldKeys.has('KeyE') && !nearbyInteractableId) {
                cameraController.applyKeyRotation(keyOrbitSpeed, 0);
              }
            } else {
              // In overview mode, Arrow keys orbit the overview camera
              const keySpeed = 1.2 * dt * settings.camera.sensitivity;
              if (heldKeys.has('ArrowLeft')) cameraController.applyKeyRotation(-keySpeed, 0);
              if (heldKeys.has('ArrowRight')) cameraController.applyKeyRotation(keySpeed, 0);
              if (heldKeys.has('ArrowUp')) cameraController.applyKeyRotation(0, keySpeed * 0.5);
              if (heldKeys.has('ArrowDown')) cameraController.applyKeyRotation(0, -keySpeed * 0.5);
            }
          }

          // Combine keyboard & mobile virtual thumbstick (joystickY > 0 is up on screen -> negative moveZ)
          const combinedMoveX = movementLocked
            ? 0
            : Math.max(-1, Math.min(1, kbMoveX + sharedInputBridge.joystickX));
          const combinedMoveZ = movementLocked
            ? 0
            : Math.max(-1, Math.min(1, kbMoveZ - sharedInputBridge.joystickY));

          // If player initiates movement while in overview mode, switch to third-person follow camera
          if (
            cameraMode === 'overview' &&
            Math.hypot(combinedMoveX, combinedMoveZ) > 0.15
          ) {
            useGameStore.getState().setCameraMode('follow');
          }

          const sprintHeld =
            !movementLocked &&
            (heldKeys.has('ShiftLeft') ||
              heldKeys.has('ShiftRight') ||
              sharedInputBridge.mobileSprintHeld ||
              sharedInputBridge.mobileSprintToggle);

          const jumpJustPressed =
            !movementLocked &&
            (jumpKeyJustPressed || sharedInputBridge.mobileJumpJustPressed);
          const jumpHeld =
            !movementLocked &&
            (heldKeys.has('Space') || sharedInputBridge.mobileJumpHeld);

          jumpKeyJustPressed = false;
          sharedInputBridge.mobileJumpJustPressed = false;

          const wasGrounded = playerState.isGrounded;

          if (activeObjectInteraction) {
            // Align player smoothly to the furniture/object anchor while sitting/studying/eating/using computer
            playerState.x = activeObjectInteraction.anchorPosition.x;
            playerState.y = activeObjectInteraction.anchorPosition.y;
            playerState.z = activeObjectInteraction.anchorPosition.z;
            playerState.vx = 0;
            playerState.vy = 0;
            playerState.vz = 0;
            playerState.yaw = dampAngle(
              playerState.yaw,
              activeObjectInteraction.anchorYaw,
              10.0,
              dt
            );
          } else {
            const stepResult = stepPlayerPhysics(
              playerState,
              {
                moveX: combinedMoveX,
                moveZ: combinedMoveZ,
                cameraYaw: cameraController.getCameraYaw(),
                sprintHeld,
                jumpJustPressed,
                jumpHeld,
              },
              dt,
              npcStates
            );
            playerState = stepResult.nextState;

            // Play procedural footstep SFX synced to distanceDelta (crisp indoor shoes vs outdoor stone)
            if (stepResult.distanceDelta > 0) {
              const nowInside = isInsideSchoolBuilding(playerState.x, playerState.z);
              totalWalkedForFootsteps += stepResult.distanceDelta;
              unsavedWalkDistance += stepResult.distanceDelta;
              if (
                totalWalkedForFootsteps - lastFootstepDist >= 1.65 &&
                playerState.isGrounded
              ) {
                lastFootstepDist = totalWalkedForFootsteps;
                stepCount += 1;
                audioManager.playFootstep(stepCount, nowInside);
              }
              if (unsavedWalkDistance >= 0.6) {
                useGameStore.getState().recordMovementDistance(unsavedWalkDistance);
                unsavedWalkDistance = 0;
              }
            }
          }

          // Update protagonist 3D transform & real-time customization
          applyCharacterCustomizationToRig(
            protagonistRig,
            stateRef.current.characterCustomization
          );
          protagonistRig.root.position.set(playerState.x, playerState.y, playerState.z);
          protagonistRig.root.rotation.y = playerState.yaw;

          // Check if player just entered or exited the walkable school interior
          const nowInsideSchool = isInsideSchoolBuilding(playerState.x, playerState.z);
          if (nowInsideSchool !== wasInsideSchool) {
            wasInsideSchool = nowInsideSchool;
            audioManager.playDoorTransition();
            if (nowInsideSchool) {
              useGameStore.getState().recordInteriorVisit();
            }
          }

          // Play Jump SFX when leaving ground via jump
          if (wasGrounded && !playerState.isGrounded && playerState.vy > 2.0) {
            audioManager.playJump();
          }

          // Export live coordinates to shared bridge
          sharedInputBridge.playerX = playerState.x;
          sharedInputBridge.playerY = playerState.y;
          sharedInputBridge.playerZ = playerState.z;
          sharedInputBridge.playerYaw = playerState.yaw;

          // Update protagonist rig animation (including V8.0 object postures: sit, study, read, use_computer, eat)
          const isMoving =
            !activeObjectInteraction &&
            Math.hypot(playerState.vx, playerState.vz) > 0.25;
          updateCharacterRigAnimation(
            protagonistRig,
            playerState.walkPhase,
            isMoving,
            playerState.isSprinting,
            playerState.squashY,
            playerState.squashXZ,
            elapsedTotal,
            false,
            'wave',
            activeObjectInteraction?.posture ?? 'none'
          );

          // Restore saved student standings once per play session; checkpoint at most every 30s.
          // New games have a different session start and therefore reset their academic records.
          const academicStore = useGameStore.getState();
          if (academicSessionId !== academicStore.sessionStartTime) {
            academicSessionId = academicStore.sessionStartTime;
            const records = academicStore.missionProgress.npcAcademicRecords ?? {};
            npcStates = npcStates.map((npc) => {
              const record = records[npc.id];
              return record
                ? {
                    ...npc,
                    academicProgress: Math.max(0, Math.min(100, record.academicProgress)),
                    motivation: Math.max(0, Math.min(100, record.motivation)),
                  }
                : npc;
            });
            lastAcademicCheckpoint = performance.now();
          }
          if (performance.now() - lastAcademicCheckpoint >= 30000) {
            lastAcademicCheckpoint = performance.now();
            checkpointNpcAcademics();
          }

          // Step autonomous NPC patrols before checking proximity
          npcStates = stepAutonomousNPCs(
            npcStates,
            CAMPUS_INTERACTABLES,
            playerState.x,
            playerState.z,
            activeDialogue?.target.id ?? null,
            dt,
            useGameStore.getState().schoolPeriod
          );

          // Check proximity to live moving Campus NPCs and Notice Board
          const nearest = findNearestInteractable(
            playerState.x,
            playerState.z,
            CAMPUS_INTERACTABLES,
            npcStates
          );
          const nearestId = nearest.target?.id ?? null;
          if (nearestId !== nearbyInteractableId) {
            useGameStore.getState().setNearbyInteractable(nearest.target);
          }

          // V8.0 Universal Contextual Object & NPC Interaction Detection
          const bestContextual = findBestContextualInteraction({
            playerX: playerState.x,
            playerZ: playerState.z,
            playerYaw: playerState.yaw,
            npcRuntimeStates: npcStates,
            openDoorIds,
            currentStickyId: stateRef.current.contextualPromptId,
          });
          useGameStore.getState().setContextualPrompt(bestContextual);
        } else {
          // Even on title / character-creation screen, sync customization & let NPCs stroll around the courtyard!
          applyCharacterCustomizationToRig(
            protagonistRig,
            stateRef.current.characterCustomization
          );
          protagonistRig.root.position.set(playerState.x, playerState.y, playerState.z);
          protagonistRig.root.rotation.y =
            phase === 'character-creation' || phase === 'character-intro'
              ? 0
              : playerState.yaw;
          npcStates = stepAutonomousNPCs(
            npcStates,
            CAMPUS_INTERACTABLES,
            999,
            999,
            null,
            dt,
            useGameStore.getState().schoolPeriod
          );
          updateCharacterRigAnimation(
            protagonistRig,
            playerState.walkPhase,
            false,
            false,
            1,
            1,
            elapsedTotal,
            phase === 'character-creation' || phase === 'character-intro',
            'wave'
          );
        }

        // Classroom attendance: show seated classmates only during morning homeroom.
        // Their staggered idle animation avoids a perfectly frozen, mannequin-like classroom.
        const isHomeroom = useGameStore.getState().schoolPeriod === 'homeroom';
        for (const student of classroomCrowd) {
          student.rig.root.visible = student.homePeriodOnly && isHomeroom;
          if (student.rig.root.visible) {
            updateCharacterRigAnimation(
              student.rig,
              student.phase,
              false,
              false,
              1,
              1,
              elapsedTotal + student.phase,
              false,
              'nod',
              'sit'
            );
          }
        }

        // Sync 3D transforms and walk-cycle animations for all autonomous Campus NPCs
        for (let i = 0; i < npcRigs.length; i++) {
          const npcEntry = npcRigs[i];
          const runtime = npcStates[i];
          if (!runtime) continue;

          if (npcEntry.id === 'npc_hana' && importedStudentRig) {
            importedStudentRig.root.position.set(runtime.x, runtime.y, runtime.z);
            importedStudentRig.root.rotation.y = runtime.yaw;
            importedStudentRig.update(elapsedTotal + i * 1.1, runtime.isMoving, 1, Boolean(runtime.isGreetingPlayer), runtime.greetingAnim, runtime.objectPosture ?? 'none');
          } else {
            npcEntry.rig.root.position.set(runtime.x, runtime.y, runtime.z);
            npcEntry.rig.root.rotation.y = runtime.yaw;
            updateCharacterRigAnimation(
              npcEntry.rig,
              runtime.walkPhase,
              runtime.isMoving,
              false,
              1,
              1,
              elapsedTotal + i * 1.1,
              Boolean(runtime.isGreetingPlayer),
              runtime.greetingAnim,
              runtime.objectPosture ?? 'none'
            );
          }
        }

        // Automatic Sky Weather & Time-of-Day Cycle (smoothly transitions every 75 seconds)
        if (
          phase === 'playing' &&
          Math.floor((elapsedTotal - dt) / 75) < Math.floor(elapsedTotal / 75)
        ) {
          useGameStore.getState().cycleTimeOfDay();
        }

        // Smoothly interpolate Atmosphere / Time-of-Day lighting
        const targetAtmo = ATMOSPHERE_PRESETS[timeOfDay];
        const lerpAlpha = 1 - Math.exp(-3.5 * dt);

        _fogColor.set(targetAtmo.fogColor);
        sceneFog.color.lerp(_fogColor, lerpAlpha);
        sceneFog.density = THREE.MathUtils.lerp(
          sceneFog.density,
          targetAtmo.fogDensity,
          lerpAlpha
        );
        if (scene.background instanceof THREE.Color) {
          scene.background.lerp(_fogColor, lerpAlpha);
        }

        _sunColor.set(targetAtmo.sunColor);
        sunLight.color.lerp(_sunColor, lerpAlpha);
        sunLight.intensity = THREE.MathUtils.lerp(
          sunLight.intensity,
          targetAtmo.sunIntensity,
          lerpAlpha
        );
        sunLight.position.lerp(
          _petalDummy.position.set(...targetAtmo.sunPosition),
          lerpAlpha
        );

        _hemiSkyColor.set(targetAtmo.hemiSkyColor);
        _hemiGroundColor.set(targetAtmo.hemiGroundColor);
        hemiLight.color.lerp(_hemiSkyColor, lerpAlpha);
        hemiLight.groundColor.lerp(_hemiGroundColor, lerpAlpha);
        hemiLight.intensity = THREE.MathUtils.lerp(
          hemiLight.intensity,
          targetAtmo.hemiIntensity,
          lerpAlpha
        );

        // Tint & drift 3D volumetric sky clouds + celestial sun/moon orb
        const targetCloudColor =
          timeOfDay === 'morning'
            ? 0xffffff
            : timeOfDay === 'golden_hour'
              ? 0xffd8b8
              : 0x64748b;
        const targetCloudEmissive =
          timeOfDay === 'morning'
            ? 0xe2e8f0
            : timeOfDay === 'golden_hour'
              ? 0xf97316
              : 0x312e81;
        academyEnv.cloudMaterial.color.lerp(
          _sunColor.setHex(targetCloudColor),
          lerpAlpha
        );
        academyEnv.cloudMaterial.emissive.lerp(
          _hemiSkyColor.setHex(targetCloudEmissive),
          lerpAlpha
        );

        const celestialMat = academyEnv.celestialDisc
          .material as THREE.MeshBasicMaterial;
        celestialMat.color.lerp(
          _sunColor.setHex(
            timeOfDay === 'morning'
              ? 0xfef08a
              : timeOfDay === 'golden_hour'
                ? 0xfb923c
                : 0xe0e7ff
          ),
          lerpAlpha
        );
        academyEnv.celestialDisc.position.set(
          targetAtmo.sunPosition[0] * 1.4,
          Math.max(36, targetAtmo.sunPosition[1] * 1.35),
          -95
        );

        for (const cloudObj of academyEnv.cloudGroup.children) {
          const speed = (cloudObj.userData?.driftSpeed as number) || 1.3;
          const baseY = (cloudObj.userData?.baseY as number) || 45;
          const bobPhase = (cloudObj.userData?.bobPhase as number) || 0;
          cloudObj.position.x += speed * dt;
          if (cloudObj.position.x > 140) {
            cloudObj.position.x = -140;
          }
          cloudObj.position.y =
            baseY + Math.sin(elapsedTotal * 0.45 + bobPhase) * 0.55;
        }

        academyEnv.facadeMaterial.emissiveIntensity = THREE.MathUtils.lerp(
          academyEnv.facadeMaterial.emissiveIntensity,
          targetAtmo.windowEmissiveIntensity,
          lerpAlpha
        );
        academyEnv.lanternBulbMaterial.emissiveIntensity = THREE.MathUtils.lerp(
          academyEnv.lanternBulbMaterial.emissiveIntensity,
          Math.max(0.25, targetAtmo.lanternIntensity),
          lerpAlpha
        );
        for (const pt of academyEnv.lanternPointLights) {
          pt.intensity = THREE.MathUtils.lerp(
            pt.intensity,
            targetAtmo.lanternIntensity,
            lerpAlpha
          );
        }

        // Subtle courtyard fountain animation & clock tower hands
        academyEnv.fountainWaterRing.rotation.y += dt * 0.35;
        academyEnv.clockMinuteHand.rotation.z -= dt * 0.04;
        academyEnv.clockHourHand.rotation.z -= dt * (0.04 / 12);

        // Update pooled sakura petals in place (zero GC)
        const activePetalCount = getSakuraPetalCount(settings.graphics.preset);
        academyEnv.petalInstancedMesh.count = activePetalCount;
        for (let i = 0; i < activePetalCount; i++) {
          const p = academyEnv.petalData[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.rx += dt * 1.4;
          p.ry += dt * 1.9;

          if (p.y < 0.15) {
            p.y = 11.5;
            p.x = (((i * 73) % 100) / 100 - 0.5) * 44;
            p.z = -6 + (((i * 251) % 100) / 100) * 42;
          }
          if (p.x < -24) p.x = 24;

          _petalDummy.position.set(p.x, p.y, p.z);
          _petalDummy.rotation.set(p.rx, p.ry, 0);
          _petalDummy.scale.setScalar(p.scale);
          _petalDummy.updateMatrix();
          academyEnv.petalInstancedMesh.setMatrixAt(i, _petalDummy.matrix);
        }
        academyEnv.petalInstancedMesh.instanceMatrix.needsUpdate = true;
      }

      // Update camera controller (supports both 'follow' third-person spring arm and 'overview')
      cameraController.update(
        camera,
        phase,
        stateRef.current.cameraMode,
        activeViewpoint,
        playerState,
        elapsedTotal,
        dt,
        academyEnv.rootGroup
      );

      // Render frame
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);

      protagonistRig.dispose();
      sceneDisposed = true;
      importedStudentRig?.dispose();
      for (const npc of npcRigs) {
        npc.rig.dispose();
      }
      for (const student of classroomCrowd) {
        student.rig.dispose();
      }
      for (const disposeLandmark of landmarkDisposers) {
        disposeLandmark();
      }
      academyEnv.dispose();
      textures.disposeAll();
      envTarget?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={canvasMountRef}
      className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#090d16]"
      aria-label="Seiran High Academy 3D Courtyard Environment"
    />
  );
}
