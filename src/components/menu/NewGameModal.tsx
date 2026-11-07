import { useEffect } from 'react';
import { audioManager } from '../../game/systems/AudioManager';
import { useGameStore } from '../../store/useGameStore';

export function NewGameModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const savedSlot = useGameStore((s) => s.savedSlot);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const startNewGameSession = useGameStore((s) => s.startNewGameSession);
  const beginNewGameCharacterCreation = useGameStore(
    (s) => s.beginNewGameCharacterCreation
  );

  useEffect(() => {
    if (activeModal !== 'new-game-confirm') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        void startNewGameSession();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        audioManager.playCancel();
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, startNewGameSession, setActiveModal]);

  if (activeModal !== 'new-game-confirm') return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#060912]/80 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-game-modal-title"
    >
      <div className="w-full max-w-md rounded-lg bg-[#0d1424] border border-indigo-500/40 p-6 sm:p-7 shadow-2xl text-slate-100">
        <div className="text-xs font-medium tracking-widest text-emerald-300 mb-1">
          HOSHINO ACADEMY ENROLLMENT · CLASS D TRANSFER PLACEMENT
        </div>
        <h2
          id="new-game-modal-title"
          className="font-display text-xl sm:text-2xl font-semibold text-white mb-3"
        >
          Begin New School Chronicle?
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Enroll at Hoshino Academy starting in <strong className="text-emerald-300">Class D (Rank #4 · 340 CP)</strong>. Customize your 3D transfer student in real time, review your Class D arrival story, and lead Class D to the top of the academy rankings while uncovering <strong className="text-amber-200">Project Hoshikaze</strong>!
        </p>

        {savedSlot && (
          <div className="mb-4 p-3 rounded bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200">
            Starting a new session will overwrite your existing save slot ({savedSlot.locationName}).
          </div>
        )}

        <div className="flex flex-col gap-2.5 mt-5">
          <button
            type="button"
            data-testid="start-character-creation-btn"
            onClick={() => {
              beginNewGameCharacterCreation();
            }}
            className="w-full min-h-[44px] px-4 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            ✨ Customize 3D Character &amp; Class D Story ▸
          </button>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                audioManager.playCancel();
                setActiveModal('none');
              }}
              className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded bg-[#162038] hover:bg-[#1e2b4a] border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              data-start="true"
              autoFocus
              onClick={() => {
                void startNewGameSession();
              }}
              className="w-full flex-1 min-h-[42px] px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-xs sm:text-sm font-semibold text-white shadow-md transition-colors cursor-pointer whitespace-nowrap"
            >
              Confirm &amp; Enter Academy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
