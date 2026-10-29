import { useState } from 'react';
import { ThemeColors } from '../types/calculator';
import { AngleUnit } from '../utils/mathEngine';

interface KeypadScientificProps {
  onInput: (char: string) => void;
  onInsertFunction: (fn: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onNegate: () => void;
  angleUnit: AngleUnit;
  onToggleAngleUnit: () => void;
  themeColors: ThemeColors;
}

export function KeypadScientific({
  onInput,
  onInsertFunction,
  onClear,
  onBackspace,
  onCalculate,
  onNegate,
  angleUnit,
  onToggleAngleUnit,
  themeColors,
}: KeypadScientificProps) {
  const [isSecond, setIsSecond] = useState(false);
  const [isHyp, setIsHyp] = useState(false);

  const baseKey =
    'relative flex items-center justify-center font-cyber-mono font-medium rounded-xl border transition-all duration-150 active:scale-95 text-xs sm:text-sm select-none';

  const numKey = `${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 hover:border-slate-700 hover:bg-slate-800/90`;
  const opKey = `${baseKey} border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400/80 hover:bg-cyan-950/40`;
  const sciKey = `${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 hover:border-purple-400/80 hover:bg-purple-950/40`;
  const toggleKey = (active: boolean) =>
    `${baseKey} ${
      active
        ? 'border-purple-400 bg-purple-900/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-purple-300 hover:border-purple-500/40'
    }`;
  const clearKey = `${baseKey} border-rose-500/30 bg-rose-950/20 text-rose-300 hover:border-rose-400 hover:bg-rose-950/40 font-semibold`;
  const equalKey = `${baseKey} border-cyan-400 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 active:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]`;

  const handleTrig = (func: 'sin' | 'cos' | 'tan') => {
    let fnName = func;
    if (isSecond && isHyp) {
      fnName = `a${func}h` as any;
    } else if (isSecond) {
      fnName = `a${func}` as any;
    } else if (isHyp) {
      fnName = `${func}h` as any;
    }
    onInsertFunction(fnName);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Function Toggle Tiers */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-1">
        <button
          onClick={() => setIsSecond(!isSecond)}
          className={`${toggleKey(isSecond)} h-8 text-[11px] font-semibold`}
        >
          2nd {isSecond ? '▲' : '▼'}
        </button>
        <button
          onClick={() => setIsHyp(!isHyp)}
          className={`${toggleKey(isHyp)} h-8 text-[11px] font-semibold`}
        >
          HYP {isHyp ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={onToggleAngleUnit}
          className={`${toggleKey(false)} h-8 text-[11px] font-semibold text-cyan-400`}
        >
          {angleUnit}
        </button>
        <button
          onClick={() => onInput('phi')}
          className={`${sciKey} h-8 text-[11px]`}
          title="Golden Ratio (φ)"
        >
          φ
        </button>
      </div>

      {/* 5-Column Scientific Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* Row 1: Trig & Log tier */}
        <button
          onClick={() => handleTrig('sin')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          {isSecond ? (isHyp ? 'asinh' : 'asin') : isHyp ? 'sinh' : 'sin'}
        </button>
        <button
          onClick={() => handleTrig('cos')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          {isSecond ? (isHyp ? 'acosh' : 'acos') : isHyp ? 'cosh' : 'cos'}
        </button>
        <button
          onClick={() => handleTrig('tan')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          {isSecond ? (isHyp ? 'atanh' : 'atan') : isHyp ? 'tanh' : 'tan'}
        </button>
        <button onClick={onClear} className={`${clearKey} h-11 sm:h-12`}>
          AC
        </button>
        <button onClick={onBackspace} className={`${clearKey} h-11 sm:h-12`}>
          ⌫
        </button>

        {/* Row 2: Powers & Logs */}
        <button
          onClick={() => (isSecond ? onInsertFunction('10^') : onInsertFunction('log'))}
          className={`${sciKey} h-11 sm:h-12`}
        >
          {isSecond ? '10ˣ' : 'log'}
        </button>
        <button
          onClick={() => (isSecond ? onInsertFunction('exp') : onInsertFunction('ln'))}
          className={`${sciKey} h-11 sm:h-12`}
        >
          {isSecond ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() => onInput('^')}
          className={`${sciKey} h-11 sm:h-12`}
          title="Exponent (x^y)"
        >
          xʸ
        </button>
        <button
          onClick={() => (isSecond ? onInsertFunction('cbrt') : onInsertFunction('sqrt'))}
          className={`${sciKey} h-11 sm:h-12`}
        >
          {isSecond ? '³√x' : '√x'}
        </button>
        <button onClick={() => onInput('/')} className={`${opKey} h-11 sm:h-12`}>
          ÷
        </button>

        {/* Row 3: Constants & 7-8-9 */}
        <button
          onClick={() => onInput('pi')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          π
        </button>
        <button
          onClick={() => onInput('(')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          (
        </button>
        <button onClick={() => onInput('7')} className={`${numKey} h-11 sm:h-12`}>
          7
        </button>
        <button onClick={() => onInput('8')} className={`${numKey} h-11 sm:h-12`}>
          8
        </button>
        <button onClick={() => onInput('9')} className={`${numKey} h-11 sm:h-12`}>
          9
        </button>

        {/* Row 4: e, ), 4-5-6, * */}
        <button
          onClick={() => onInput('e')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          e
        </button>
        <button
          onClick={() => onInput(')')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          )
        </button>
        <button onClick={() => onInput('4')} className={`${numKey} h-11 sm:h-12`}>
          4
        </button>
        <button onClick={() => onInput('5')} className={`${numKey} h-11 sm:h-12`}>
          5
        </button>
        <button onClick={() => onInput('6')} className={`${numKey} h-11 sm:h-12`}>
          6
        </button>

        {/* Row 5: x!, abs, 1-2-3, - */}
        <button
          onClick={() => onInput('!')}
          className={`${sciKey} h-11 sm:h-12`}
          title="Factorial (n!)"
        >
          n!
        </button>
        <button
          onClick={() => onInsertFunction('abs')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          |x|
        </button>
        <button onClick={() => onInput('1')} className={`${numKey} h-11 sm:h-12`}>
          1
        </button>
        <button onClick={() => onInput('2')} className={`${numKey} h-11 sm:h-12`}>
          2
        </button>
        <button onClick={() => onInput('3')} className={`${numKey} h-11 sm:h-12`}>
          3
        </button>

        {/* Row 6: Reciprocal, 0, ., Operators, Equal */}
        <button
          onClick={() => onInsertFunction('1/')}
          className={`${sciKey} h-11 sm:h-12`}
        >
          1/x
        </button>
        <button onClick={onNegate} className={`${numKey} h-11 sm:h-12`}>
          ±
        </button>
        <button onClick={() => onInput('0')} className={`${numKey} h-11 sm:h-12`}>
          0
        </button>
        <button onClick={() => onInput('.')} className={`${numKey} h-11 sm:h-12`}>
          .
        </button>
        <button onClick={() => onInput('*')} className={`${opKey} h-11 sm:h-12`}>
          ×
        </button>

        {/* Row 7: Percent, Add, Minus, Equal */}
        <button onClick={() => onInput('%')} className={`${sciKey} h-11 sm:h-12`}>
          %
        </button>
        <button onClick={() => onInput('-')} className={`${opKey} h-11 sm:h-12`}>
          −
        </button>
        <button onClick={() => onInput('+')} className={`${opKey} h-11 sm:h-12`}>
          +
        </button>
        <button
          onClick={onCalculate}
          className={`${equalKey} col-span-2 h-11 sm:h-12 text-lg`}
        >
          =
        </button>
      </div>
    </div>
  );
}
