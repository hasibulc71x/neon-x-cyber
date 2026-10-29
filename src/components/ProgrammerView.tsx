import { useState } from 'react';
import {
  ProgrammerBase,
  ProgrammerWordSize,
  ThemeColors,
} from '../types/calculator';
import {
  getProgrammerRepresentations,
  toggleBit,
  isBitSet,
  rotateLeft,
  rotateRight,
  maskValue,
} from '../utils/programmerMath';

interface ProgrammerViewProps {
  themeColors: ThemeColors;
  onPlaySound: (type: any) => void;
}

export function ProgrammerView({ themeColors, onPlaySound }: ProgrammerViewProps) {
  const [currentValue, setCurrentValue] = useState<bigint>(42n);
  const [activeBase, setActiveBase] = useState<ProgrammerBase>('DEC');
  const [wordSize, setWordSize] = useState<ProgrammerWordSize>(64);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [pendingOperand, setPendingOperand] = useState<bigint | null>(null);
  const [inputBuffer, setInputBuffer] = useState<string>('42');
  const [resetInputOnNext, setResetInputOnNext] = useState<boolean>(false);

  const reps = getProgrammerRepresentations(currentValue, wordSize);

  const handleBaseChange = (base: ProgrammerBase) => {
    setActiveBase(base);
    onPlaySound('toggle');
    switch (base) {
      case 'HEX':
        setInputBuffer(reps.hex);
        break;
      case 'DEC':
        setInputBuffer(reps.dec);
        break;
      case 'OCT':
        setInputBuffer(reps.oct);
        break;
      case 'BIN':
        setInputBuffer(reps.bin.replace(/\s+/g, ''));
        break;
    }
  };

  const handleWordSizeChange = (size: ProgrammerWordSize) => {
    setWordSize(size);
    const masked = maskValue(currentValue, size);
    setCurrentValue(masked);
    onPlaySound('toggle');
  };

  const handleDigitInput = (digit: string) => {
    onPlaySound('number');
    let nextBuf = inputBuffer;
    if (resetInputOnNext || inputBuffer === '0') {
      nextBuf = digit;
      setResetInputOnNext(false);
    } else {
      nextBuf = inputBuffer + digit;
    }

    try {
      let val = 0n;
      if (activeBase === 'HEX') val = BigInt(`0x${nextBuf}`);
      else if (activeBase === 'DEC') val = BigInt(nextBuf);
      else if (activeBase === 'OCT') val = BigInt(`0o${nextBuf}`);
      else if (activeBase === 'BIN') val = BigInt(`0b${nextBuf}`);

      val = maskValue(val, wordSize);
      setCurrentValue(val);
      setInputBuffer(nextBuf);
    } catch {
      // Invalid parse ignored
    }
  };

  const handleBackspace = () => {
    onPlaySound('backspace');
    if (inputBuffer.length <= 1) {
      setInputBuffer('0');
      setCurrentValue(0n);
      return;
    }
    const sliced = inputBuffer.slice(0, -1);
    setInputBuffer(sliced);
    try {
      let val = 0n;
      if (activeBase === 'HEX') val = BigInt(`0x${sliced}`);
      else if (activeBase === 'DEC') val = BigInt(sliced);
      else if (activeBase === 'OCT') val = BigInt(`0o${sliced}`);
      else if (activeBase === 'BIN') val = BigInt(`0b${sliced}`);
      setCurrentValue(maskValue(val, wordSize));
    } catch {
      // Ignore
    }
  };

  const handleClear = () => {
    onPlaySound('clear');
    setCurrentValue(0n);
    setInputBuffer('0');
    setPendingOp(null);
    setPendingOperand(null);
    setResetInputOnNext(false);
  };

  const handleBitClick = (bitIndex: number) => {
    onPlaySound('toggle');
    const toggled = toggleBit(currentValue, bitIndex, wordSize);
    setCurrentValue(toggled);
    const updated = getProgrammerRepresentations(toggled, wordSize);
    if (activeBase === 'HEX') setInputBuffer(updated.hex);
    else if (activeBase === 'DEC') setInputBuffer(updated.dec);
    else if (activeBase === 'OCT') setInputBuffer(updated.oct);
    else if (activeBase === 'BIN') setInputBuffer(updated.bin.replace(/\s+/g, ''));
  };

  const handleBitwiseOp = (op: string) => {
    onPlaySound('operator');
    if (op === 'NOT') {
      const inverted = maskValue(~currentValue, wordSize);
      setCurrentValue(inverted);
      setInputBuffer(getProgrammerRepresentations(inverted, wordSize)[activeBase.toLowerCase() as 'hex' | 'dec' | 'oct']);
      return;
    }
    if (op === 'RoL') {
      const rolled = rotateLeft(currentValue, 1, wordSize);
      setCurrentValue(rolled);
      setInputBuffer(getProgrammerRepresentations(rolled, wordSize)[activeBase.toLowerCase() as 'hex' | 'dec' | 'oct']);
      return;
    }
    if (op === 'RoR') {
      const rolled = rotateRight(currentValue, 1, wordSize);
      setCurrentValue(rolled);
      setInputBuffer(getProgrammerRepresentations(rolled, wordSize)[activeBase.toLowerCase() as 'hex' | 'dec' | 'oct']);
      return;
    }

    setPendingOperand(currentValue);
    setPendingOp(op);
    setResetInputOnNext(true);
  };

  const handleEquals = () => {
    if (!pendingOp || pendingOperand === null) return;
    onPlaySound('enter');

    let result = currentValue;
    const a = pendingOperand;
    const b = currentValue;

    switch (pendingOp) {
      case 'AND':
        result = a & b;
        break;
      case 'OR':
        result = a | b;
        break;
      case 'XOR':
        result = a ^ b;
        break;
      case 'NAND':
        result = ~(a & b);
        break;
      case 'NOR':
        result = ~(a | b);
        break;
      case 'LSH':
        result = a << (b & 63n);
        break;
      case 'RSH':
        result = a >> (b & 63n);
        break;
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        if (b === 0n) {
          onPlaySound('error');
          return;
        }
        result = a / b;
        break;
    }

    result = maskValue(result, wordSize);
    setCurrentValue(result);
    const updated = getProgrammerRepresentations(result, wordSize);
    setInputBuffer(updated[activeBase.toLowerCase() as 'hex' | 'dec' | 'oct']);
    setPendingOp(null);
    setPendingOperand(null);
    setResetInputOnNext(true);
  };

  const isKeyDisabled = (char: string) => {
    const hexKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
    const octKeys = ['8', '9'];
    const binKeys = ['2', '3', '4', '5', '6', '7', '8', '9'];

    if (activeBase === 'BIN') {
      return binKeys.includes(char) || hexKeys.includes(char);
    }
    if (activeBase === 'OCT') {
      return octKeys.includes(char) || hexKeys.includes(char);
    }
    if (activeBase === 'DEC') {
      return hexKeys.includes(char);
    }
    return false;
  };

  const baseKey =
    'relative flex items-center justify-center font-cyber-mono font-medium rounded-xl border transition-all duration-150 active:scale-95 text-xs sm:text-sm select-none';

  return (
    <div className="flex flex-col gap-3">
      {/* Multi-Base Synchronized Telemetry Display */}
      <div className="rounded-2xl border border-slate-800 bg-[#040814]/90 p-4 font-cyber-mono space-y-2 shadow-lg">
        {/* Word Size Selector */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium">REGISTER SIZE</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {([64, 32, 16, 8] as ProgrammerWordSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleWordSizeChange(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  wordSize === size
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size === 64 ? 'QWORD (64)' : size === 32 ? 'DWORD (32)' : size === 16 ? 'WORD (16)' : 'BYTE (8)'}
              </button>
            ))}
          </div>
        </div>

        {/* Bases: HEX, DEC, OCT, BIN */}
        {[
          { base: 'HEX' as ProgrammerBase, val: reps.hex, prefix: '0x' },
          { base: 'DEC' as ProgrammerBase, val: reps.dec, prefix: '' },
          { base: 'OCT' as ProgrammerBase, val: reps.oct, prefix: '0o' },
          { base: 'BIN' as ProgrammerBase, val: reps.bin, prefix: '' },
        ].map((item) => {
          const isSelected = activeBase === item.base;
          return (
            <button
              key={item.base}
              onClick={() => handleBaseChange(item.base)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'border-transparent hover:border-slate-800 hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              <span className="text-xs font-semibold tracking-wider text-slate-400">
                {item.base}
              </span>
              <span
                className={`text-sm tracking-wide font-mono truncate max-w-[80%] ${
                  isSelected ? 'text-cyan-300 font-bold' : 'text-slate-300'
                }`}
              >
                {item.prefix}{item.val}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive 64/32/16/8-Bit Binary Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span>BIT INSPECTOR ({wordSize} BITS)</span>
          <span className="text-cyan-400 text-[10px]">CLICK TO TOGGLE BIT</span>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
          {Array.from({ length: wordSize }).map((_, idx) => {
            const bitIndex = wordSize - 1 - idx;
            const active = isBitSet(currentValue, bitIndex);
            return (
              <button
                key={bitIndex}
                onClick={() => handleBitClick(bitIndex)}
                title={`Bit ${bitIndex}: ${active ? '1' : '0'}`}
                className={`h-7 text-[10px] font-mono rounded flex flex-col items-center justify-center border transition-all ${
                  active
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <span>{active ? '1' : '0'}</span>
                <span className="text-[8px] opacity-50">{bitIndex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bitwise Operations & Keypad */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* Bitwise Ops Row 1 */}
        <button
          onClick={() => handleBitwiseOp('AND')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          AND
        </button>
        <button
          onClick={() => handleBitwiseOp('OR')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          OR
        </button>
        <button
          onClick={() => handleBitwiseOp('XOR')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          XOR
        </button>
        <button
          onClick={() => handleBitwiseOp('NOT')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          NOT
        </button>
        <button
          onClick={handleClear}
          className={`${baseKey} border-rose-500/30 bg-rose-950/20 text-rose-300 h-10 sm:h-11 font-bold`}
        >
          AC
        </button>

        {/* Bitwise Ops Row 2 */}
        <button
          onClick={() => handleBitwiseOp('NAND')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          NAND
        </button>
        <button
          onClick={() => handleBitwiseOp('NOR')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          NOR
        </button>
        <button
          onClick={() => handleBitwiseOp('LSH')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          &lt;&lt; LSH
        </button>
        <button
          onClick={() => handleBitwiseOp('RSH')}
          className={`${baseKey} border-purple-500/30 bg-purple-950/20 text-purple-300 h-10 sm:h-11`}
        >
          &gt;&gt; RSH
        </button>
        <button
          onClick={handleBackspace}
          className={`${baseKey} border-rose-500/30 bg-rose-950/20 text-rose-300 h-10 sm:h-11 font-bold`}
        >
          ⌫
        </button>

        {/* Hex A-B + 7-8-9 */}
        <button
          disabled={isKeyDisabled('A')}
          onClick={() => handleDigitInput('A')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-cyan-400 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          A
        </button>
        <button
          disabled={isKeyDisabled('B')}
          onClick={() => handleDigitInput('B')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-cyan-400 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          B
        </button>
        <button
          disabled={isKeyDisabled('7')}
          onClick={() => handleDigitInput('7')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          7
        </button>
        <button
          disabled={isKeyDisabled('8')}
          onClick={() => handleDigitInput('8')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          8
        </button>
        <button
          disabled={isKeyDisabled('9')}
          onClick={() => handleDigitInput('9')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          9
        </button>

        {/* Hex C-D + 4-5-6 */}
        <button
          disabled={isKeyDisabled('C')}
          onClick={() => handleDigitInput('C')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-cyan-400 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          C
        </button>
        <button
          disabled={isKeyDisabled('D')}
          onClick={() => handleDigitInput('D')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-cyan-400 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          D
        </button>
        <button
          disabled={isKeyDisabled('4')}
          onClick={() => handleDigitInput('4')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          4
        </button>
        <button
          disabled={isKeyDisabled('5')}
          onClick={() => handleDigitInput('5')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          5
        </button>
        <button
          disabled={isKeyDisabled('6')}
          onClick={() => handleDigitInput('6')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          6
        </button>

        {/* Hex E-F + 1-2-3 */}
        <button
          disabled={isKeyDisabled('E')}
          onClick={() => handleDigitInput('E')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-cyan-400 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          E
        </button>
        <button
          disabled={isKeyDisabled('F')}
          onClick={() => handleDigitInput('F')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-cyan-400 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          F
        </button>
        <button
          disabled={isKeyDisabled('1')}
          onClick={() => handleDigitInput('1')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          1
        </button>
        <button
          disabled={isKeyDisabled('2')}
          onClick={() => handleDigitInput('2')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          2
        </button>
        <button
          disabled={isKeyDisabled('3')}
          onClick={() => handleDigitInput('3')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          3
        </button>

        {/* Bottom Row: RoL, RoR, 0, Arithmetic Op, Equals */}
        <button
          onClick={() => handleBitwiseOp('RoL')}
          className={`${baseKey} border-slate-800 bg-slate-900/60 text-slate-300 h-11 sm:h-12`}
        >
          RoL
        </button>
        <button
          onClick={() => handleBitwiseOp('RoR')}
          className={`${baseKey} border-slate-800 bg-slate-900/60 text-slate-300 h-11 sm:h-12`}
        >
          RoR
        </button>
        <button
          disabled={isKeyDisabled('0')}
          onClick={() => handleDigitInput('0')}
          className={`${baseKey} border-slate-800 bg-slate-900/80 text-slate-100 h-11 sm:h-12`}
        >
          0
        </button>
        <button
          onClick={() => handleBitwiseOp('+')}
          className={`${baseKey} border-cyan-500/30 bg-cyan-950/20 text-cyan-300 h-11 sm:h-12`}
        >
          +
        </button>
        <button
          onClick={handleEquals}
          className={`${baseKey} border-cyan-400 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 h-11 sm:h-12 shadow-[0_0_15px_rgba(6,182,212,0.5)]`}
        >
          =
        </button>
      </div>
    </div>
  );
}
