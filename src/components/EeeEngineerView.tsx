import { useState } from 'react';
import {
  Zap,
  Activity,
  Layers,
  Repeat,
  RotateCw,
  Sliders,
  DollarSign,
  ArrowRightLeft,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  solveOhmsLawAndPower,
  solveEnergyConsumption,
  solveAcRlcCircuit,
  solveSeriesParallel,
  solveThreePhasePower,
  solveTransformer,
  solveFrequencyAndPeriod,
  solveStarToDelta,
  solveDeltaToStar,
  ENGINEERING_UNITS,
  convertEngineeringUnit,
  CalculationResult,
} from '../utils/eeeCalculators';
import { EeeCategory, ThemeColors } from '../types/calculator';

interface EeeEngineerViewProps {
  themeColors: ThemeColors;
  onPlaySound: (type: any) => void;
}

export function EeeEngineerView({ themeColors, onPlaySound }: EeeEngineerViewProps) {
  const [activeTab, setActiveTab] = useState<EeeCategory>('ohms-power');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // 1. Ohm's Law State
  const [ohmV, setOhmV] = useState<string>('230');
  const [ohmI, setOhmI] = useState<string>('5');
  const [ohmR, setOhmR] = useState<string>('');
  const [ohmP, setOhmP] = useState<string>('');

  // 2. Energy Consumption State
  const [powerW, setPowerW] = useState<string>('1500');
  const [hoursPerDay, setHoursPerDay] = useState<string>('4');
  const [daysCount, setDaysCount] = useState<string>('30');
  const [tariffRate, setTariffRate] = useState<string>('0.15');

  // 3. AC & RLC Circuit State
  const [acFreq, setAcFreq] = useState<string>('50');
  const [acR, setAcR] = useState<string>('10');
  const [acL, setAcL] = useState<string>('0.05'); // 50mH
  const [acC, setAcC] = useState<string>('0.0001'); // 100uF

  // 4. Series/Parallel Component List
  const [netType, setNetType] = useState<'resistor' | 'capacitor' | 'inductor'>('resistor');
  const [netComponents, setNetComponents] = useState<string[]>(['100', '220', '470']);

  // 5. Three-Phase State
  const [tpVLine, setTpVLine] = useState<string>('400');
  const [tpILine, setTpILine] = useState<string>('15');
  const [tpPf, setTpPf] = useState<string>('0.85');
  const [tpConfig, setTpConfig] = useState<'Star' | 'Delta'>('Star');

  // 6. Transformer State
  const [transVp, setTransVp] = useState<string>('240');
  const [transNp, setTransNp] = useState<string>('1000');
  const [transNs, setTransNs] = useState<string>('100');
  const [transPin, setTransPin] = useState<string>('1200');
  const [transPout, setTransPout] = useState<string>('1140');

  // 7. Frequency & Period
  const [freqVal, setFreqVal] = useState<string>('60');

  // 8. Star-Delta State
  const [sdMode, setSdMode] = useState<'starToDelta' | 'deltaToStar'>('starToDelta');
  const [sdR1, setSdR1] = useState<string>('10');
  const [sdR2, setSdR2] = useState<string>('20');
  const [sdR3, setSdR3] = useState<string>('30');

  // 9. Unit Converter State
  const [unitGroupIdx, setUnitGroupIdx] = useState<number>(0);
  const [unitInputVal, setUnitInputVal] = useState<string>('1');
  const [unitFromIdx, setUnitFromIdx] = useState<number>(2);
  const [unitToIdx, setUnitToIdx] = useState<number>(3);

  const categories: { id: EeeCategory; label: string; icon: any }[] = [
    { id: 'ohms-power', label: "Ohm's & Power", icon: Zap },
    { id: 'energy-cost', label: 'Energy & Cost', icon: DollarSign },
    { id: 'ac-rlc', label: 'AC & RLC Circuit', icon: Activity },
    { id: 'series-parallel', label: 'Series / Parallel', icon: Layers },
    { id: 'three-phase', label: '3-Phase Power', icon: Sliders },
    { id: 'transformer', label: 'Transformer', icon: Repeat },
    { id: 'frequency', label: 'Freq & Period', icon: RotateCw },
    { id: 'star-delta', label: 'Star-Delta (Y-Δ)', icon: ArrowRightLeft },
    { id: 'unit-converter', label: 'Unit Converter', icon: Sliders },
  ];

  // Calculation computation with safe fallback
  const renderCalculationSteps = (calc: CalculationResult) => (
    <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
      <div className="text-xs font-mono text-slate-400 font-semibold tracking-wider">
        CALCULATION METHODOLOGY & STEPS
      </div>
      <div className="grid gap-2">
        {calc.steps.map((st, i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
          >
            <div>
              <div className="text-slate-200 font-medium">{st.step}</div>
              <div className="text-slate-400 text-[11px]">{st.formula} → {st.substitution}</div>
            </div>
            <div className="text-cyan-300 font-bold self-end sm:self-auto text-sm shrink-0">
              {st.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                onPlaySound('toggle');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Solvers Content */}
      <div className="rounded-2xl border border-slate-800 bg-[#040814]/90 p-4 sm:p-6 shadow-xl font-chakra">
        {/* TAB 1: Ohm's Law & Power */}
        {activeTab === 'ohms-power' && (() => {
          let calcResult: CalculationResult;
          try {
            calcResult = solveOhmsLawAndPower(
              ohmV ? parseFloat(ohmV) : undefined,
              ohmI ? parseFloat(ohmI) : undefined,
              ohmR ? parseFloat(ohmR) : undefined,
              ohmP ? parseFloat(ohmP) : undefined
            );
          } catch (e: any) {
            calcResult = {
              values: {},
              steps: [{ step: 'Error', formula: '', substitution: '', result: e.message }],
              formulaSummary: '',
            };
          }

          return (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Ohm’s Law & Electrical Power Solver
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input any 2 parameters. The remaining 2 are computed automatically.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg hidden sm:block">
                  V = I × R | P = V × I
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Voltage (V) [Volts]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={ohmV}
                    onChange={(e) => setOhmV(e.target.value)}
                    placeholder="e.g. 230"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Current (I) [Amperes]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={ohmI}
                    onChange={(e) => setOhmI(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Resistance (R) [Ohms Ω]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={ohmR}
                    onChange={(e) => setOhmR(e.target.value)}
                    placeholder="e.g. 46"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Power (P) [Watts]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={ohmP}
                    onChange={(e) => setOhmP(e.target.value)}
                    placeholder="e.g. 1150"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Calculated Results Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Voltage', val: calcResult.values.voltage, unit: 'V' },
                  { label: 'Current', val: calcResult.values.current, unit: 'A' },
                  { label: 'Resistance', val: calcResult.values.resistance, unit: 'Ω' },
                  { label: 'Power', val: calcResult.values.power, unit: 'W' },
                ].map((item, idx) => {
                  const formatted =
                    typeof item.val === 'number' ? item.val.toFixed(3) : item.val || '—';
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>{item.label}</span>
                        <button
                          onClick={() => handleCopy(`ohm-${idx}`, `${formatted} ${item.unit}`)}
                          className="text-slate-500 hover:text-cyan-300"
                          title="Copy value"
                        >
                          {copiedKey === `ohm-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                        {formatted}{' '}
                        <span className="text-xs text-cyan-400 font-normal">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 2: Electricity Energy & Cost */}
        {activeTab === 'energy-cost' && (() => {
          let calcResult: CalculationResult;
          try {
            calcResult = solveEnergyConsumption(
              parseFloat(powerW) || 0,
              parseFloat(hoursPerDay) || 0,
              parseFloat(daysCount) || 30,
              parseFloat(tariffRate) || 0.15
            );
          } catch (e: any) {
            calcResult = {
              values: {},
              steps: [{ step: 'Error', formula: '', substitution: '', result: e.message }],
              formulaSummary: '',
            };
          }

          return (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Electrical Energy & Consumption Cost (kWh)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculate power consumption in kilowatt-hours and financial cost for appliances.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Appliance Power (Watts)
                  </label>
                  <input
                    type="number"
                    value={powerW}
                    onChange={(e) => setPowerW(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Operating Hours / Day
                  </label>
                  <input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    value={daysCount}
                    onChange={(e) => setDaysCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Tariff Rate ($ / kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tariffRate}
                    onChange={(e) => setTariffRate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Daily Energy</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {Number(calcResult.values.energyKwhPerDay || 0).toFixed(2)}{' '}
                    <span className="text-xs text-cyan-400 font-normal">kWh/day</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Total Energy ({daysCount}d)</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {Number(calcResult.values.totalEnergyKwh || 0).toFixed(2)}{' '}
                    <span className="text-xs text-cyan-400 font-normal">kWh</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Period Cost</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    ${Number(calcResult.values.totalCost || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Estimated Annual</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    ${Number(calcResult.values.yearlyCost || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 3: AC Circuit & RLC Resonance */}
        {activeTab === 'ac-rlc' && (() => {
          let calcResult: CalculationResult;
          try {
            calcResult = solveAcRlcCircuit(
              parseFloat(acFreq) || 50,
              parseFloat(acR) || 0,
              parseFloat(acL) || 0,
              parseFloat(acC) || 0
            );
          } catch (e: any) {
            calcResult = {
              values: {},
              steps: [{ step: 'Error', formula: '', substitution: '', result: e.message }],
              formulaSummary: '',
            };
          }

          return (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    AC Circuit Impedance, Reactance & RLC Resonance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Solves inductive & capacitive reactance, impedance Z, phase angle, and resonance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Frequency (f) [Hz]
                  </label>
                  <input
                    type="number"
                    value={acFreq}
                    onChange={(e) => setAcFreq(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Resistance (R) [Ω]
                  </label>
                  <input
                    type="number"
                    value={acR}
                    onChange={(e) => setAcR(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Inductance (L) [Henries]
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={acL}
                    onChange={(e) => setAcL(e.target.value)}
                    placeholder="e.g. 0.05 (50mH)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Capacitance (C) [Farads]
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={acC}
                    onChange={(e) => setAcC(e.target.value)}
                    placeholder="e.g. 0.0001 (100µF)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* RLC Results Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Inductive Reactance (X_L)</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {Number(calcResult.values.xl || 0).toFixed(2)}{' '}
                    <span className="text-xs text-cyan-400 font-normal">Ω</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Capacitive Reactance (X_C)</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {Number(calcResult.values.xc || 0).toFixed(2)}{' '}
                    <span className="text-xs text-cyan-400 font-normal">Ω</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Impedance (Z) & Phase</div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                    {Number(calcResult.values.impedanceZ || 0).toFixed(2)}{' '}
                    <span className="text-xs text-cyan-400 font-normal">Ω ∠{Number(calcResult.values.phaseDeg || 0).toFixed(1)}°</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Resonant Frequency (f₀)</div>
                  <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                    {Number(calcResult.values.fResonant || 0).toFixed(2)}{' '}
                    <span className="text-xs text-purple-400 font-normal">Hz</span>
                  </div>
                </div>
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 4: Series & Parallel Network */}
        {activeTab === 'series-parallel' && (() => {
          const numericVals = netComponents.map((v) => parseFloat(v)).filter((v) => !isNaN(v));
          const netRes = solveSeriesParallel(netType, numericVals);
          const unit = netType === 'resistor' ? 'Ω' : netType === 'capacitor' ? 'F' : 'H';

          return (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Series & Parallel Component Network
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add components dynamically to evaluate total series and parallel equivalent values.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['resistor', 'capacitor', 'inductor'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNetType(t)}
                      className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                        netType === t
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Components Input List */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>NETWORK COMPONENTS ({netComponents.length})</span>
                  <button
                    onClick={() => setNetComponents([...netComponents, '100'])}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Component
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {netComponents.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => {
                            const copy = [...netComponents];
                            copy[idx] = e.target.value;
                            setNetComponents(copy);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                          placeholder={`Value ${idx + 1}`}
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-slate-500 font-mono">
                          {unit}
                        </span>
                      </div>
                      {netComponents.length > 1 && (
                        <button
                          onClick={() => setNetComponents(netComponents.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">
                      Equivalent In Series ({netType === 'resistor' ? 'R_s' : netType === 'capacitor' ? 'C_s' : 'L_s'})
                    </div>
                    <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                      {netRes.series.toFixed(4)}{' '}
                      <span className="text-sm font-normal text-slate-400">{unit}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('net-ser', `${netRes.series.toFixed(4)} ${unit}`)}
                    className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-300"
                  >
                    {copiedKey === 'net-ser' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">
                      Equivalent In Parallel ({netType === 'resistor' ? 'R_p' : netType === 'capacitor' ? 'C_p' : 'L_p'})
                    </div>
                    <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                      {netRes.parallel.toFixed(4)}{' '}
                      <span className="text-sm font-normal text-slate-400">{unit}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('net-par', `${netRes.parallel.toFixed(4)} ${unit}`)}
                    className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-300"
                  >
                    {copiedKey === 'net-par' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {renderCalculationSteps({
                values: {},
                steps: netRes.steps,
                formulaSummary: '',
              })}
            </div>
          );
        })()}

        {/* TAB 5: Three-Phase Power */}
        {activeTab === 'three-phase' && (() => {
          let calcResult: CalculationResult;
          try {
            calcResult = solveThreePhasePower(
              parseFloat(tpVLine) || 400,
              parseFloat(tpILine) || 10,
              parseFloat(tpPf) || 0.85,
              tpConfig
            );
          } catch (e: any) {
            calcResult = {
              values: {},
              steps: [{ step: 'Error', formula: '', substitution: '', result: e.message }],
              formulaSummary: '',
            };
          }

          return (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Three-Phase Power Calculator (Star / Delta)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculates Active Power P (kW), Reactive Power Q (kVAR), and Apparent Power S (kVA).
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['Star', 'Delta'] as const).map((cfg) => (
                    <button
                      key={cfg}
                      onClick={() => setTpConfig(cfg)}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        tpConfig === cfg
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cfg} (Y / Δ)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Line Voltage (V_L) [Volts]
                  </label>
                  <input
                    type="number"
                    value={tpVLine}
                    onChange={(e) => setTpVLine(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Line Current (I_L) [Amperes]
                  </label>
                  <input
                    type="number"
                    value={tpILine}
                    onChange={(e) => setTpILine(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Power Factor (cos φ) [0 to 1]
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={tpPf}
                    onChange={(e) => setTpPf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>
              </div>

              {/* Three-Phase Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Active Power (P)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {(Number(calcResult.values.activePowerW || 0) / 1000).toFixed(3)}{' '}
                    <span className="text-xs text-slate-400 font-normal">kW</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Apparent Power (S)</div>
                  <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                    {(Number(calcResult.values.apparentPowerVA || 0) / 1000).toFixed(3)}{' '}
                    <span className="text-xs text-slate-400 font-normal">kVA</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Reactive Power (Q)</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {(Number(calcResult.values.reactivePowerVAR || 0) / 1000).toFixed(3)}{' '}
                    <span className="text-xs text-slate-400 font-normal">kVAR</span>
                  </div>
                </div>
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 6: Transformer Turns Ratio & Efficiency */}
        {activeTab === 'transformer' && (() => {
          let calcResult: CalculationResult;
          try {
            calcResult = solveTransformer(
              parseFloat(transVp) || 240,
              parseFloat(transNp) || 1000,
              parseFloat(transNs) || 100,
              parseFloat(transPin) || 1000,
              parseFloat(transPout) || 950
            );
          } catch (e: any) {
            calcResult = {
              values: {},
              steps: [{ step: 'Error', formula: '', substitution: '', result: e.message }],
              formulaSummary: '',
            };
          }

          return (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-cyan-400" />
                    Transformer Turns Ratio & Efficiency Solver
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluates transformation ratio, secondary voltage, power losses, and % efficiency.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    V_Primary (V)
                  </label>
                  <input
                    type="number"
                    value={transVp}
                    onChange={(e) => setTransVp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    N_Primary (Turns)
                  </label>
                  <input
                    type="number"
                    value={transNp}
                    onChange={(e) => setTransNp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    N_Secondary (Turns)
                  </label>
                  <input
                    type="number"
                    value={transNs}
                    onChange={(e) => setTransNs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Input Power (W)
                  </label>
                  <input
                    type="number"
                    value={transPin}
                    onChange={(e) => setTransPin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Output Power (W)
                  </label>
                  <input
                    type="number"
                    value={transPout}
                    onChange={(e) => setTransPout(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Turns Ratio (a)</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {Number(calcResult.values.turnsRatio || 0).toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Secondary Voltage</div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                    {Number(calcResult.values.vSecondary || 0).toFixed(2)}{' '}
                    <span className="text-xs text-slate-400">V</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Losses</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {Number(calcResult.values.losses || 0).toFixed(2)}{' '}
                    <span className="text-xs text-slate-400">W</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Efficiency (η)</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {Number(calcResult.values.efficiency || 0).toFixed(2)} %
                  </div>
                </div>
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 7: Frequency, Angular Frequency, and Period */}
        {activeTab === 'frequency' && (() => {
          const calcResult = solveFrequencyAndPeriod(parseFloat(freqVal) || 60);

          return (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-cyan-400" />
                    Frequency, Angular Frequency & Period Converter
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instant relationships between Hertz (f), Radians/sec (ω), and Time Period (T).
                  </p>
                </div>
              </div>

              <div className="max-w-xs mb-4">
                <label className="text-xs font-mono text-slate-300 mb-1 block">
                  Frequency (Hz)
                </label>
                <input
                  type="number"
                  value={freqVal}
                  onChange={(e) => setFreqVal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Frequency (f)</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {Number(calcResult.values.frequency).toFixed(2)} Hz
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Angular Frequency (ω)</div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                    {Number(calcResult.values.omega).toFixed(3)} rad/s
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-xs text-slate-400 font-mono">Time Period (T)</div>
                  <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                    {(Number(calcResult.values.period) * 1000).toFixed(4)} ms
                  </div>
                </div>
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 8: Star-Delta Transformation */}
        {activeTab === 'star-delta' && (() => {
          let calcResult: CalculationResult;
          try {
            if (sdMode === 'starToDelta') {
              calcResult = solveStarToDelta(
                parseFloat(sdR1) || 10,
                parseFloat(sdR2) || 20,
                parseFloat(sdR3) || 30
              );
            } else {
              calcResult = solveDeltaToStar(
                parseFloat(sdR1) || 10,
                parseFloat(sdR2) || 20,
                parseFloat(sdR3) || 30
              );
            }
          } catch (e: any) {
            calcResult = {
              values: {},
              steps: [{ step: 'Error', formula: '', substitution: '', result: e.message }],
              formulaSummary: '',
            };
          }

          return (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                    Star-Delta (Wye-Delta / Y-Δ) Conversion
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transform 3-terminal passive resistive networks between Star and Delta configurations.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setSdMode('starToDelta')}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      sdMode === 'starToDelta'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Star → Delta (Y → Δ)
                  </button>
                  <button
                    onClick={() => setSdMode('deltaToStar')}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      sdMode === 'deltaToStar'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Delta → Star (Δ → Y)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    {sdMode === 'starToDelta' ? 'R_a (Star leg A) [Ω]' : 'R_ab (Delta leg AB) [Ω]'}
                  </label>
                  <input
                    type="number"
                    value={sdR1}
                    onChange={(e) => setSdR1(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    {sdMode === 'starToDelta' ? 'R_b (Star leg B) [Ω]' : 'R_bc (Delta leg BC) [Ω]'}
                  </label>
                  <input
                    type="number"
                    value={sdR2}
                    onChange={(e) => setSdR2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    {sdMode === 'starToDelta' ? 'R_c (Star leg C) [Ω]' : 'R_ca (Delta leg CA) [Ω]'}
                  </label>
                  <input
                    type="number"
                    value={sdR3}
                    onChange={(e) => setSdR3(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>
              </div>

              {/* Conversion Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sdMode === 'starToDelta' ? (
                  <>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="text-xs text-slate-400 font-mono">Delta Resistor R_ab</div>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                        {Number(calcResult.values.rab || 0).toFixed(3)} Ω
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="text-xs text-slate-400 font-mono">Delta Resistor R_bc</div>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                        {Number(calcResult.values.rbc || 0).toFixed(3)} Ω
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="text-xs text-slate-400 font-mono">Delta Resistor R_ca</div>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                        {Number(calcResult.values.rca || 0).toFixed(3)} Ω
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="text-xs text-slate-400 font-mono">Star Resistor R_a</div>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                        {Number(calcResult.values.ra || 0).toFixed(3)} Ω
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="text-xs text-slate-400 font-mono">Star Resistor R_b</div>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                        {Number(calcResult.values.rb || 0).toFixed(3)} Ω
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="text-xs text-slate-400 font-mono">Star Resistor R_c</div>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                        {Number(calcResult.values.rc || 0).toFixed(3)} Ω
                      </div>
                    </div>
                  </>
                )}
              </div>

              {renderCalculationSteps(calcResult)}
            </div>
          );
        })()}

        {/* TAB 9: Engineering Unit Converter */}
        {activeTab === 'unit-converter' && (() => {
          const group = ENGINEERING_UNITS[unitGroupIdx] || ENGINEERING_UNITS[0];
          const fromUnit = group.units[unitFromIdx] || group.units[0];
          const toUnit = group.units[unitToIdx] || group.units[1] || group.units[0];

          const inputNum = parseFloat(unitInputVal) || 0;
          const convertedVal = convertEngineeringUnit(inputNum, fromUnit.factor, toUnit.factor);

          return (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Electrical Engineering Unit Converter
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-precision conversion across scientific prefixes (nano to giga).
                  </p>
                </div>
              </div>

              {/* Group Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {ENGINEERING_UNITS.map((g, idx) => (
                  <button
                    key={g.name}
                    onClick={() => {
                      setUnitGroupIdx(idx);
                      setUnitFromIdx(0);
                      setUnitToIdx(Math.min(1, g.units.length - 1));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-colors ${
                      unitGroupIdx === idx
                        ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {/* Conversion Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center mb-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    Input Value
                  </label>
                  <input
                    type="number"
                    value={unitInputVal}
                    onChange={(e) => setUnitInputVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    From Unit
                  </label>
                  <select
                    value={unitFromIdx}
                    onChange={(e) => setUnitFromIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono"
                  >
                    {group.units.map((u, i) => (
                      <option key={u.symbol} value={i}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">
                    To Unit
                  </label>
                  <select
                    value={unitToIdx}
                    onChange={(e) => setUnitToIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono"
                  >
                    {group.units.map((u, i) => (
                      <option key={u.symbol} value={i}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Display Output Card */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-950/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono">
                    {inputNum} {fromUnit.symbol} equals
                  </div>
                  <div className="text-3xl font-bold font-mono text-cyan-300 mt-1">
                    {convertedVal.toPrecision(8).replace(/\.?0+$/, '')}{' '}
                    <span className="text-lg text-slate-400 font-normal">{toUnit.symbol}</span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy('unit-res', `${convertedVal} ${toUnit.symbol}`)
                  }
                  className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-300"
                >
                  {copiedKey === 'unit-res' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
