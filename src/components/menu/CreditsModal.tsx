import { audioManager } from '../../game/systems/AudioManager';
import { architectureRegistry } from '../../game/systems/ArchitectureRegistry';
import { useGameStore } from '../../store/useGameStore';

export function CreditsModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  if (activeModal !== 'credits') return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#060912]/82 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
    >
      <div className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-lg bg-[#0d1424] border border-indigo-500/40 shadow-2xl text-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium tracking-widest text-indigo-300">
              PROJECT CREDITS & FOUNDATION ARCHITECTURE
            </div>
            <h2 id="credits-modal-title" className="font-display text-xl font-semibold text-white">
              The School Chronicles
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playCancel();
              setActiveModal('none');
            }}
            className="min-h-[40px] px-4 py-1.5 rounded bg-[#162038] hover:bg-[#1e2c4c] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-indigo-300 uppercase mb-1.5">
              Phase 1 Core Engineering & Art Direction
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built from the ground up with React 19, TypeScript, Vite, Three.js WebGL PBR rendering, Zustand state management, IndexedDB save persistence, and Capacitor Android packaging readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded bg-[#11192c] border border-slate-800">
              <div className="font-semibold text-white mb-1">3D Environment & Lighting</div>
              <div className="text-slate-400">
                Composite 12-part Seiran High Academy architecture, clock tower, courtyard monument, instanced sakura groves, and ACES Filmic lighting.
              </div>
            </div>
            <div className="p-3.5 rounded bg-[#11192c] border border-slate-800">
              <div className="font-semibold text-white mb-1">Audio & Persistence</div>
              <div className="text-slate-400">
                Procedural Web Audio API school-bell chime synthesis and dual IndexedDB + LocalStorage save slot persistence.
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wider text-indigo-300 uppercase mb-2">
              Modular Phase 2+ Integration Hooks Registered
            </h3>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-[#101729] text-xs">
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-slate-300">Player & Camera Controllers</span>
                <span className="font-mono text-indigo-300">
                  Spawn ({architectureRegistry.player.spawnPosition.x}, {architectureRegistry.player.spawnPosition.z})
                </span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-slate-300">Physics Foundation</span>
                <span className="font-mono text-indigo-300">
                  {architectureRegistry.physics.engineName} (g = {architectureRegistry.physics.gravity.y})
                </span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-slate-300">School Timetable & Bell Schedule</span>
                <span className="font-mono text-indigo-300">
                  {architectureRegistry.timetable.bellSchedule.length} Periods Configured
                </span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-slate-300">NPC, Dialogue, Mission & Inventory</span>
                <span className="font-mono text-indigo-300">Interfaces Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-[#0a101d] border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              setActiveModal('none');
            }}
            className="min-h-[40px] px-5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
