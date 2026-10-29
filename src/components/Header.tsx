import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings2, History, Cpu, Smartphone, Download, HardDrive } from 'lucide-react';
import { CalculatorMode, Settings } from '../types/calculator';
import { THEMES } from '../utils/themes';

interface HeaderProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  settings: Settings;
  onUpdateSettings: (updater: (prev: Settings) => Settings) => void;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  historyCount: number;
  onOpenAndroidInstall: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onOpenDrive: () => void;
  isDriveConnected?: boolean;
}

export function Header({
  currentMode,
  onSelectMode,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onToggleHistory,
  isHistoryOpen,
  historyCount,
  onOpenAndroidInstall,
  isInstallable,
  isInstalled,
  onOpenDrive,
  isDriveConnected,
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const modes: { id: CalculatorMode; label: string }[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'scientific', label: 'Scientific' },
    { id: 'programmer', label: 'Programmer' },
    { id: 'eee', label: 'EEE Engineering' },
  ];

  return (
    <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-orbitron font-bold tracking-wider text-base sm:text-lg text-slate-100 whitespace-nowrap">
                NEON-X
              </span>
              <span className="text-xs font-mono font-medium tracking-widest text-cyan-400/90 whitespace-nowrap hidden md:inline">
                CYBER CALCULATOR
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 hidden lg:flex items-center gap-2">
              <span>{dateStr}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation mode selector tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800/80 overflow-x-auto max-w-full">
          {modes.map((mode) => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Android Mobile & APK Install Button */}
          <button
            onClick={onOpenAndroidInstall}
            title="Download APK / Install on Android Mobile"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-400 text-xs font-mono font-medium shadow-[0_0_10px_rgba(6,182,212,0.25)] transition-all whitespace-nowrap shrink-0"
          >
            {isInstallable ? (
              <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {isInstalled ? 'Android App' : 'Android / APK'}
            </span>
          </button>

          {/* Google Drive Cloud Sync Button */}
          <button
            onClick={onOpenDrive}
            title="Google Drive Cloud Sync"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-xs font-mono font-medium transition-all whitespace-nowrap shrink-0"
          >
            <HardDrive className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span className="hidden md:inline">Drive Sync</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((prev) => ({
                ...prev,
                soundEnabled: !prev.soundEnabled,
              }))
            }
            title={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            aria-label={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className={`p-2 rounded-lg border transition-colors ${
              settings.soundEnabled
                ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30 hover:bg-cyan-950/60'
                : 'border-slate-800 text-slate-500 bg-slate-900 hover:text-slate-300'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* History Panel Drawer Toggle */}
          <button
            onClick={onToggleHistory}
            title="Calculation History"
            aria-label="Calculation History"
            className={`p-2 rounded-lg border relative transition-colors ${
              isHistoryOpen
                ? 'border-cyan-500/40 bg-slate-800 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            title="System Settings"
            aria-label="System Settings"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
