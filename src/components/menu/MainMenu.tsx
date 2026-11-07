import { useEffect } from 'react';
import { ATMOSPHERE_PRESETS } from '../../config/defaults';
import { audioManager } from '../../game/systems/AudioManager';
import { useGameStore } from '../../store/useGameStore';

export function MainMenu() {
  const phase = useGameStore((s) => s.phase);
  const activeModal = useGameStore((s) => s.activeModal);
  const savedSlot = useGameStore((s) => s.savedSlot);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const continueSavedSession = useGameStore((s) => s.continueSavedSession);
  const startNewGameSession = useGameStore((s) => s.startNewGameSession);
  const openStoryLibrary = useGameStore((s) => s.openStoryLibrary);
  const cycleTimeOfDay = useGameStore((s) => s.cycleTimeOfDay);

  // Keyboard shortcut: Enter or Space on title screen (when no modal is open) starts session
  useEffect(() => {
    if (phase !== 'title' || activeModal !== 'none') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (
          document.activeElement &&
          document.activeElement.tagName === 'BUTTON' &&
          document.activeElement.getAttribute('data-start') !== 'true'
        ) {
          return;
        }
        e.preventDefault();
        setActiveModal('new-game-confirm');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, activeModal, setActiveModal]);

  if (phase !== 'title') return null;

  const currentAtmo = ATMOSPHERE_PRESETS[timeOfDay];

  const formatSaveTimestamp = (ts: number) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(ts));
    } catch {
      return 'Saved Session';
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between bg-gradient-to-b from-[#070a14]/88 via-[#090d19]/80 to-[#070a14]/90 sm:bg-none"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(7, 10, 20, 0.92) 0%, rgba(9, 13, 25, 0.78) 34%, rgba(9, 13, 25, 0.22) 56%, rgba(9, 13, 25, 0.0) 100%)',
      }}
    >
      {/* Top Perimeter Metadata Row */}
      <div className="w-full px-5 sm:px-12 pt-5 sm:pt-6 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 tracking-wider min-w-0">
          <span className="font-semibold text-indigo-300 whitespace-nowrap">
            HOSHINO ACADEMY
          </span>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <span className="text-slate-400 hidden sm:inline whitespace-nowrap">
            CLASSES A, B, C &amp; D · 3D OPEN-WORLD CHRONICLES
          </span>
        </div>

        <button
          type="button"
          onClick={cycleTimeOfDay}
          onMouseEnter={() => audioManager.playHover()}
          className="pointer-events-auto px-3 py-1.5 sm:px-3.5 sm:py-2 rounded bg-[#0c1324]/92 border border-slate-700/80 text-xs text-slate-200 hover:border-indigo-400 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          aria-label={`Cycle campus lighting preset, current: ${currentAtmo.label}`}
        >
          <span className="hidden sm:inline">Atmosphere: </span>
          <span>{currentAtmo.label}</span>
          <span className="mx-1.5 text-slate-500">·</span>
          <span className="font-mono tabular-nums text-indigo-300">
            {currentAtmo.timeDisplay}
          </span>
        </button>
      </div>

      {/* Left-Third Focal Column (35% Negative Space Lockup + Menu Actions) */}
      <main className="w-full max-w-xl px-5 sm:px-12 my-auto flex flex-col items-start">
        {/* Custom Inline SVG Emblem & Title Lockup */}
        <div className="mb-5 sm:mb-7 p-3.5 sm:p-0 rounded-lg bg-[#080c18]/75 sm:bg-transparent">
          <div className="flex items-center gap-3.5 mb-2.5">
            <svg
              viewBox="0 0 64 64"
              className="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
              aria-hidden="true"
            >
              <polygon
                points="32,4 58,16 52,48 32,60 12,48 6,16"
                fill="#0f172a"
                stroke="#818cf8"
                strokeWidth="2.2"
              />
              <polygon
                points="32,10 51,19 47,44 32,53 17,44 13,19"
                fill="#1e1b4b"
                stroke="#fbbf24"
                strokeWidth="1"
              />
              <path
                d="M32 15 L37 28 L50 28 L39 36 L43 48 L32 40 L21 48 L25 36 L14 28 L27 28 Z"
                fill="#c7d2fe"
              />
              <circle cx="32" cy="32" r="4" fill="#fbbf24" />
            </svg>
            <div>
              <div className="text-xs tracking-[0.22em] text-indigo-300 font-medium">
                HOSHINO ACADEMY · 3D ADVENTURE V7.0
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                8 Stories · 72 Phases · Class A, B, C &amp; D AI NPCs
              </div>
            </div>
          </div>

          <h1
            className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-white leading-tight drop-shadow-[0_2px_12px_rgba(7,10,20,0.95)]"
            style={{ textWrap: 'balance' }}
          >
            THE SCHOOL CHRONICLES
          </h1>
          <div className="mt-2.5 h-0.5 w-32 bg-indigo-500/80" />
        </div>

        {/* Main Menu Navigation Stack */}
        <nav
          aria-label="Main Menu"
          className="pointer-events-auto w-full max-w-sm flex flex-col gap-2"
        >
          {/* 1. New Game */}
          <button
            type="button"
            data-start="true"
            onClick={() => {
              audioManager.playClick();
              setActiveModal('new-game-confirm');
            }}
            onDoubleClick={() => {
              void startNewGameSession();
            }}
            onMouseEnter={() => audioManager.playHover()}
            className="group relative w-full min-h-[44px] px-5 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 text-white font-semibold text-sm sm:text-base tracking-wide flex items-center justify-between shadow-lg transition-transform duration-150 active:scale-[0.99] cursor-pointer whitespace-nowrap"
          >
            <span>New Game</span>
            <span className="text-xs font-mono text-indigo-200 group-hover:translate-x-0.5 transition-transform">
              ENTER ▸
            </span>
          </button>

          {/* 2. Resume / Continue Game */}
          <button
            type="button"
            disabled={!savedSlot}
            onClick={() => {
              if (savedSlot) continueSavedSession();
            }}
            onMouseEnter={() => {
              if (savedSlot) audioManager.playHover();
            }}
            className={`w-full min-h-[44px] px-5 py-2 rounded border text-left transition-colors duration-150 flex items-center justify-between whitespace-nowrap ${
              savedSlot
                ? 'bg-[#0f172a]/95 border-indigo-500/50 hover:bg-[#16223d] hover:border-indigo-400 active:bg-[#0c1324] text-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-300'
                : 'bg-[#0b101d]/70 border-slate-800/80 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col min-w-0 pr-3">
              <span className="font-semibold text-sm sm:text-base">Resume Game</span>
              {savedSlot ? (
                <span className="text-xs text-indigo-300 truncate">
                  {savedSlot.locationName} · {formatSaveTimestamp(savedSlot.timestamp)}
                </span>
              ) : (
                <span className="text-xs text-slate-500">No saved session found</span>
              )}
            </div>
            <span className="text-xs font-mono shrink-0">
              {savedSlot ? 'RESUME ▸' : 'LOCKED'}
            </span>
          </button>

          {/* 3. Visual Story Library & Phase Selection */}
          <button
            type="button"
            data-testid="menu-story-library-btn"
            onClick={() => openStoryLibrary()}
            onMouseEnter={() => audioManager.playHover()}
            className="w-full min-h-[42px] px-5 py-2 rounded bg-[#0d1424]/92 hover:bg-[#162038] border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white font-medium text-sm sm:text-base flex items-center justify-between transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Story Library</span>
            <span className="text-xs font-mono text-amber-300">8 Stories · 9 Phases ▸</span>
          </button>

          {/* 4. Character Profile & Class A–D NPCs */}
          <button
            type="button"
            data-testid="menu-character-profile-btn"
            onClick={() => {
              audioManager.playClick();
              setActiveModal('profile');
            }}
            onMouseEnter={() => audioManager.playHover()}
            className="w-full min-h-[42px] px-5 py-2 rounded bg-[#0d1424]/92 hover:bg-[#162038] border border-slate-700/80 hover:border-indigo-400/70 text-slate-200 hover:text-white font-medium text-sm sm:text-base flex items-center justify-between transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Character Profile</span>
            <span className="text-xs text-indigo-300">Skills · Class A–D · NPCs</span>
          </button>

          {/* 5. Settings & Credits Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                setActiveModal('settings');
              }}
              onMouseEnter={() => audioManager.playHover()}
              className="min-h-[42px] px-4 py-2 rounded bg-[#0d1424]/92 hover:bg-[#162038] border border-slate-700/80 hover:border-indigo-400/70 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Settings</span>
              <span className="text-[11px] text-slate-400">⚙</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                setActiveModal('credits');
              }}
              onMouseEnter={() => audioManager.playHover()}
              className="min-h-[42px] px-4 py-2 rounded bg-[#0d1424]/92 hover:bg-[#162038] border border-slate-700/80 hover:border-indigo-400/70 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Credits</span>
              <span className="text-[11px] text-slate-400">★</span>
            </button>
          </div>

          {/* 6. Exit Game */}
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              setActiveModal('exit-confirm');
            }}
            onMouseEnter={() => audioManager.playHover()}
            className="w-full min-h-[40px] px-5 py-2 rounded bg-[#0d1424]/92 hover:bg-rose-950/60 active:bg-rose-950/90 border border-slate-800 hover:border-rose-500/60 focus-visible:outline-2 focus-visible:outline-rose-400 text-slate-300 hover:text-rose-200 font-medium text-sm flex items-center justify-between transition-colors duration-150 cursor-pointer whitespace-nowrap"
          >
            <span>Exit Game</span>
            <span className="text-xs text-slate-500">Quit Session</span>
          </button>
        </nav>
      </main>

      {/* Bottom Safe-Margin Single Flat Control-Hint Line */}
      <div className="w-full px-6 sm:px-12 pb-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          WASD / Drag Camera · Space / Enter Start · Esc Pause
        </div>
        <div className="font-mono tabular-nums text-slate-400">
          V7.0 Master Edition · Classes A, B, C &amp; D
        </div>
      </div>
    </div>
  );
}
