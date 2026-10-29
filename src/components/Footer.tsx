import { CalculatorMode } from '../types/calculator';

interface FooterProps {
  currentMode: CalculatorMode;
  precision: number;
  hasMemory: boolean;
  soundEnabled: boolean;
}

export function Footer({
  currentMode,
  precision,
  hasMemory,
  soundEnabled,
}: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-slate-900 bg-[#02050c]/90 py-2.5 px-4 text-xs font-cyber-mono text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-semibold text-emerald-400">CORE ENGINE NOMINAL</span>
          </div>
          <span aria-hidden="true" className="text-slate-800">|</span>
          <span className="text-[11px] uppercase text-cyan-400">MODE: {currentMode}</span>
          <span aria-hidden="true" className="text-slate-800 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">PRECISION: {precision}D</span>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>MEM: {hasMemory ? 'ENGAGED' : 'CLEAR'}</span>
          <span aria-hidden="true" className="text-slate-800">|</span>
          <span>AUDIO: {soundEnabled ? 'ACTIVE' : 'MUTED'}</span>
          <span aria-hidden="true" className="text-slate-800">|</span>
          <span className="text-slate-500">NEON-X v2.4</span>
        </div>
      </div>
    </footer>
  );
}
