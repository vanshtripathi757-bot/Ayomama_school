import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CAMPUS_INTERACTABLES,
  INITIAL_CHARACTER_CUSTOMIZATION,
  INITIAL_CLASS_POINTS,
  INITIAL_PLAYER_SKILLS,
} from '../../config/defaults';
import {
  getAllStories,
  getStoryCompletionPercentage,
  getStudentAcademicRank,
  isPhaseUnlocked,
  isStoryUnlocked,
} from '../../game/core/rules';
import {
  applyCharacterCustomizationToRig,
  CharacterActorRig,
  createAnimeCharacterRig,
  updateCharacterRigAnimation,
} from '../../game/entities/AnimeCharacterBuilder';
import { audioManager } from '../../game/systems/AudioManager';
import { useGameStore } from '../../store/useGameStore';
import {
  AcademyClassId,
  CharacterAccessoryId,
  CharacterCustomization,
  CharacterOutfitId,
  PersonalityTrait,
} from '../../types/game';

const CLASSES: AcademyClassId[] = ['Class A', 'Class B', 'Class C', 'Class D'];

const PERSONALITIES: PersonalityTrait[] = [
  'Calm',
  'Intelligent',
  'Friendly',
  'Confident',
  'Competitive',
  'Introverted',
  'Curious',
  'Creative',
];

const HAIRSTYLES: Array<{
  id: CharacterCustomization['hairStyle'];
  label: string;
}> = [
  { id: 'spiky', label: 'Spiky Anime' },
  { id: 'parted', label: 'Scholar Part' },
  { id: 'bob', label: 'Clean Bob' },
  { id: 'long', label: 'Ponytail' },
];

const HAIR_COLORS = [
  { label: 'Indigo Black', hex: 0x1e1b4b, css: '#1e1b4b' },
  { label: 'Crimson Brown', hex: 0x7c2d12, css: '#7c2d12' },
  { label: 'Sakura Rose', hex: 0xbe185d, css: '#be185d' },
  { label: 'Teal Azure', hex: 0x0f766e, css: '#0f766e' },
  { label: 'Golden Amber', hex: 0xb45309, css: '#b45309' },
  { label: 'Silver Frost', hex: 0x64748b, css: '#64748b' },
];

const EYE_COLORS = [
  { label: 'Sky Cyan', hex: 0x38bdf8, css: '#38bdf8' },
  { label: 'Ruby Crimson', hex: 0xe11d48, css: '#e11d48' },
  { label: 'Emerald Jade', hex: 0x10b981, css: '#10b981' },
  { label: 'Amber Gold', hex: 0xf59e0b, css: '#f59e0b' },
  { label: 'Violet Star', hex: 0xa855f7, css: '#a855f7' },
];

const SKIN_TONES = [
  { label: 'Warm Fair', hex: 0xffe4d6, css: '#ffe4d6' },
  { label: 'Peach Ivory', hex: 0xfcd5b5, css: '#fcd5b5' },
  { label: 'Golden Tan', hex: 0xe0ac69, css: '#e0ac69' },
  { label: 'Warm Bronze', hex: 0xb87a4b, css: '#b87a4b' },
];

const OUTFITS: Array<{ id: CharacterOutfitId; label: string }> = [
  { id: 'uniform_blazer', label: 'Hoshino Blazer' },
  { id: 'summer_vest', label: 'Academy Vest' },
  { id: 'casual_hoodie', label: 'Club Hoodie' },
  { id: 'sports_tracksuit', label: 'Track Jersey' },
];

const ACCESSORIES: Array<{ id: CharacterAccessoryId; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'glasses', label: 'Scholar Glasses' },
  { id: 'armband', label: 'Council Armband' },
  { id: 'headphones', label: 'Headphones' },
];

export function PreGameFlowScreens() {
  const phase = useGameStore((s) => s.phase);
  const activeModal = useGameStore((s) => s.activeModal);

  return (
    <>
      {phase === 'character-creation' && <CharacterCreationScreen />}
      {phase === 'character-intro' && <CharacterIntroScreen />}
      {phase === 'story-library' && <StoryLibraryScreen />}
      {phase === 'phase-selection' && <PhaseSelectionScreen />}
      {activeModal === 'profile' && <CharacterProfileModal />}
    </>
  );
}

// ============================================================================
// DEDICATED REAL-TIME 3D CHARACTER STUDIO PREVIEW (Always Visible & Lit)
// ============================================================================
function CharacterStudioPreview3D({
  custom,
  compact = false,
}: {
  custom: CharacterCustomization;
  compact?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<CharacterActorRig | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const yawRef = useRef<number>(0);
  const poseRef = useRef<'idle' | 'wave'>('idle');
  const [poseMode, setPoseMode] = useState<'idle' | 'wave'>('idle');
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  // Build dedicated 3D studio scene on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(260, container.clientWidth || 360);
    const height = Math.max(240, container.clientHeight || (compact ? 260 : 420));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b152b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30);
    camera.position.set(0, 1.05, 3.15);
    camera.lookAt(0, 0.98, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    renderer.domElement.setAttribute('data-testid', 'character-studio-3d-canvas');
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Bright 3-point studio lighting so character face, hair, uniform, and accessories shine clearly
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.85);
    hemiLight.position.set(0, 5, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.2, 3.4, 3.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.35);
    fillLight.position.set(-2.4, 2.0, 2.6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.15);
    rimLight.position.set(0, 2.8, -2.5);
    scene.add(rimLight);

    // Studio backdrop arch + glowing Class D emerald pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.68, 0.76, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.4,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.04, 0);
    scene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(0.58, 0.66, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.005, 0);
    scene.add(ring);

    const haloGeo = new THREE.RingGeometry(0.75, 0.82, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 1.1, -0.55);
    scene.add(halo);

    // Create 3D Anime Character Rig facing the camera (+Z)
    const rig = createAnimeCharacterRig({
      gender: custom.gender === 'Female' ? 'female' : 'male',
      hairColor: custom.hairColor,
      blazerColor: 0x172554,
      accentColor: 0x10b981,
      skinColor: custom.skinColor,
      isProtagonist: true,
    });
    applyCharacterCustomizationToRig(rig, custom);
    rig.root.position.set(0, 0, 0);
    rig.root.rotation.y = 0;
    scene.add(rig.root);
    rigRef.current = rig;

    // Render immediate first frame synchronously with squashY=1.0, squashXZ=1.0
    updateCharacterRigAnimation(rig, 0, false, false, 1.0, 1.0, 0.2, false, 'wave');
    renderer.render(scene, camera);

    let animId = 0;
    const startTime = performance.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;
      if (rigRef.current) {
        rigRef.current.root.rotation.y = yawRef.current;
        updateCharacterRigAnimation(
          rigRef.current,
          0,
          false,
          false,
          1.0,
          1.0,
          elapsed,
          poseRef.current === 'wave',
          'wave'
        );
      }
      halo.rotation.z = elapsed * 0.25;
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(240, mountRef.current.clientWidth || 360);
      const h = Math.max(220, mountRef.current.clientHeight || (compact ? 260 : 420));
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      rendererRef.current.render(scene, cameraRef.current);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      rigRef.current = null;
      rendererRef.current = null;
    };
  }, [compact]);

  // Apply real-time customization changes immediately and render a synchronous frame
  useEffect(() => {
    if (!rigRef.current) return;
    applyCharacterCustomizationToRig(rigRef.current, custom);
    rigRef.current.root.rotation.y = yawRef.current;
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [custom]);

  const rotateBy = (deltaRad: number) => {
    yawRef.current += deltaRad;
    if (rigRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
      rigRef.current.root.rotation.y = yawRef.current;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  return (
    <div
      data-testid="character-studio-preview-card"
      className="pointer-events-auto w-full rounded-xl bg-[#091224]/95 border border-emerald-400/50 p-3 shadow-2xl flex flex-col gap-2"
    >
      {/* Studio Header Badge */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold shrink-0">
            {custom.academyClass} · START
          </span>
          <span className="font-display font-bold text-white truncate">
            {custom.name || 'Haruki Hoshino'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-amber-300 shrink-0">
          {custom.gender} · {custom.personality}
        </span>
      </div>

      {/* Interactive 3D WebGL Viewport */}
      <div
        ref={mountRef}
        onPointerDown={(e) => {
          isDraggingRef.current = true;
          lastXRef.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current) return;
          const dx = e.clientX - lastXRef.current;
          lastXRef.current = e.clientX;
          rotateBy(dx * 0.014);
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
        }}
        onPointerLeave={() => {
          isDraggingRef.current = false;
        }}
        className={`relative w-full ${
          compact ? 'h-56 sm:h-64' : 'h-64 sm:h-80 lg:h-[360px]'
        } rounded-lg overflow-hidden border border-indigo-400/40 bg-[#0b152b] cursor-grab active:cursor-grabbing select-none touch-none`}
      />

      {/* Studio 360 Rotation & Pose Controls */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="studio-rotate-left-btn"
            onClick={() => rotateBy(-0.45)}
            className="px-2.5 py-1 rounded bg-[#121e38] hover:bg-[#1a2b50] border border-slate-700 text-slate-200 cursor-pointer"
          >
            ⟲ Rotate Left
          </button>
          <button
            type="button"
            data-testid="studio-rotate-reset-btn"
            onClick={() => {
              yawRef.current = 0;
              rotateBy(0);
            }}
            className="px-2.5 py-1 rounded bg-[#121e38] hover:bg-[#1a2b50] border border-slate-700 text-slate-200 cursor-pointer"
          >
            Front
          </button>
          <button
            type="button"
            data-testid="studio-rotate-right-btn"
            onClick={() => rotateBy(0.45)}
            className="px-2.5 py-1 rounded bg-[#121e38] hover:bg-[#1a2b50] border border-slate-700 text-slate-200 cursor-pointer"
          >
            Rotate Right ⟳
          </button>
        </div>

        <button
          type="button"
          data-testid="studio-toggle-pose-btn"
          onClick={() => {
            const next = poseMode === 'idle' ? 'wave' : 'idle';
            poseRef.current = next;
            setPoseMode(next);
          }}
          className={`px-2.5 py-1 rounded border font-semibold cursor-pointer ${
            poseMode === 'wave'
              ? 'bg-amber-500 text-slate-950 border-amber-200'
              : 'bg-[#121e38] text-indigo-200 border-indigo-400/40'
          }`}
        >
          {poseMode === 'wave' ? '👋 Waving Pose' : '👋 Wave Greeting'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: CHARACTER CREATION SCREEN (Real-Time 3D Studio + Class D Starting Placement)
// ============================================================================
function CharacterCreationScreen() {
  const missionProgress = useGameStore((s) => s.missionProgress);
  const updateCharacterCustomization = useGameStore(
    (s) => s.updateCharacterCustomization
  );
  const completeCharacterCreation = useGameStore((s) => s.completeCharacterCreation);
  const startNewGameSession = useGameStore((s) => s.startNewGameSession);
  const setPhase = useGameStore((s) => s.setPhase);

  const custom =
    missionProgress.characterCustomization ?? INITIAL_CHARACTER_CUSTOMIZATION;

  // Ensure starting class is Class D on initial enrollment if not explicitly set
  useEffect(() => {
    if (custom.academyClass !== 'Class D') {
      updateCharacterCustomization({ academyClass: 'Class D' });
    }
  }, []);

  return (
    <div
      data-testid="character-creation-screen"
      className="fixed inset-0 z-20 pointer-events-auto flex flex-col justify-between p-3 sm:p-5 bg-[#050914]/92 overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-300">
            STEP 1 OF 4 · CLASS D TRANSFER STUDENT ENROLLMENT
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
            Customize Your 3D Hoshino Academy Transfer Student
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase('title')}
            className="px-3 py-1.5 rounded bg-[#111a2e] hover:bg-[#192642] border border-slate-700 text-xs text-slate-200 cursor-pointer"
          >
            ← Back to Menu
          </button>
          <button
            type="button"
            data-testid="quick-skip-to-3d-btn"
            onClick={() => void startNewGameSession()}
            className="px-3 py-1.5 rounded bg-emerald-700/85 hover:bg-emerald-600 text-xs font-semibold text-white cursor-pointer"
          >
            Quick Start 3D (Class D) ▸
          </button>
        </div>
      </div>

      {/* Main Split: Left Customization Controls + Right Real-Time 3D Studio Viewport */}
      <div className="max-w-6xl w-full mx-auto my-auto py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Right on Desktop / Top on Mobile: Live 3D Character Studio Viewport */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-2.5">
          <CharacterStudioPreview3D custom={custom} />

          {/* Class D Underdog Progression Overview */}
          <div className="rounded-xl bg-[#091224]/95 border border-emerald-400/40 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">
                🏫 Starting Placement: Class D (Rank #4)
              </span>
              <span className="font-mono text-[11px] text-amber-300">
                340 CP → Climb to #1
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every mid-term transfer student begins in <strong className="text-emerald-300">Class D</strong> alongside <strong className="text-white">Sora Amamiya</strong>, <strong className="text-white">Yuki Shirakawa</strong>, and <strong className="text-white">Kenzo Fujimoto</strong>. Earn Class Points (<strong className="text-amber-300">CP</strong>) through Story Phases, Exams, and Sports to overtake Class C (375 CP), Class B (395 CP), and Class A (420 CP)!
            </p>
          </div>
        </div>

        {/* Left on Desktop / Bottom on Mobile: Full Customization Controls */}
        <div className="lg:col-span-7 order-2 lg:order-1 max-h-[76vh] overflow-y-auto rounded-xl bg-[#091122]/95 border border-indigo-400/40 p-4 shadow-2xl text-xs text-slate-100 space-y-3">
          {/* Identity & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-[11px] font-semibold text-indigo-200">
                Student Name
              </span>
              <input
                type="text"
                data-testid="char-name-input"
                value={custom.name}
                onChange={(e) =>
                  updateCharacterCustomization({ name: e.target.value })
                }
                className="w-full h-9 px-3 rounded bg-[#050a14] border border-slate-700 focus:border-indigo-400 text-xs text-white outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Age ({custom.age})
              </span>
              <input
                type="range"
                min={15}
                max={18}
                value={custom.age}
                onChange={(e) =>
                  updateCharacterCustomization({ age: Number(e.target.value) })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Official 4-Class System Banner (Starting Class: Class D) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300">
                Hoshino Academy 4-Class Hierarchy (Transfer Start: Class D)
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                Rank #4 Underdog Start
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { cls: 'Class A' as const, cp: 420, tag: 'Rank #1' },
                  { cls: 'Class B' as const, cp: 395, tag: 'Rank #2' },
                  { cls: 'Class C' as const, cp: 375, tag: 'Rank #3' },
                  { cls: 'Class D' as const, cp: 340, tag: 'YOUR START' },
                ] as const
              ).map(({ cls, cp, tag }) => {
                const isStart = cls === 'Class D';
                return (
                  <button
                    key={cls}
                    type="button"
                    data-testid={`select-class-${cls.replace(' ', '-')}`}
                    onClick={() => {
                      audioManager.playClick();
                      // Story canon starts the player in Class D
                      updateCharacterCustomization({ academyClass: 'Class D' });
                    }}
                    className={`py-1.5 px-2 rounded border text-center transition-colors cursor-pointer ${
                      isStart
                        ? 'bg-emerald-600/90 border-amber-300 text-white shadow font-bold'
                        : 'bg-[#0d1528] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{cls}</div>
                    <div className="text-[10px] font-mono opacity-90">
                      {cp} CP · {tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender, Hairstyle & Outfit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Gender Presentation
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Male', 'Female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    data-testid={`select-gender-${g}`}
                    onClick={() => {
                      audioManager.playClick();
                      updateCharacterCustomization({
                        gender: g,
                        hairStyle:
                          g === 'Female' && custom.hairStyle === 'spiky'
                            ? 'long'
                            : g === 'Male' && custom.hairStyle === 'long'
                              ? 'spiky'
                              : custom.hairStyle,
                      });
                    }}
                    className={`py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                      custom.gender === g
                        ? 'bg-indigo-600 border-indigo-300 text-white'
                        : 'bg-[#101a30] border-slate-700 text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                School Outfit
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {OUTFITS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    data-testid={`select-outfit-${o.id}`}
                    onClick={() => {
                      audioManager.playClick();
                      updateCharacterCustomization({ outfit: o.id });
                    }}
                    className={`py-1.5 px-2 rounded border text-[11px] font-medium truncate cursor-pointer ${
                      custom.outfit === o.id
                        ? 'bg-indigo-600 border-indigo-300 text-white'
                        : 'bg-[#101a30] border-slate-700 text-slate-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hairstyle Selector */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-indigo-200">
              Hairstyle
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {HAIRSTYLES.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  data-testid={`select-hairstyle-${h.id}`}
                  onClick={() => {
                    audioManager.playClick();
                    updateCharacterCustomization({ hairStyle: h.id });
                  }}
                  className={`py-1.5 px-1.5 rounded border text-[10px] font-medium truncate cursor-pointer ${
                    custom.hairStyle === h.id
                      ? 'bg-indigo-600 border-indigo-300 text-white font-bold'
                      : 'bg-[#101a30] border-slate-700 text-slate-300'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color, Eye Color & Skin Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Hair Colour
              </span>
              <div className="flex flex-wrap gap-1.5">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    onClick={() =>
                      updateCharacterCustomization({ hairColor: c.hex })
                    }
                    style={{ backgroundColor: c.css }}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                      custom.hairColor === c.hex
                        ? 'border-amber-300 scale-110'
                        : 'border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Eye Colour
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EYE_COLORS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    onClick={() =>
                      updateCharacterCustomization({ eyeColor: c.hex })
                    }
                    style={{ backgroundColor: c.css }}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                      custom.eyeColor === c.hex
                        ? 'border-amber-300 scale-110'
                        : 'border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Skin Tone
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SKIN_TONES.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    onClick={() =>
                      updateCharacterCustomization({ skinColor: c.hex })
                    }
                    style={{ backgroundColor: c.css }}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                      custom.skinColor === c.hex
                        ? 'border-amber-300 scale-110'
                        : 'border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Height, Body Proportions & Accessories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Height ({Math.round(custom.heightScale * 170)} cm)
              </span>
              <input
                type="range"
                min={0.9}
                max={1.1}
                step={0.02}
                value={custom.heightScale}
                onChange={(e) =>
                  updateCharacterCustomization({
                    heightScale: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                Body Build ({custom.bodyScale.toFixed(2)}x)
              </span>
              <input
                type="range"
                min={0.9}
                max={1.1}
                step={0.02}
                value={custom.bodyScale}
                onChange={(e) =>
                  updateCharacterCustomization({
                    bodyScale: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </label>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-200">
                3D Accessory
              </span>
              <div className="grid grid-cols-2 gap-1">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    data-testid={`select-accessory-${acc.id}`}
                    onClick={() => {
                      audioManager.playClick();
                      updateCharacterCustomization({ accessory: acc.id });
                    }}
                    className={`py-1 px-1.5 rounded border text-[10px] truncate cursor-pointer ${
                      custom.accessory === acc.id
                        ? 'bg-indigo-600 border-indigo-300 text-white font-bold'
                        : 'bg-[#101a30] border-slate-700 text-slate-300'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 8 Personalities (Section 10) */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-amber-300">
              Protagonist Personality (Shapes Dialogue &amp; Class D Leadership Style)
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {PERSONALITIES.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  data-testid={`select-personality-${trait}`}
                  onClick={() =>
                    updateCharacterCustomization({ personality: trait })
                  }
                  className={`py-1.5 px-2 rounded border text-[11px] font-medium cursor-pointer ${
                    custom.personality === trait
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-200'
                      : 'bg-[#101a30] border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Continue Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              data-testid="complete-character-creation-btn"
              onClick={() => completeCharacterCreation()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-lg cursor-pointer"
            >
              Confirm Class D Enrollment &amp; Continue ▸
            </button>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
}

// ============================================================================
// STEP 3: CHARACTER INTRODUCTION SCREEN (Class D Transfer Arrival + 3D Preview)
// ============================================================================
function CharacterIntroScreen() {
  const missionProgress = useGameStore((s) => s.missionProgress);
  const updateCharacterCustomization = useGameStore(
    (s) => s.updateCharacterCustomization
  );
  const completeCharacterIntro = useGameStore((s) => s.completeCharacterIntro);
  const setPhase = useGameStore((s) => s.setPhase);

  const custom =
    missionProgress.characterCustomization ?? INITIAL_CHARACTER_CUSTOMIZATION;
  const [selectedApproach, setSelectedApproach] = useState(0);

  const approaches = [
    {
      label:
        '🤝 Unite Class D & Build Cross-Class Alliances: Rally Sora, Yuki & Kenzo in Class D and befriend Aiko (Class B).',
      summary:
        'Boosts Leadership, Communication & Trust across Class D and Class B.',
    },
    {
      label:
        '🏆 Challenge Class A’s Supremacy: Accept Ren Takahashi’s (Class A) academic & track duel on behalf of Class D.',
      summary:
        'Boosts Academics, Sports & Class D Respect against Class A (420 CP).',
    },
    {
      label:
        '🔍 Uncover Class D’s Forgotten Legacy: Investigate Project Hoshikaze with Sora (Class D) & Mika (Class C).',
      summary:
        'Boosts Observation, Problem Solving & Archive Discovery.',
    },
  ];

  return (
    <div
      data-testid="character-intro-screen"
      className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center p-3 sm:p-5 bg-[#050914]/90 overflow-y-auto"
    >
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#091224]/96 border border-emerald-400/45 p-4 sm:p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-300">
              STEP 2 OF 4 · CLASS D TRANSFER ARRIVAL &amp; STORY PREMISE
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Welcome to Class D — {custom.name} (Rank #4 · 340 CP)
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPhase('character-creation')}
            className="px-3 py-1.5 rounded bg-[#131e36] hover:bg-[#1c2c4e] border border-slate-700 text-xs text-slate-200 cursor-pointer"
          >
            ← Customize 3D Character
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: Compact 3D Character Preview */}
          <div className="lg:col-span-5">
            <CharacterStudioPreview3D custom={custom} compact />
          </div>

          {/* Right: Class D Story Premise & First-Day Approach */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="rounded-lg bg-gradient-to-br from-emerald-950/70 via-[#0d1830] to-slate-900 border border-emerald-400/35 p-3.5 space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200">
              <p>
                Morning sunlight catches the 36-meter Clock Tower spire as you step through the gates of{' '}
                <strong className="text-white">Hoshino Academy</strong>. Because you transferred mid-term from{' '}
                <span className="text-emerald-300">{custom.hometown}</span> ({custom.previousSchool}), the administration has placed you in{' '}
                <strong className="text-emerald-300">Class D</strong> — the lowest-ranked class starting at{' '}
                <strong className="text-amber-300">340 Class Points (CP)</strong> behind Class C (375 CP), Class B (395 CP), and elite Class A (420 CP).
              </p>
              <p>
                Many in Class A look down on Class D as the underdog homeroom. Yet your Class D Representative{' '}
                <strong className="text-white">Sora Amamiya</strong>, quiet logic prodigy{' '}
                <strong className="text-white">Yuki Shirakawa</strong>, and track sprinter{' '}
                <strong className="text-white">Kenzo Fujimoto</strong> believe your arrival is the spark Class D needs — especially after discovering that the academy’s legendary{' '}
                <strong className="text-amber-200">Project Hoshikaze</strong> was originally co-founded by a Class D student!
              </p>
            </div>

            {/* Editable Backstory Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-indigo-200">
                  Hometown
                </span>
                <input
                  type="text"
                  value={custom.hometown}
                  onChange={(e) =>
                    updateCharacterCustomization({ hometown: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-[#050a14] border border-slate-700 text-white outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-indigo-200">
                  Previous School
                </span>
                <input
                  type="text"
                  value={custom.previousSchool}
                  onChange={(e) =>
                    updateCharacterCustomization({
                      previousSchool: e.target.value,
                    })
                  }
                  className="w-full h-8 px-2.5 rounded bg-[#050a14] border border-slate-700 text-white outline-none"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-indigo-200">
                  Class D Mission &amp; Personal Goal
                </span>
                <input
                  type="text"
                  value={custom.personalGoal}
                  onChange={(e) =>
                    updateCharacterCustomization({ personalGoal: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-[#050a14] border border-slate-700 text-white outline-none"
                />
              </label>
            </div>

            {/* Interactive First Impression Choice */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-amber-300">
                Choose Your Class D Transfer Strategy:
              </div>
              <div className="space-y-1.5">
                {approaches.map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      setSelectedApproach(idx);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selectedApproach === idx
                        ? 'bg-emerald-700/85 border-amber-300 text-white'
                        : 'bg-[#0e182e] border-slate-700 text-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[11px] text-emerald-200 mt-0.5">
                      {item.summary}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end border-t border-slate-800">
          <button
            type="button"
            data-testid="continue-to-story-library-btn"
            onClick={() => completeCharacterIntro()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg cursor-pointer"
          >
            Continue to Class D Story Library (8 Stories) ▸
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: VISUAL STORY LIBRARY SCREEN (8 Visual Story Cards + Endless Generator)
// ============================================================================
function StoryLibraryScreen() {
  const missionProgress = useGameStore((s) => s.missionProgress);
  const selectStoryFromLibrary = useGameStore((s) => s.selectStoryFromLibrary);
  const generateEndlessStory = useGameStore((s) => s.generateEndlessStory);
  const setPhase = useGameStore((s) => s.setPhase);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const allStories = getAllStories(missionProgress.customStories ?? []);
  const completedStoryIds = missionProgress.completedStoryIds ?? [];
  const completedPhaseKeys = missionProgress.completedPhaseKeys ?? [];
  const custom =
    missionProgress.characterCustomization ?? INITIAL_CHARACTER_CUSTOMIZATION;

  return (
    <div
      data-testid="story-library-screen"
      className="fixed inset-0 z-20 pointer-events-auto flex flex-col justify-between p-4 sm:p-6 bg-[#060a15]/92 overflow-y-auto"
    >
      {/* Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-300">
            STEP 3 OF 4 · HOSHINO ACADEMY VISUAL STORY LIBRARY (CLASS D CHRONICLES)
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Select a Story Chronicle
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Student: <strong className="text-amber-300">{custom.name}</strong> (
            <strong className="text-emerald-300">{custom.academyClass}</strong>) · Complete all 9 sequential phases of each story to earn Class Points (CP) for Class D and unlock the next chronicle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase('character-creation')}
            className="px-3 py-1.5 rounded bg-[#131e36] hover:bg-[#1c2c4e] border border-emerald-400/50 text-xs font-semibold text-emerald-200 cursor-pointer"
          >
            🎨 Customize 3D Character
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('profile')}
            className="px-3 py-1.5 rounded bg-[#131e36] hover:bg-[#1c2c4e] border border-indigo-400/50 text-xs font-semibold text-indigo-200 cursor-pointer"
          >
            👤 Character Profile
          </button>
          <button
            type="button"
            data-testid="generate-endless-story-btn"
            onClick={() => void generateEndlessStory()}
            className="px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 border border-purple-300/50 text-xs font-semibold text-white cursor-pointer"
          >
            ✨ + Generate New AI Chronicle
          </button>
          <button
            type="button"
            onClick={() => setPhase('title')}
            className="px-3 py-1.5 rounded bg-[#11192c] hover:bg-[#1a2642] border border-slate-700 text-xs text-slate-300 cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>

      {/* Visual Story Cards Grid */}
      <div className="max-w-6xl w-full mx-auto my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {allStories.map((story) => {
          const unlocked = isStoryUnlocked(story.id, completedStoryIds, allStories);
          const pct = getStoryCompletionPercentage(
            story.id,
            completedPhaseKeys,
            story.phases.length
          );
          const isCompleted = completedStoryIds.includes(story.id) || pct === 100;

          return (
            <button
              key={story.id}
              type="button"
              data-testid={`story-card-${story.id}`}
              disabled={!unlocked}
              onClick={() => selectStoryFromLibrary(story.id)}
              className={`group text-left rounded-xl overflow-hidden border transition-all flex flex-col justify-between ${
                unlocked
                  ? 'bg-[#0b1326] border-indigo-400/50 hover:border-amber-300 hover:-translate-y-0.5 shadow-xl cursor-pointer'
                  : 'bg-[#080d1a]/80 border-slate-800/80 opacity-65 cursor-not-allowed'
              }`}
            >
              {/* Visual Cover Art Banner */}
              <div
                className={`relative h-28 w-full bg-gradient-to-br ${story.themeGradient} p-3 flex flex-col justify-between overflow-hidden`}
              >
                <svg
                  viewBox="0 0 160 80"
                  className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
                  aria-hidden="true"
                >
                  <circle cx="130" cy="22" r="18" fill={story.accentColor} />
                  <polygon points="15,80 55,28 95,80" fill="#ffffff" />
                  <polygon points="65,80 105,20 148,80" fill={story.accentColor} />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-black/55 border border-white/15 font-mono text-[10px] font-bold text-white">
                    STORY 0{story.storyNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : unlocked
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-900/90 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓ COMPLETED' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'}
                  </span>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/90">
                  <span>9 Phases</span>
                  <span>{pct}% Complete</span>
                </div>
              </div>

              {/* Story Title & Short Description Below Cover Image */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[10px] font-mono text-indigo-300 uppercase">
                    {story.subtitle}
                  </div>
                  <h2 className="font-display text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                    {story.title}
                  </h2>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {story.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between text-[11px]">
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-semibold text-indigo-300">
                    {unlocked ? 'Select Phases ▸' : 'Complete Prev Story'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div />
    </div>
  );
}

// ============================================================================
// STEP 5: STORY DETAILS & SEQUENTIAL PHASE SELECTION SCREEN (9 Phases per Story)
// ============================================================================
function PhaseSelectionScreen() {
  const selectedStoryId = useGameStore((s) => s.selectedStoryId);
  const missionProgress = useGameStore((s) => s.missionProgress);
  const startStoryPhase = useGameStore((s) => s.startStoryPhase);
  const openStoryLibrary = useGameStore((s) => s.openStoryLibrary);

  const allStories = getAllStories(missionProgress.customStories ?? []);
  const story =
    allStories.find((s) => s.id === selectedStoryId) ?? allStories[0];
  const completedPhaseKeys = missionProgress.completedPhaseKeys ?? [];
  const completedStoryIds = missionProgress.completedStoryIds ?? [];
  const pct = getStoryCompletionPercentage(
    story.id,
    completedPhaseKeys,
    story.phases.length
  );

  let highestUnlockedPhase = 1;
  for (const p of story.phases) {
    if (
      isPhaseUnlocked(
        story.id,
        p.phaseNumber,
        completedPhaseKeys,
        completedStoryIds,
        allStories
      )
    ) {
      highestUnlockedPhase = p.phaseNumber;
    }
  }

  return (
    <div
      data-testid="phase-selection-screen"
      className="fixed inset-0 z-20 pointer-events-auto flex flex-col justify-between p-4 sm:p-6 bg-[#060a15]/94 overflow-y-auto"
    >
      {/* Top Story Overview Banner */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300">
            STEP 4 OF 4 · {story.subtitle} ({pct}% COMPLETE)
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {story.title} — Select Story Phase (01–09)
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            {story.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openStoryLibrary()}
            className="px-3.5 py-2 rounded bg-[#121c34] hover:bg-[#1a2849] border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            ← Back to Story Library
          </button>
          <button
            type="button"
            data-testid="start-active-phase-btn"
            onClick={() => void startStoryPhase(story.id, highestUnlockedPhase)}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-bold text-white shadow-lg cursor-pointer"
          >
            Play Phase 0{highestUnlockedPhase} in 3D World ▸
          </button>
        </div>
      </div>

      {/* 9 Visual Phase Cards Grid */}
      <div className="max-w-6xl w-full mx-auto my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {story.phases.map((phaseItem) => {
          const phaseKey = `${story.id}:phase_${phaseItem.phaseNumber}`;
          const isCompleted = completedPhaseKeys.includes(phaseKey);
          const unlocked = isPhaseUnlocked(
            story.id,
            phaseItem.phaseNumber,
            completedPhaseKeys,
            completedStoryIds,
            allStories
          );

          return (
            <button
              key={phaseItem.id}
              type="button"
              data-testid={`phase-card-${phaseItem.phaseNumber}`}
              disabled={!unlocked}
              onClick={() => void startStoryPhase(story.id, phaseItem.phaseNumber)}
              className={`text-left rounded-xl overflow-hidden border transition-all flex flex-col justify-between ${
                unlocked
                  ? 'bg-[#0b1428] border-indigo-400/50 hover:border-amber-300 hover:-translate-y-0.5 shadow-lg cursor-pointer'
                  : 'bg-[#080d1a]/75 border-slate-800/80 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Compact Visual Phase Banner */}
              <div
                className="relative h-16 w-full px-3 py-2 flex items-center justify-between"
                style={{
                  background: `linear-gradient(135deg, ${phaseItem.themeColor}44 0%, #0f172a 100%)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/50 border border-white/15 font-mono text-[10px] font-bold text-amber-300">
                    PHASE 0{phaseItem.phaseNumber}
                  </span>
                  <span className="text-[11px] text-indigo-200 truncate">
                    📍 {phaseItem.location}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950'
                      : unlocked
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓ DONE' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'}
                </span>
              </div>

              {/* Phase Title & Objectives Below Image */}
              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-sm font-bold text-white">
                    {phaseItem.title}
                  </h2>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {phaseItem.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-300">
                    +{phaseItem.rewardXp} XP · +{phaseItem.rewardCp} CP · +{phaseItem.rewardPp} PP
                  </span>
                  <span className="text-indigo-300 font-semibold">
                    {unlocked ? 'Start Phase ▸' : `Requires Phase 0${phaseItem.phaseNumber - 1}`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div />
    </div>
  );
}

// ============================================================================
// SECTION 17: CHARACTER PROFILE & NPC RELATIONSHIPS / MEMORIES MODAL
// ============================================================================
function CharacterProfileModal() {
  const missionProgress = useGameStore((s) => s.missionProgress);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setPhase = useGameStore((s) => s.setPhase);
  const [tab, setTab] = useState<'student' | 'npcs'>('student');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  const custom =
    missionProgress.characterCustomization ?? INITIAL_CHARACTER_CUSTOMIZATION;
  const skills = missionProgress.skills ?? INITIAL_PLAYER_SKILLS;
  const classPoints = missionProgress.classPoints ?? INITIAL_CLASS_POINTS;
  const rankInfo = getStudentAcademicRank(missionProgress.reputationPoints);
  const relationships = missionProgress.npcRelationships ?? {};
  const npcs = CAMPUS_INTERACTABLES.filter((i) => i.kind === 'npc');
  const filteredNpcs =
    selectedClassFilter === 'ALL'
      ? npcs
      : npcs.filter((n) => n.academyClass === selectedClassFilter);

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-auto flex items-center justify-center bg-[#050914]/84 p-3 sm:p-5"
      onClick={() => setActiveModal('none')}
    >
      <div
        data-testid="character-profile-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-xl bg-[#091224]/96 border border-indigo-400/50 p-4 sm:p-6 shadow-2xl text-slate-100 space-y-4"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">
              HOSHINO ACADEMY STUDENT RECORD &amp; CLASS A–D NPC DIRECTORY
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-bold text-white">
              {custom.name} · {custom.academyClass} ({custom.personality})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="profile-open-character-studio-btn"
              onClick={() => {
                setActiveModal('none');
                setPhase('character-creation');
              }}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer"
            >
              🎨 Customize 3D Character
            </button>
            <button
              type="button"
              onClick={() => setTab('student')}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                tab === 'student'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#121d35] text-slate-300'
              }`}
            >
              🎓 Student Profile &amp; Skills
            </button>
            <button
              type="button"
              data-testid="profile-npcs-tab-btn"
              onClick={() => setTab('npcs')}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                tab === 'npcs'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#121d35] text-slate-300'
              }`}
            >
              🤝 Class A–D NPCs &amp; Memories ({npcs.length})
            </button>
            <button
              type="button"
              data-testid="profile-close-btn"
              onClick={() => setActiveModal('none')}
              className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {tab === 'student' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            {/* Left Column: 3D Preview + Identity, Points & Class A-D Standings */}
            <div className="md:col-span-5 space-y-3">
              <CharacterStudioPreview3D custom={custom} compact />

              <div className="rounded-lg bg-[#0d1830] border border-indigo-400/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">
                    {custom.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 font-mono text-[11px] font-bold text-white">
                    {custom.academyClass}
                  </span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>
                    <strong className="text-slate-100">Rank:</strong> {rankInfo.rankTitle} (GPA {rankInfo.gpa})
                  </div>
                  <div>
                    <strong className="text-slate-100">Age / Gender:</strong> {custom.age} · {custom.gender}
                  </div>
                  <div>
                    <strong className="text-slate-100">Personality:</strong> {custom.personality}
                  </div>
                  <div>
                    <strong className="text-slate-100">Hometown:</strong> {custom.hometown}
                  </div>
                  <div>
                    <strong className="text-slate-100">Personal Goal:</strong> {custom.personalGoal}
                  </div>
                </div>

                {/* XP, CP, PP Counters */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800 text-center">
                  <div className="rounded bg-[#081020] p-1.5">
                    <div className="text-[10px] text-slate-400">XP</div>
                    <div className="font-mono font-bold text-amber-300">
                      {missionProgress.reputationPoints}
                    </div>
                  </div>
                  <div className="rounded bg-[#081020] p-1.5">
                    <div className="text-[10px] text-slate-400">Class Pts (CP)</div>
                    <div className="font-mono font-bold text-emerald-300">
                      {missionProgress.cpPoints ?? 50}
                    </div>
                  </div>
                  <div className="rounded bg-[#081020] p-1.5">
                    <div className="text-[10px] text-slate-400">Personal (PP)</div>
                    <div className="font-mono font-bold text-sky-300">
                      {missionProgress.ppPoints ?? 150}
                    </div>
                  </div>
                </div>
              </div>

              {/* Official 4-Class Standings (Class A, Class B, Class C, Class D) */}
              <div className="rounded-lg bg-[#0d1830] border border-slate-700 p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Hoshino Academy Class Standings (Class A–D)
                </div>
                {CLASSES.map((cls) => {
                  const pts = classPoints[cls] ?? 340;
                  const isPlayerCls = custom.academyClass === cls;
                  return (
                    <div
                      key={cls}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded border ${
                        isPlayerCls
                          ? 'bg-emerald-950/90 border-emerald-400/60 text-white font-bold'
                          : 'bg-[#081020] border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>
                        {cls} {isPlayerCls ? '(Your Starting Class)' : ''}
                      </span>
                      <span className="font-mono text-amber-300">{pts} CP</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: 7 Player Skills + Discovered Clues & Inventory */}
            <div className="md:col-span-7 space-y-3">
              <div className="rounded-lg bg-[#0d1830] border border-slate-700 p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Student Skill Progression (Section 12)
                </div>
                {(
                  [
                    ['Academics', skills.academics, '#38bdf8'],
                    ['Communication', skills.communication, '#f43f5e'],
                    ['Leadership', skills.leadership, '#fbbf24'],
                    ['Creativity', skills.creativity, '#a855f7'],
                    ['Sports', skills.sports, '#10b981'],
                    ['Problem Solving', skills.problemSolving, '#6366f1'],
                    ['Observation', skills.observation, '#ec4899'],
                  ] as const
                ).map(([label, val, color]) => (
                  <div key={label} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-200">{label}</span>
                      <span className="font-mono text-amber-200">Lv. {val}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, val)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-[#0d1830] border border-slate-700 p-3.5 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Discovered Archive Clues &amp; Inventory
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(missionProgress.inventoryItems ?? []).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-400/40 text-[11px] text-indigo-200"
                    >
                      🎒 {item}
                    </span>
                  ))}
                </div>
                <div className="pt-1 space-y-1 max-h-40 overflow-y-auto">
                  {(missionProgress.discoveredClues ?? []).map((clue) => (
                    <div key={clue} className="text-[11px] text-amber-200/90">
                      • {clue}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Class A, Class B, Class C, Class D & Faculty NPC Profiles & Memories */
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'Class A', 'Class B', 'Class C', 'Class D', 'Faculty'].map(
                (cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      selectedClassFilter === cls
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#111c33] text-slate-300 hover:text-white'
                    }`}
                  >
                    {cls}
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNpcs.map((npc) => {
                const rel = relationships[npc.id] ?? {
                  npcId: npc.id,
                  friendship: 20,
                  trust: 18,
                  respect: 20,
                  rivalry: 5,
                  familiarity: 15,
                  memories: [`Met ${npc.name} at Hoshino Academy.`],
                };
                return (
                  <div
                    key={npc.id}
                    className="rounded-lg bg-[#0d1830] border border-slate-700/90 p-3 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-bold text-sm text-white">
                          {npc.name}
                        </div>
                        <div className="text-[11px] text-indigo-300">
                          {npc.role}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-400/40 font-mono text-[10px] text-amber-300 shrink-0">
                        {npc.academyClass ?? 'Campus'} · {npc.personalityType ?? 'Friendly'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div>
                        <strong className="text-slate-100">Current Goal:</strong>{' '}
                        {npc.currentGoal}
                      </div>
                      <div>
                        <strong className="text-slate-100">Activity:</strong>{' '}
                        <span className="text-emerald-300">{npc.currentActivity}</span>{' '}
                        ({npc.emotionalState})
                      </div>
                    </div>

                    {/* Relationship Metrics */}
                    <div className="grid grid-cols-4 gap-1 text-center pt-1">
                      <div className="rounded bg-[#081020] p-1">
                        <div className="text-[9px] text-slate-400">Friend</div>
                        <div className="font-mono font-bold text-rose-300">
                          {rel.friendship}
                        </div>
                      </div>
                      <div className="rounded bg-[#081020] p-1">
                        <div className="text-[9px] text-slate-400">Trust</div>
                        <div className="font-mono font-bold text-sky-300">
                          {rel.trust}
                        </div>
                      </div>
                      <div className="rounded bg-[#081020] p-1">
                        <div className="text-[9px] text-slate-400">Respect</div>
                        <div className="font-mono font-bold text-emerald-300">
                          {rel.respect}
                        </div>
                      </div>
                      <div className="rounded bg-[#081020] p-1">
                        <div className="text-[9px] text-slate-400">Rivalry</div>
                        <div className="font-mono font-bold text-amber-300">
                          {rel.rivalry}
                        </div>
                      </div>
                    </div>

                    {/* Persistent NPC Memory Log */}
                    <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-300 space-y-0.5">
                      <div className="font-semibold text-amber-200">
                        🧠 NPC Memories ({rel.memories.length}):
                      </div>
                      {rel.memories.slice(-2).map((m) => (
                        <div key={m} className="truncate text-slate-300">
                          • {m}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
