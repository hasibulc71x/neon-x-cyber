import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Display } from './components/Display';
import { KeypadStandard } from './components/KeypadStandard';
import { KeypadScientific } from './components/KeypadScientific';
import { ProgrammerView } from './components/ProgrammerView';
import { EeeEngineerView } from './components/EeeEngineerView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { CyberCanvas } from './components/CyberCanvas';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  CalculatorMode,
  HistoryItem,
  MemoryState,
  Settings,
} from './types/calculator';
import { evaluateExpression, formatResult } from './utils/mathEngine';
import { playCyberSound } from './utils/audioSynth';
import { THEMES } from './utils/themes';

const DEFAULT_SETTINGS: Settings = {
  precision: 8,
  angleUnit: 'DEG',
  soundEnabled: true,
  soundVolume: 50,
  animations: true,
  scanlines: true,
  theme: 'cyber-cyan',
};

export default function App() {
  // 1. Settings state with LocalStorage persistence
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('neon_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neon_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // 2. Active Mode
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('standard');

  // 3. Calculator State
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [lastCalculated, setLastCalculated] = useState<boolean>(false);

  // 4. Memory State
  const [memory, setMemory] = useState<MemoryState>(() => {
    try {
      const saved = localStorage.getItem('neon_memory');
      return saved ? JSON.parse(saved) : { value: 0, hasMemory: false };
    } catch {
      return { value: 0, hasMemory: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neon_memory', JSON.stringify(memory));
    } catch {
      // Ignore
    }
  }, [memory]);

  // 5. History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('neon_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neon_history', JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // 6. Drawers / Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // 7. PWA / Android installation hook
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const activeTheme = THEMES[settings.theme] || THEMES['cyber-cyan'];

  const playSound = useCallback(
    (type: any) => {
      playCyberSound(type, settings.soundEnabled, settings.soundVolume);
    },
    [settings.soundEnabled, settings.soundVolume]
  );

  // Input Character
  const handleInput = useCallback(
    (char: string) => {
      playSound('number');
      setError(null);

      // If user typed right after calculation:
      // If it's an operator, chain with previous result.
      // If it's a number, start fresh.
      if (lastCalculated) {
        setLastCalculated(false);
        if ('+-*/^%'.includes(char)) {
          setExpression(result + char);
          return;
        } else {
          setExpression(char);
          return;
        }
      }

      setExpression((prev) => prev + char);
    },
    [lastCalculated, playSound, result]
  );

  // Insert Function (e.g., sin, cos, sqrt)
  const handleInsertFunction = useCallback(
    (fn: string) => {
      playSound('function');
      setError(null);
      setLastCalculated(false);

      if (fn === '10^') {
        setExpression((prev) => prev + '10^(');
      } else if (fn === '1/') {
        setExpression((prev) => prev + '1/(');
      } else {
        setExpression((prev) => prev + `${fn}(`);
      }
    },
    [playSound]
  );

  // Backspace
  const handleBackspace = useCallback(() => {
    playSound('backspace');
    setError(null);
    setLastCalculated(false);
    setExpression((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
  }, [playSound]);

  // Clear All
  const handleClear = useCallback(() => {
    playSound('clear');
    setExpression('');
    setResult('0');
    setError(null);
    setLastCalculated(false);
  }, [playSound]);

  // Calculate & Record in History
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const evalRes = evaluateExpression(
      expression,
      settings.angleUnit,
      settings.precision
    );

    if (evalRes.success && typeof evalRes.value === 'number') {
      playSound('enter');
      const formatted = evalRes.formatted || String(evalRes.value);
      setResult(formatted);
      setError(null);
      setLastCalculated(true);

      // Add to history
      const newEntry: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        expression,
        result: formatted,
        timestamp: Date.now(),
        mode: currentMode,
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 49)]); // Keep last 50
    } else {
      playSound('error');
      setError(evalRes.error || 'Calculation error');
    }
  }, [expression, settings.angleUnit, settings.precision, playSound, currentMode]);

  // Immediate square, sqrt, reciprocal, negate
  const handleSquare = useCallback(() => {
    playSound('function');
    setExpression((prev) => (prev ? `(${prev})^2` : '0^2'));
  }, [playSound]);

  const handleSquareRoot = useCallback(() => {
    playSound('function');
    setExpression((prev) => (prev ? `sqrt(${prev})` : 'sqrt('));
  }, [playSound]);

  const handleReciprocal = useCallback(() => {
    playSound('function');
    setExpression((prev) => (prev ? `1/(${prev})` : '1/('));
  }, [playSound]);

  const handleNegate = useCallback(() => {
    playSound('operator');
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-')) return prev.slice(1);
      return `-${prev}`;
    });
  }, [playSound]);

  const handlePercent = useCallback(() => {
    playSound('operator');
    setExpression((prev) => (prev ? `${prev}%` : ''));
  }, [playSound]);

  // Memory Handlers
  const handleMemoryAdd = useCallback(() => {
    playSound('function');
    const val = parseFloat(result) || 0;
    setMemory((prev) => ({
      value: prev.value + val,
      hasMemory: true,
    }));
  }, [playSound, result]);

  const handleMemorySubtract = useCallback(() => {
    playSound('function');
    const val = parseFloat(result) || 0;
    setMemory((prev) => ({
      value: prev.value - val,
      hasMemory: true,
    }));
  }, [playSound, result]);

  const handleMemoryRecall = useCallback(() => {
    playSound('function');
    setExpression((prev) => prev + String(memory.value));
  }, [memory.value, playSound]);

  const handleMemoryClear = useCallback(() => {
    playSound('clear');
    setMemory({ value: 0, hasMemory: false });
  }, [playSound]);

  const handleToggleAngleUnit = useCallback(() => {
    playSound('toggle');
    setSettings((prev) => ({
      ...prev,
      angleUnit: prev.angleUnit === 'DEG' ? 'RAD' : 'DEG',
    }));
  }, [playSound]);

  // Hardware Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or select
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('-');
      } else if (e.key === '*') {
        handleInput('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('/');
      } else if (e.key === '%') {
        handleInput('%');
      } else if (e.key === '^') {
        handleInput('^');
      } else if (e.key === '(' || e.key === ')') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleBackspace, handleClear]);

  return (
    <div className="relative min-h-screen bg-[#02050c] text-slate-100 flex flex-col font-chakra selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Cyberpunk Quantum Particle Canvas */}
      <CyberCanvas
        animationsEnabled={settings.animations}
        accentHex={activeTheme.accentHex}
      />

      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          playSound('mode');
          setCurrentMode(mode);
        }}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
        historyCount={history.length}
        onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onOpenDrive={() => setIsDriveModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {/* Standard or Scientific Calculator Card */}
        {(currentMode === 'standard' || currentMode === 'scientific') && (
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl transition-all duration-300">
            {/* Display */}
            <Display
              expression={expression}
              result={result}
              error={error}
              angleUnit={settings.angleUnit}
              onToggleAngleUnit={handleToggleAngleUnit}
              hasMemory={memory.hasMemory}
              memoryValue={memory.value}
              onRecallMemory={handleMemoryRecall}
              onClearMemory={handleMemoryClear}
              onBackspace={handleBackspace}
              onClear={handleClear}
              themeColors={activeTheme.colors}
              scanlines={settings.scanlines}
            />

            {/* Keypad Container */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${activeTheme.colors.border} bg-[#040814]/90 backdrop-blur-md shadow-2xl transition-colors`}
            >
              {currentMode === 'standard' ? (
                <KeypadStandard
                  onInput={handleInput}
                  onClear={handleClear}
                  onBackspace={handleBackspace}
                  onCalculate={handleCalculate}
                  onSquare={handleSquare}
                  onSquareRoot={handleSquareRoot}
                  onReciprocal={handleReciprocal}
                  onNegate={handleNegate}
                  onPercent={handlePercent}
                  onMemoryAdd={handleMemoryAdd}
                  onMemorySubtract={handleMemorySubtract}
                  onMemoryRecall={handleMemoryRecall}
                  onMemoryClear={handleMemoryClear}
                  themeColors={activeTheme.colors}
                />
              ) : (
                <KeypadScientific
                  onInput={handleInput}
                  onInsertFunction={handleInsertFunction}
                  onClear={handleClear}
                  onBackspace={handleBackspace}
                  onCalculate={handleCalculate}
                  onNegate={handleNegate}
                  angleUnit={settings.angleUnit}
                  onToggleAngleUnit={handleToggleAngleUnit}
                  themeColors={activeTheme.colors}
                />
              )}
            </div>
          </div>
        )}

        {/* Programmer Mode View */}
        {currentMode === 'programmer' && (
          <div className="w-full max-w-2xl">
            <ProgrammerView
              themeColors={activeTheme.colors}
              onPlaySound={playSound}
            />
          </div>
        )}

        {/* EEE Engineering Mode View */}
        {currentMode === 'eee' && (
          <div className="w-full max-w-5xl">
            <EeeEngineerView
              themeColors={activeTheme.colors}
              onPlaySound={playSound}
            />
          </div>
        )}
      </main>

      {/* Terminal History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={(item) => {
          playSound('function');
          setExpression(item.expression);
          setResult(item.result);
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => {
          playSound('clear');
          setHistory([]);
        }}
        onOpenDrive={() => setIsDriveModalOpen(true)}
        themeColors={activeTheme.colors}
      />

      {/* Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetDefaults={() => {
          playSound('clear');
          setSettings(DEFAULT_SETTINGS);
        }}
      />

      {/* Android Mobile & APK Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={install}
      />

      {/* Google Drive Cloud Sync Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        history={history}
        onImportCalculation={(expr, res) => {
          setExpression(expr);
          setResult(res);
          setIsDriveModalOpen(false);
        }}
      />

      {/* Futuristic Telemetry Footer */}
      <Footer
        currentMode={currentMode}
        precision={settings.precision}
        hasMemory={memory.hasMemory}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
}
