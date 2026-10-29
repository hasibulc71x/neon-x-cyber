import { useState } from 'react';
import { Copy, Check, Delete, RotateCcw } from 'lucide-react';
import { AngleUnit } from '../utils/mathEngine';
import { ThemeColors } from '../types/calculator';

interface DisplayProps {
  expression: string;
  result: string;
  error?: string | null;
  angleUnit: AngleUnit;
  onToggleAngleUnit: () => void;
  hasMemory: boolean;
  memoryValue: number;
  onRecallMemory: () => void;
  onClearMemory: () => void;
  onBackspace: () => void;
  onClear: () => void;
  themeColors: ThemeColors;
  scanlines: boolean;
}

export function Display({
  expression,
  result,
  error,
  angleUnit,
  onToggleAngleUnit,
  hasMemory,
  memoryValue,
  onRecallMemory,
  onClearMemory,
  onBackspace,
  onClear,
  themeColors,
  scanlines,
}: DisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = error ? expression : result || expression || '0';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`relative w-full rounded-2xl border ${themeColors.border} bg-[#040814]/90 p-5 sm:p-6 mb-4 shadow-xl overflow-hidden transition-all duration-200`}
    >
      {/* Optional holographic scanlines overlay */}
      {scanlines && (
        <div className="cyber-scanlines absolute inset-0 z-10 pointer-events-none opacity-40" />
      )}

      {/* Decorative cyber corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 opacity-60" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 opacity-60" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 opacity-60" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 opacity-60" />

      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between text-xs font-mono mb-2 text-slate-400">
        <div className="flex items-center gap-2">
          {/* Angle Mode Badge / Toggle */}
          <button
            onClick={onToggleAngleUnit}
            title="Click to toggle DEG / RAD"
            className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900/80 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 transition-colors text-[11px] font-semibold tracking-wider"
          >
            {angleUnit}
          </button>

          {/* Memory Tag */}
          {hasMemory ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onRecallMemory}
                title={`Memory Stored: ${memoryValue} (Click to insert)`}
                className="px-2 py-0.5 rounded border border-pink-500/40 bg-pink-950/30 text-pink-400 hover:bg-pink-950/60 transition-colors text-[11px] font-semibold"
              >
                M: {memoryValue}
              </button>
              <button
                onClick={onClearMemory}
                title="Clear Memory (MC)"
                className="text-[10px] text-slate-500 hover:text-rose-400 px-1"
              >
                ×
              </button>
            </div>
          ) : (
            <span className="text-slate-600 text-[11px]">M: 0</span>
          )}
        </div>

        {/* Action icons: Copy, Backspace, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            title="Copy Result to Clipboard"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 px-1">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={onBackspace}
            title="Backspace (Delete last character)"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClear}
            title="All Clear (AC)"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expression input stream */}
      <div className="w-full text-right font-cyber-mono text-sm sm:text-base text-slate-400 tracking-wide min-h-[1.5rem] overflow-x-auto whitespace-nowrap scrollbar-none select-text">
        {expression || <span className="opacity-0">0</span>}
      </div>

      {/* Main output readout */}
      <div className="w-full text-right font-cyber-mono font-bold tracking-tight select-text overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        {error ? (
          <span className="text-xl sm:text-2xl text-rose-400 font-medium">
            {error}
          </span>
        ) : (
          <span
            className={`text-3xl sm:text-4xl md:text-5xl ${themeColors.textBright} drop-shadow-[0_0_15px_rgba(6,182,212,0.45)]`}
          >
            {result || '0'}
          </span>
        )}
      </div>
    </div>
  );
}
