import { useState } from 'react';
import {
  KEYBOARD_CONTROLS_INFO,
  TOUCH_CONTROLS_INFO,
} from '../../config/defaults';
import { audioManager } from '../../game/systems/AudioManager';
import { useGameStore } from '../../store/useGameStore';
import {
  GraphicsPreset,
  ResolutionScale,
  ShadowQuality,
} from '../../types/game';

type SettingsTab = 'graphics' | 'display' | 'audio' | 'camera' | 'controls';

export function SettingsModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const settings = useGameStore((s) => s.settings);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const setGraphicsPreset = useGameStore((s) => s.setGraphicsPreset);
  const setShadowQuality = useGameStore((s) => s.setShadowQuality);
  const setResolutionScale = useGameStore((s) => s.setResolutionScale);
  const setFullscreen = useGameStore((s) => s.setFullscreen);
  const setShowMobileControls = useGameStore((s) => s.setShowMobileControls);
  const setMasterVolume = useGameStore((s) => s.setMasterVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const setCameraSensitivity = useGameStore((s) => s.setCameraSensitivity);
  const setCameraInvertY = useGameStore((s) => s.setCameraInvertY);
  const resetSettingsToDefault = useGameStore((s) => s.resetSettingsToDefault);

  // Keep every Hook unconditional and in the same order on every render.
  // The modal is mounted continuously by App, so this state must be declared
  // before the visibility guard to avoid React error #310.
  const [activeTab, setActiveTab] = useState<SettingsTab>('graphics');

  if (activeModal !== 'settings') return null;

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'graphics', label: 'Graphics' },
    { id: 'display', label: 'Display' },
    { id: 'audio', label: 'Audio' },
    { id: 'camera', label: 'Camera' },
    { id: 'controls', label: 'Controls' },
  ];

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#060912]/82 px-3 sm:px-6 py-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-[#0d1424] border border-indigo-500/40 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium tracking-widest text-indigo-300">
              SYSTEM CONFIGURATION
            </div>
            <h2 id="settings-modal-title" className="font-display text-xl font-semibold text-white">
              Settings
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
            Close [Esc]
          </button>
        </div>

        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Settings Categories"
          className="px-6 pt-3 pb-2 bg-[#0a101d] border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto"
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  audioManager.playClick();
                  setActiveTab(t.id);
                }}
                className={`min-h-[40px] px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'graphics' && (
            <div className="space-y-6">
              {/* Quality Preset */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-100">
                    Graphics Quality Preset
                  </label>
                  <span className="text-xs text-indigo-300 font-mono uppercase">
                    {settings.graphics.preset}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Adjusts real-time sakura petal density, shadow maps, and WebGL rendering scale.
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['low', 'medium', 'high'] as GraphicsPreset[]).map((preset) => {
                    const selected = settings.graphics.preset === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          setGraphicsPreset(preset);
                        }}
                        className={`min-h-[44px] py-2.5 px-4 rounded border text-xs sm:text-sm font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                          selected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-[#121b2f] border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shadow Quality */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-100">
                    Directional Shadow Quality
                  </label>
                  <span className="text-xs text-indigo-300 font-mono uppercase">
                    {settings.graphics.shadowQuality}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Controls real-time sunlight shadow map resolution across the academy courtyard.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(['off', 'low', 'medium', 'high'] as ShadowQuality[]).map((sq) => {
                    const selected = settings.graphics.shadowQuality === sq;
                    return (
                      <button
                        key={sq}
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          setShadowQuality(sq);
                        }}
                        className={`min-h-[42px] py-2 px-3 rounded border text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                          selected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-[#121b2f] border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {sq}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Scaling */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-100">
                    Resolution Scale
                  </label>
                  <span className="text-xs text-indigo-300 font-mono tabular-nums">
                    {Math.round(settings.graphics.resolutionScale * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Scales internal WebGL pixel ratio relative to your display for mobile/desktop balance.
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {([0.75, 1.0, 1.25] as ResolutionScale[]).map((scale) => {
                    const selected = settings.graphics.resolutionScale === scale;
                    return (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          setResolutionScale(scale);
                        }}
                        className={`min-h-[42px] py-2 px-3 rounded border text-xs font-mono tabular-nums font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          selected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-[#121b2f] border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {Math.round(scale * 100)}%
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-5">
              {/* On-Screen Mobile Controls Visibility */}
              <div className="p-4 rounded bg-[#121b2f] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      On-Screen Mobile Touch Controls
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Controls visibility of the left virtual thumbstick and right action pad (Interact, Jump, Sprint, Camera).
                    </p>
                  </div>
                  <span className="text-xs text-indigo-300 font-mono uppercase">
                    {settings.display.showMobileControls}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'always', label: 'Always On' },
                      { id: 'auto', label: 'Auto (Touch)' },
                      { id: 'hidden', label: 'Hidden' },
                    ] as const
                  ).map((opt) => {
                    const selected = settings.display.showMobileControls === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          setShowMobileControls(opt.id);
                        }}
                        className={`min-h-[40px] px-3 py-2 rounded border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          selected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-[#101729] border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded bg-[#121b2f] border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    Fullscreen Mode
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Expands the game viewport to fullscreen where supported by the browser or WebView.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    void setFullscreen(!settings.display.fullscreen);
                  }}
                  className={`min-h-[42px] px-4 py-2 rounded font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    settings.display.fullscreen
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#1b2742] text-slate-200 border border-slate-700'
                  }`}
                >
                  {settings.display.fullscreen ? 'Fullscreen Active' : 'Enable Fullscreen'}
                </button>
              </div>

              <div className="p-4 rounded bg-[#101729] border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="text-slate-200 font-medium">
                  Responsive Viewport Status
                </div>
                <div>
                  The 3D WebGL canvas automatically adapts to desktop widescreen, mobile portrait, and landscape orientations via live ResizeObserver tracking.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 rounded bg-[#121b2f] border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-100">Master Audio</div>
                  <div className="text-xs text-slate-400">
                    {settings.audio.muted ? 'All game audio is currently muted' : 'Procedural Web Audio synthesis active'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleMute();
                  }}
                  className={`min-h-[40px] px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    settings.audio.muted
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {settings.audio.muted ? 'Muted (Click to Unmute)' : 'Audio Enabled'}
                </button>
              </div>

              {/* Master Volume */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="master-vol-slider" className="font-medium text-slate-200">
                    Master Volume
                  </label>
                  <span className="font-mono tabular-nums text-xs text-indigo-300">
                    {settings.audio.masterVolume}%
                  </span>
                </div>
                <input
                  id="master-vol-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={settings.audio.masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  onMouseUp={() => audioManager.playClick()}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Music Volume */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="music-vol-slider" className="font-medium text-slate-200">
                    Music Volume
                  </label>
                  <span className="font-mono tabular-nums text-xs text-indigo-300">
                    {settings.audio.musicVolume}%
                  </span>
                </div>
                <input
                  id="music-vol-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={settings.audio.musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="sfx-vol-slider" className="font-medium text-slate-200">
                    Sound Effects (UI & School Bell) Volume
                  </label>
                  <span className="font-mono tabular-nums text-xs text-indigo-300">
                    {settings.audio.sfxVolume}%
                  </span>
                </div>
                <input
                  id="sfx-vol-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={settings.audio.sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  onMouseUp={() => audioManager.playConfirmChime()}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="cam-sens-slider" className="font-semibold text-slate-100">
                    Camera Orbit Sensitivity
                  </label>
                  <span className="font-mono tabular-nums text-xs text-indigo-300">
                    {settings.camera.sensitivity.toFixed(2)}x
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Controls camera drag and keyboard look speed in the 3D Academy scene (and Phase 2 third-person follow camera).
                </p>
                <input
                  id="cam-sens-slider"
                  type="range"
                  min={0.2}
                  max={2.0}
                  step={0.05}
                  value={settings.camera.sensitivity}
                  onChange={(e) => setCameraSensitivity(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded bg-[#121b2f] border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    Invert Vertical Look (Y-Axis)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Reverses vertical pointer drag pitch direction when inspecting the campus.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setCameraInvertY(!settings.camera.invertY);
                  }}
                  className={`min-h-[40px] px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    settings.camera.invertY
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#1b2742] text-slate-300 border border-slate-700'
                  }`}
                >
                  {settings.camera.invertY ? 'Inverted' : 'Standard'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-indigo-300 uppercase mb-2.5">
                  Desktop Keyboard & Mouse Controls
                </h3>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-[#101729]">
                  {KEYBOARD_CONTROLS_INFO.map((item) => (
                    <div
                      key={item.action}
                      className="px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm gap-4"
                    >
                      <span className="text-slate-300">{item.action}</span>
                      <span className="font-mono text-xs text-indigo-300 shrink-0">
                        {item.binding}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-wider text-indigo-300 uppercase mb-2.5">
                  Android & Touchscreen Controls
                </h3>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-[#101729]">
                  {TOUCH_CONTROLS_INFO.map((item) => (
                    <div
                      key={item.gesture}
                      className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 sm:gap-4"
                    >
                      <span className="font-semibold text-slate-200 shrink-0">
                        {item.gesture}
                      </span>
                      <span className="text-slate-400 sm:text-right">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0a101d] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              resetSettingsToDefault();
            }}
            className="min-h-[40px] px-4 py-1.5 rounded bg-transparent hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.playConfirmChime();
              setActiveModal('none');
            }}
            className="min-h-[40px] px-5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  );
}
