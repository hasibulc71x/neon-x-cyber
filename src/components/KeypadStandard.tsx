import { ThemeColors } from '../types/calculator';

interface KeypadStandardProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onSquare: () => void;
  onSquareRoot: () => void;
  onReciprocal: () => void;
  onNegate: () => void;
  onPercent: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  themeColors: ThemeColors;
}

export function KeypadStandard({
  onInput,
  onClear,
  onBackspace,
  onCalculate,
  onSquare,
  onSquareRoot,
  onReciprocal,
  onNegate,
  onPercent,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryRecall,
  onMemoryClear,
  themeColors,
}: KeypadStandardProps) {
  const baseKey =
    'relative flex items-center justify-center font-cyber-mono font-medium rounded-xl border transition-all duration-150 active:scale-95 text-sm sm:text-base select-none';

  const numKey = `${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 hover:border-slate-700 hover:bg-slate-800/90 shadow-sm`;
  const opKey = `${baseKey} border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400/80 hover:bg-cyan-950/40`;
  const fnKey = `${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 hover:border-purple-400/80 hover:bg-purple-950/40`;
  const memKey = `${baseKey} border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs`;
  const clearKey = `${baseKey} border-rose-500/30 bg-rose-950/20 text-rose-300 hover:border-rose-400 hover:bg-rose-950/40 font-semibold`;
  const equalKey = `${baseKey} border-cyan-400 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 active:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]`;

  return (
    <div className="flex flex-col gap-2">
      {/* Memory Bar */}
      <div className="grid grid-cols-4 gap-2 mb-1">
        <button
          onClick={onMemoryClear}
          className={`${memKey} h-9`}
          title="Memory Clear"
        >
          MC
        </button>
        <button
          onClick={onMemoryRecall}
          className={`${memKey} h-9`}
          title="Memory Recall"
        >
          MR
        </button>
        <button
          onClick={onMemoryAdd}
          className={`${memKey} h-9`}
          title="Memory Add (M+)"
        >
          M+
        </button>
        <button
          onClick={onMemorySubtract}
          className={`${memKey} h-9`}
          title="Memory Subtract (M-)"
        >
          M−
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1 */}
        <button onClick={onPercent} className={`${fnKey} h-12 sm:h-14`}>
          %
        </button>
        <button onClick={onClear} className={`${clearKey} h-12 sm:h-14`}>
          AC
        </button>
        <button onClick={onBackspace} className={`${clearKey} h-12 sm:h-14`}>
          ⌫
        </button>
        <button onClick={() => onInput('/')} className={`${opKey} h-12 sm:h-14`}>
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={onReciprocal} className={`${fnKey} h-12 sm:h-14`}>
          1/x
        </button>
        <button onClick={onSquare} className={`${fnKey} h-12 sm:h-14`}>
          x²
        </button>
        <button onClick={onSquareRoot} className={`${fnKey} h-12 sm:h-14`}>
          √x
        </button>
        <button onClick={() => onInput('*')} className={`${opKey} h-12 sm:h-14`}>
          ×
        </button>

        {/* Row 3 */}
        <button onClick={() => onInput('7')} className={`${numKey} h-12 sm:h-14`}>
          7
        </button>
        <button onClick={() => onInput('8')} className={`${numKey} h-12 sm:h-14`}>
          8
        </button>
        <button onClick={() => onInput('9')} className={`${numKey} h-12 sm:h-14`}>
          9
        </button>
        <button onClick={() => onInput('-')} className={`${opKey} h-12 sm:h-14`}>
          −
        </button>

        {/* Row 4 */}
        <button onClick={() => onInput('4')} className={`${numKey} h-12 sm:h-14`}>
          4
        </button>
        <button onClick={() => onInput('5')} className={`${numKey} h-12 sm:h-14`}>
          5
        </button>
        <button onClick={() => onInput('6')} className={`${numKey} h-12 sm:h-14`}>
          6
        </button>
        <button onClick={() => onInput('+')} className={`${opKey} h-12 sm:h-14`}>
          +
        </button>

        {/* Row 5 */}
        <button onClick={() => onInput('1')} className={`${numKey} h-12 sm:h-14`}>
          1
        </button>
        <button onClick={() => onInput('2')} className={`${numKey} h-12 sm:h-14`}>
          2
        </button>
        <button onClick={() => onInput('3')} className={`${numKey} h-12 sm:h-14`}>
          3
        </button>
        <button
          onClick={onCalculate}
          className={`${equalKey} row-span-2 h-auto text-xl`}
          aria-label="Calculate Result"
        >
          =
        </button>

        {/* Row 6 */}
        <button onClick={onNegate} className={`${numKey} h-12 sm:h-14`}>
          ±
        </button>
        <button onClick={() => onInput('0')} className={`${numKey} h-12 sm:h-14`}>
          0
        </button>
        <button onClick={() => onInput('.')} className={`${numKey} h-12 sm:h-14`}>
          .
        </button>
      </div>
    </div>
  );
}
