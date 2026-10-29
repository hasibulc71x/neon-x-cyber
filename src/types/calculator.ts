export type ThemeName = 'cyber-cyan' | 'neon-magenta' | 'toxic-green' | 'amber-runner' | 'titanium';

export type CalculatorMode = 'standard' | 'scientific' | 'programmer' | 'eee';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode: CalculatorMode;
}

export interface MemoryState {
  value: number;
  hasMemory: boolean;
}

export interface Settings {
  precision: number;
  angleUnit: 'DEG' | 'RAD';
  soundEnabled: boolean;
  soundVolume: number;
  animations: boolean;
  scanlines: boolean;
  theme: ThemeName;
}

export type ProgrammerBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';
export type ProgrammerWordSize = 8 | 16 | 32 | 64; // BYTE, WORD, DWORD, QWORD

export type EeeCategory = 
  | 'ohms-power'
  | 'energy-cost'
  | 'ac-rlc'
  | 'series-parallel'
  | 'three-phase'
  | 'transformer'
  | 'frequency'
  | 'star-delta'
  | 'unit-converter';

export interface ThemeColors {
  primary: string;
  primaryGlow: string;
  accent: string;
  border: string;
  bgPanel: string;
  bgKey: string;
  bgKeyHover: string;
  textBright: string;
  textMuted: string;
  badge: string;
  badgeText: string;
}
