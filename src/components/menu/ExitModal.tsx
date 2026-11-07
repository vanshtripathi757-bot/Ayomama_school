import { audioManager } from '../../game/systems/AudioManager';
import { useGameStore } from '../../store/useGameStore';

export function ExitModal() {
  const phase = useGameStore((s) => s.phase);
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setPhase = useGameStore((s) => s.setPhase);

  if (phase === 'exited') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#070a12]/95 px-6 text-center text-slate-100">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-2">
          Session Ended
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Thank you for testing Phase 1 of The School Chronicles. Your preferences and save data have been stored locally.
        </p>
        <button
          type="button"
          onClick={() => {
            audioManager.playConfirmChime();
            setPhase('title');
          }}
          className="min-h-[44px] px-6 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Return to Title Screen
        </button>
      </div>
    );
  }

  if (activeModal !== 'exit-confirm') return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#060912]/82 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div className="w-full max-w-md rounded-lg bg-[#0d1424] border border-rose-500/40 p-6 shadow-2xl text-slate-100">
        <div className="text-xs font-medium tracking-widest text-rose-300 mb-1">
          EXIT CONFIRMATION
        </div>
        <h2 id="exit-modal-title" className="font-display text-xl font-semibold text-white mb-2">
          Exit The School Chronicles?
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Your graphics, audio, and camera settings are automatically saved for your next visit.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              audioManager.playCancel();
              setActiveModal('none');
            }}
            className="min-h-[42px] px-4 py-2 rounded bg-[#162038] hover:bg-[#1e2c4c] border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.playCancel();
              setPhase('exited');
            }}
            className="min-h-[42px] px-5 py-2 rounded bg-rose-600 hover:bg-rose-500 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Exit Game
          </button>
        </div>
      </div>
    </div>
  );
}
