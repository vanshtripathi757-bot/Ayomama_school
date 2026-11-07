import { useGameStore } from '../../store/useGameStore';

export function LoadingScreen() {
  const phase = useGameStore((s) => s.phase);
  const loadingProgress = useGameStore((s) => s.loadingProgress);
  const loadingMessage = useGameStore((s) => s.loadingMessage);

  if (phase !== 'loading') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#080b14] px-6 py-12 text-slate-100"
      role="status"
      aria-live="polite"
      aria-label="Loading The School Chronicles"
    >
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-400 tracking-wider">
        <span>SEIRAN HIGH ACADEMY</span>
        <span>·</span>
        <span>PHASE 1 ENGINE INITIALIZATION</span>
      </div>

      <div className="flex flex-col items-center text-center max-w-lg w-full my-auto">
        {/* Bespoke Seiran Academy SVG Crest */}
        <svg
          viewBox="0 0 96 96"
          className="w-20 h-20 mb-6 text-indigo-300"
          aria-hidden="true"
        >
          <polygon
            points="48,6 86,24 78,70 48,90 18,70 10,24"
            fill="#111827"
            stroke="#6366f1"
            strokeWidth="2.5"
          />
          <polygon
            points="48,14 78,28 71,65 48,82 25,65 18,28"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <path
            d="M48 24 L56 44 L76 44 L60 56 L66 74 L48 62 L30 74 L36 56 L20 44 L40 44 Z"
            fill="#818cf8"
            fillOpacity="0.25"
            stroke="#c7d2fe"
            strokeWidth="1.8"
          />
          <circle cx="48" cy="49" r="6" fill="#fbbf24" />
        </svg>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-wider text-slate-100 mb-2">
          THE SCHOOL CHRONICLES
        </h1>
        <p className="text-xs text-slate-400 tracking-widest mb-10">
          CHRONICLES OF SEIRAN HIGH ACADEMY
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#111827] border border-slate-800 h-2.5 rounded-sm overflow-hidden mb-3">
          <div
            className="h-full bg-indigo-500 transition-transform duration-150 ease-out origin-left"
            style={{ transform: `scaleX(${Math.max(0.05, loadingProgress / 100)})` }}
          />
        </div>

        <div className="w-full flex items-center justify-between text-xs">
          <span className="text-slate-300 truncate pr-4">{loadingMessage}</span>
          <span className="font-mono tabular-nums text-indigo-300 shrink-0">
            {loadingProgress}%
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl text-center text-xs text-slate-500">
        <span>Real-Time 3D WebGL Environment</span>
        <span className="mx-2">·</span>
        <span>Procedural PBR Architecture</span>
        <span className="mx-2">·</span>
        <span>IndexedDB Persistence</span>
      </div>
    </div>
  );
}
