import { useState } from 'react';
import { X, Trash2, ArrowUpRight, Copy, Check, Terminal, HardDrive } from 'lucide-react';
import { HistoryItem, ThemeColors } from '../types/calculator';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onOpenDrive?: () => void;
  themeColors: ThemeColors;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
  onOpenDrive,
  themeColors,
}: HistoryDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-[#050914] border-l border-slate-800 flex flex-col shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-orbitron font-bold text-sm text-slate-100 tracking-wider">
              CALCULATION LOG
            </span>
            <span className="text-xs font-mono text-cyan-500 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDrive && (
              <button
                onClick={onOpenDrive}
                title="Backup to Google Drive"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded border border-cyan-500/30 bg-cyan-950/20"
              >
                <HardDrive className="w-3.5 h-3.5" /> Drive
              </button>
            )}
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear all logs"
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded border border-rose-500/30 bg-rose-950/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 font-cyber-mono">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Terminal className="w-10 h-10 mb-2 stroke-1 opacity-40 text-cyan-400" />
              <div className="text-sm font-medium text-slate-400">NO RECORDS FOUND</div>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Executed calculations across Standard, Scientific, and Programmer modes will stream here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative p-3 rounded-xl border border-slate-800/80 bg-slate-950/70 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="uppercase text-cyan-400 font-semibold">{item.mode}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="text-slate-300 font-medium truncate mb-1">
                  {item.expression} =
                </div>

                <div className="text-base font-bold text-cyan-300">
                  {item.result}
                </div>

                {/* Hover Actions */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => onSelectHistory(item)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Insert
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, item.result)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
