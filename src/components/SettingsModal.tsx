import { X, Sliders, Volume2, Sparkles, Monitor, Palette } from 'lucide-react';
import { Settings, ThemeName } from '../types/calculator';
import { THEMES } from '../utils/themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (updater: (prev: Settings) => Settings) => void;
  onResetDefaults: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#060c18] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col font-chakra">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="font-orbitron font-bold text-base text-slate-100 tracking-wider">
              SYSTEM CONFIGURATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 font-chakra text-sm">
          {/* 1. Theme Palette */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-2">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEON THEME PALETTE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(THEMES) as ThemeName[]).map((themeKey) => {
                const theme = THEMES[themeKey];
                const isSelected = settings.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() =>
                      onUpdateSettings((prev) => ({ ...prev, theme: themeKey }))
                    }
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-slate-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                    <span className="truncate">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Angle Units */}
          <div>
            <div className="text-xs font-mono text-slate-400 mb-2">
              TRIGONOMETRIC DEFAULT UNIT
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['DEG', 'RAD'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() =>
                    onUpdateSettings((prev) => ({ ...prev, angleUnit: unit }))
                  }
                  className={`p-2.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
                    settings.angleUnit === unit
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {unit === 'DEG' ? 'DEGREES (°)' : 'RADIANS (rad)'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Decimal Precision */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
              <span>DECIMAL CALCULATION PRECISION</span>
              <span className="text-cyan-400 font-bold">{settings.precision} DIGITS</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              value={settings.precision}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  precision: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>2</span>
              <span>8 (Standard)</span>
              <span>16 (Max)</span>
            </div>
          </div>

          {/* 4. Audio Controls */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>SYNTHESIZER SOUND EFFECTS</span>
              </span>
              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    soundEnabled: !prev.soundEnabled,
                  }))
                }
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  settings.soundEnabled
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                    : 'border-slate-800 text-slate-500 bg-slate-900'
                }`}
              >
                {settings.soundEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="mt-2 pl-2 border-l border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>MASTER FX VOLUME</span>
                  <span className="text-cyan-400">{settings.soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      soundVolume: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 5. Visual Optics: Scanlines & Particles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="text-xs text-slate-200 font-medium">CRT Scanline Overlay</div>
                  <div className="text-[11px] text-slate-500">Subtle retro-futuristic scanlines</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.scanlines}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, scanlines: e.target.checked }))
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="text-xs text-slate-200 font-medium">Quantum Particle Field</div>
                  <div className="text-[11px] text-slate-500">Animated cyber background grid and nodes</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, animations: e.target.checked }))
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onResetDefaults}
            className="text-xs text-rose-400 hover:text-rose-300"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
