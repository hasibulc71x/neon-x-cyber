/**
 * Electrical & Electronic Engineering (EEE) Calculation Engine
 * Comprehensive formulas, solvers, step-by-step explanations, and unit definitions.
 */

export interface StepExplanation {
  step: string;
  formula: string;
  substitution: string;
  result: string;
}

export interface CalculationResult {
  values: Record<string, number | string>;
  steps: StepExplanation[];
  formulaSummary: string;
}

// 1. Ohm's Law & Power Solver
// Takes any 2 parameters among (V, I, R, P) and solves for the remaining 2.
export function solveOhmsLawAndPower(
  v?: number,
  i?: number,
  r?: number,
  p?: number
): CalculationResult {
  const steps: StepExplanation[] = [];
  let calcV = v;
  let calcI = i;
  let calcR = r;
  let calcP = p;

  // Count provided valid values
  const hasV = typeof v === 'number' && !isNaN(v);
  const hasI = typeof i === 'number' && !isNaN(i);
  const hasR = typeof r === 'number' && !isNaN(r);
  const hasP = typeof p === 'number' && !isNaN(p);

  const count = [hasV, hasI, hasR, hasP].filter(Boolean).length;
  if (count < 2) {
    return {
      values: {},
      steps: [{ step: 'Input Check', formula: 'At least 2 variables required', substitution: '-', result: 'Please provide at least 2 known variables' }],
      formulaSummary: 'V = I × R | P = V × I = I² × R = V² / R',
    };
  }

  // Branch 1: Known V and I
  if (hasV && hasI) {
    if (calcI === 0) throw new Error('Current cannot be 0 for resistance calculation');
    calcR = calcV! / calcI!;
    calcP = calcV! * calcI!;
    steps.push({
      step: 'Calculate Resistance (R)',
      formula: 'R = V / I',
      substitution: `R = ${calcV} V / ${calcI} A`,
      result: `${calcR.toFixed(4)} Ω`,
    });
    steps.push({
      step: 'Calculate Electric Power (P)',
      formula: 'P = V × I',
      substitution: `P = ${calcV} V × ${calcI} A`,
      result: `${calcP.toFixed(4)} W`,
    });
  }
  // Branch 2: Known V and R
  else if (hasV && hasR) {
    if (calcR === 0) throw new Error('Resistance cannot be 0 Ω (Short Circuit)');
    calcI = calcV! / calcR!;
    calcP = (calcV! * calcV!) / calcR!;
    steps.push({
      step: 'Calculate Current (I)',
      formula: 'I = V / R',
      substitution: `I = ${calcV} V / ${calcR} Ω`,
      result: `${calcI.toFixed(4)} A`,
    });
    steps.push({
      step: 'Calculate Electric Power (P)',
      formula: 'P = V² / R',
      substitution: `P = (${calcV})² / ${calcR} Ω`,
      result: `${calcP.toFixed(4)} W`,
    });
  }
  // Branch 3: Known V and P
  else if (hasV && hasP) {
    if (calcV === 0) throw new Error('Voltage cannot be 0 V for current computation');
    calcI = calcP! / calcV!;
    calcR = (calcV! * calcV!) / calcP!;
    steps.push({
      step: 'Calculate Current (I)',
      formula: 'I = P / V',
      substitution: `I = ${calcP} W / ${calcV} V`,
      result: `${calcI.toFixed(4)} A`,
    });
    steps.push({
      step: 'Calculate Resistance (R)',
      formula: 'R = V² / P',
      substitution: `R = (${calcV})² / ${calcP} W`,
      result: `${calcR.toFixed(4)} Ω`,
    });
  }
  // Branch 4: Known I and R
  else if (hasI && hasR) {
    calcV = calcI! * calcR!;
    calcP = calcI! * calcI! * calcR!;
    steps.push({
      step: 'Calculate Voltage (V)',
      formula: 'V = I × R',
      substitution: `V = ${calcI} A × ${calcR} Ω`,
      result: `${calcV.toFixed(4)} V`,
    });
    steps.push({
      step: 'Calculate Electric Power (P)',
      formula: 'P = I² × R',
      substitution: `P = (${calcI})² × ${calcR} Ω`,
      result: `${calcP.toFixed(4)} W`,
    });
  }
  // Branch 5: Known I and P
  else if (hasI && hasP) {
    if (calcI === 0) throw new Error('Current cannot be 0 A');
    calcV = calcP! / calcI!;
    calcR = calcP! / (calcI! * calcI!);
    steps.push({
      step: 'Calculate Voltage (V)',
      formula: 'V = P / I',
      substitution: `V = ${calcP} W / ${calcI} A`,
      result: `${calcV.toFixed(4)} V`,
    });
    steps.push({
      step: 'Calculate Resistance (R)',
      formula: 'R = P / I²',
      substitution: `R = ${calcP} W / (${calcI})²`,
      result: `${calcR.toFixed(4)} Ω`,
    });
  }
  // Branch 6: Known R and P
  else if (hasR && hasP) {
    if (calcR! <= 0 || calcP! < 0) throw new Error('R and P must be positive');
    calcV = Math.sqrt(calcP! * calcR!);
    calcI = Math.sqrt(calcP! / calcR!);
    steps.push({
      step: 'Calculate Voltage (V)',
      formula: 'V = √(P × R)',
      substitution: `V = √(${calcP} × ${calcR})`,
      result: `${calcV.toFixed(4)} V`,
    });
    steps.push({
      step: 'Calculate Current (I)',
      formula: 'I = √(P / R)',
      substitution: `I = √(${calcP} / ${calcR})`,
      result: `${calcI.toFixed(4)} A`,
    });
  }

  return {
    values: {
      voltage: calcV!,
      current: calcI!,
      resistance: calcR!,
      power: calcP!,
    },
    steps,
    formulaSummary: 'V = I × R | P = V × I | P = I² × R | P = V² / R',
  };
}

// 2. Electrical Energy & Electricity Consumption
export function solveEnergyConsumption(
  powerWatts: number,
  hoursPerDay: number,
  days: number = 30,
  ratePerKwh: number = 0.15
): CalculationResult {
  const powerKw = powerWatts / 1000;
  const energyKwhPerDay = powerKw * hoursPerDay;
  const totalEnergyKwh = energyKwhPerDay * days;
  const totalCost = totalEnergyKwh * ratePerKwh;
  const yearlyCost = energyKwhPerDay * 365 * ratePerKwh;

  const steps: StepExplanation[] = [
    {
      step: 'Convert Power to Kilowatts (kW)',
      formula: 'P(kW) = P(W) / 1000',
      substitution: `${powerWatts} W / 1000`,
      result: `${powerKw.toFixed(4)} kW`,
    },
    {
      step: 'Daily Energy Consumption',
      formula: 'E_daily = P(kW) × Hours',
      substitution: `${powerKw.toFixed(4)} kW × ${hoursPerDay} hrs`,
      result: `${energyKwhPerDay.toFixed(4)} kWh / day`,
    },
    {
      step: 'Total Energy for Period',
      formula: 'E_total = E_daily × Days',
      substitution: `${energyKwhPerDay.toFixed(4)} kWh × ${days} days`,
      result: `${totalEnergyKwh.toFixed(4)} kWh`,
    },
    {
      step: 'Electricity Cost Calculation',
      formula: 'Cost = E_total × Rate',
      substitution: `${totalEnergyKwh.toFixed(4)} kWh × $${ratePerKwh}/kWh`,
      result: `$${totalCost.toFixed(2)} (Period) | $${yearlyCost.toFixed(2)} (Annual)`,
    },
  ];

  return {
    values: {
      powerKw,
      energyKwhPerDay,
      totalEnergyKwh,
      totalCost,
      yearlyCost,
    },
    steps,
    formulaSummary: 'Energy (kWh) = (Power in Watts × Hours) / 1000 | Cost = kWh × Tariff Rate',
  };
}

// 3. AC Circuit Impedance, Reactance & RLC Resonance
export function solveAcRlcCircuit(
  frequencyHz: number,
  rOhms: number,
  lHenries: number,
  cFarads: number
): CalculationResult {
  if (frequencyHz <= 0) throw new Error('Frequency must be > 0 Hz');
  if (cFarads <= 0) throw new Error('Capacitance must be > 0 F');
  if (lHenries < 0) throw new Error('Inductance cannot be negative');

  const omega = 2 * Math.PI * frequencyHz;
  const xl = omega * lHenries;
  const xc = 1 / (omega * cFarads);
  const netReactance = xl - xc;
  const impedanceZ = Math.sqrt(rOhms * rOhms + netReactance * netReactance);
  const phaseRad = Math.atan2(netReactance, rOhms);
  const phaseDeg = (phaseRad * 180) / Math.PI;

  // Resonance calculations
  const fResonant = 1 / (2 * Math.PI * Math.sqrt(lHenries * cFarads));
  const qualityFactorQ = rOhms > 0 ? (1 / rOhms) * Math.sqrt(lHenries / cFarads) : Infinity;
  const bandwidthHz = qualityFactorQ !== Infinity ? fResonant / qualityFactorQ : 0;
  const circuitNature = netReactance > 1e-6 ? 'Inductive (Current lags Voltage)' : netReactance < -1e-6 ? 'Capacitive (Current leads Voltage)' : 'Purely Resistive (In Phase)';

  const steps: StepExplanation[] = [
    {
      step: 'Angular Frequency (ω)',
      formula: 'ω = 2 × π × f',
      substitution: `2 × π × ${frequencyHz} Hz`,
      result: `${omega.toFixed(3)} rad/s`,
    },
    {
      step: 'Inductive Reactance (X_L)',
      formula: 'X_L = 2 × π × f × L = ω × L',
      substitution: `${omega.toFixed(2)} rad/s × ${lHenries} H`,
      result: `${xl.toFixed(4)} Ω`,
    },
    {
      step: 'Capacitive Reactance (X_C)',
      formula: 'X_C = 1 / (2 × π × f × C) = 1 / (ω × C)',
      substitution: `1 / (${omega.toFixed(2)} × ${cFarads} F)`,
      result: `${xc.toFixed(4)} Ω`,
    },
    {
      step: 'Total Impedance (Z)',
      formula: 'Z = √(R² + (X_L - X_C)²)',
      substitution: `√(${rOhms}² + (${xl.toFixed(2)} - ${xc.toFixed(2)})²)`,
      result: `${impedanceZ.toFixed(4)} Ω`,
    },
    {
      step: 'Phase Angle (φ)',
      formula: 'φ = arctan((X_L - X_C) / R)',
      substitution: `arctan((${netReactance.toFixed(2)}) / ${rOhms})`,
      result: `${phaseDeg.toFixed(2)}° (${circuitNature})`,
    },
    {
      step: 'Resonant Frequency (f₀)',
      formula: 'f₀ = 1 / (2 × π × √(L × C))',
      substitution: `1 / (2π × √(${lHenries} × ${cFarads}))`,
      result: `${fResonant.toFixed(3)} Hz`,
    },
    {
      step: 'Quality Factor (Q) & Bandwidth',
      formula: 'Q = (1/R) × √(L/C) | BW = f₀ / Q',
      substitution: `Q = ${qualityFactorQ.toFixed(3)} | BW = ${bandwidthHz.toFixed(3)} Hz`,
      result: `Q: ${qualityFactorQ.toFixed(2)}, BW: ${bandwidthHz.toFixed(2)} Hz`,
    },
  ];

  return {
    values: {
      omega,
      xl,
      xc,
      netReactance,
      impedanceZ,
      phaseDeg,
      circuitNature,
      fResonant,
      qualityFactorQ,
      bandwidthHz,
    },
    steps,
    formulaSummary: 'X_L = 2πfL | X_C = 1/(2πfC) | Z = √(R² + (X_L - X_C)²) | f₀ = 1/(2π√(LC))',
  };
}

// 4. Series and Parallel Resistor / Capacitor Network
export function solveSeriesParallel(
  type: 'resistor' | 'capacitor' | 'inductor',
  values: number[]
): { series: number; parallel: number; steps: StepExplanation[] } {
  const filtered = values.filter((v) => !isNaN(v) && v > 0);
  if (filtered.length === 0) {
    return { series: 0, parallel: 0, steps: [] };
  }

  const steps: StepExplanation[] = [];
  let series = 0;
  let parallel = 0;

  if (type === 'resistor' || type === 'inductor') {
    // Resistors and Inductors follow same rule
    // Series: R1 + R2 + ...
    series = filtered.reduce((acc, val) => acc + val, 0);
    // Parallel: 1 / (1/R1 + 1/R2 + ...)
    const sumInv = filtered.reduce((acc, val) => acc + 1 / val, 0);
    parallel = 1 / sumInv;

    const unit = type === 'resistor' ? 'Ω' : 'H';
    steps.push({
      step: `Series Equivalent (${type === 'resistor' ? 'R_eq' : 'L_eq'})`,
      formula: `${type === 'resistor' ? 'R_s' : 'L_s'} = ∑ R_i`,
      substitution: filtered.map((v) => `${v} ${unit}`).join(' + '),
      result: `${series.toFixed(4)} ${unit}`,
    });
    steps.push({
      step: `Parallel Equivalent (${type === 'resistor' ? 'R_eq' : 'L_eq'})`,
      formula: `1 / ${type === 'resistor' ? 'R_p' : 'L_p'} = ∑ (1 / R_i)`,
      substitution: `1 / (${filtered.map((v) => `1/${v}`).join(' + ')})`,
      result: `${parallel.toFixed(4)} ${unit}`,
    });
  } else {
    // Capacitors (opposite of resistors)
    // Series: 1 / (1/C1 + 1/C2 + ...)
    const sumInv = filtered.reduce((acc, val) => acc + 1 / val, 0);
    series = 1 / sumInv;
    // Parallel: C1 + C2 + ...
    parallel = filtered.reduce((acc, val) => acc + val, 0);

    steps.push({
      step: 'Series Capacitance (C_s)',
      formula: '1 / C_s = ∑ (1 / C_i)',
      substitution: `1 / (${filtered.map((v) => `1/${v}`).join(' + ')})`,
      result: `${series.toFixed(6)} F`,
    });
    steps.push({
      step: 'Parallel Capacitance (C_p)',
      formula: 'C_p = ∑ C_i',
      substitution: filtered.map((v) => `${v} F`).join(' + '),
      result: `${parallel.toFixed(6)} F`,
    });
  }

  return { series, parallel, steps };
}

// 5. Three-Phase Power Calculator
export function solveThreePhasePower(
  vLine: number,
  iLine: number,
  powerFactor: number, // 0 to 1
  systemConfig: 'Star' | 'Delta' = 'Star'
): CalculationResult {
  if (powerFactor < 0 || powerFactor > 1) {
    throw new Error('Power factor must be between 0 and 1');
  }

  // Active Power P = √3 × V_L × I_L × cos(φ)
  const activePowerW = Math.sqrt(3) * vLine * iLine * powerFactor;
  // Apparent Power S = √3 × V_L × I_L (VA)
  const apparentPowerVA = Math.sqrt(3) * vLine * iLine;
  // Reactive Power Q = √3 × V_L × I_L × sin(φ) (VAR)
  const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
  const reactivePowerVAR = Math.sqrt(3) * vLine * iLine * sinPhi;

  // Phase values
  let vPhase: number;
  let iPhase: number;

  if (systemConfig === 'Star') {
    vPhase = vLine / Math.sqrt(3);
    iPhase = iLine;
  } else {
    vPhase = vLine;
    iPhase = iLine / Math.sqrt(3);
  }

  const steps: StepExplanation[] = [
    {
      step: 'Apparent Power (S)',
      formula: 'S = √3 × V_L × I_L',
      substitution: `√3 × ${vLine} V × ${iLine} A`,
      result: `${(apparentPowerVA / 1000).toFixed(4)} kVA (${apparentPowerVA.toFixed(2)} VA)`,
    },
    {
      step: 'Active / Real Power (P)',
      formula: 'P = √3 × V_L × I_L × cos(φ)',
      substitution: `√3 × ${vLine} V × ${iLine} A × ${powerFactor}`,
      result: `${(activePowerW / 1000).toFixed(4)} kW (${activePowerW.toFixed(2)} W)`,
    },
    {
      step: 'Reactive Power (Q)',
      formula: 'Q = √3 × V_L × I_L × sin(φ)',
      substitution: `√3 × ${vLine} V × ${iLine} A × ${sinPhi.toFixed(4)}`,
      result: `${(reactivePowerVAR / 1000).toFixed(4)} kVAR (${reactivePowerVAR.toFixed(2)} VAR)`,
    },
    {
      step: `${systemConfig} Phase Relationships`,
      formula: systemConfig === 'Star' ? 'V_ph = V_L / √3 | I_ph = I_L' : 'V_ph = V_L | I_ph = I_L / √3',
      substitution: systemConfig === 'Star' ? `${vLine} / √3 V` : `${iLine} / √3 A`,
      result: `V_ph = ${vPhase.toFixed(2)} V | I_ph = ${iPhase.toFixed(2)} A`,
    },
  ];

  return {
    values: {
      activePowerW,
      apparentPowerVA,
      reactivePowerVAR,
      vPhase,
      iPhase,
      sinPhi,
    },
    steps,
    formulaSummary: 'P = √3 × V_L × I_L × cos(φ) | S = √3 × V_L × I_L | Q = √3 × V_L × I_L × sin(φ)',
  };
}

// 6. Transformer Turns Ratio & Efficiency
export function solveTransformer(
  vPrimary: number,
  nPrimary: number,
  nSecondary: number,
  pinWatts: number,
  poutWatts?: number,
  lossesWatts?: number
): CalculationResult {
  if (nPrimary <= 0 || nSecondary <= 0) {
    throw new Error('Number of turns must be > 0');
  }

  const turnsRatio = nPrimary / nSecondary; // Np / Ns
  const vSecondary = vPrimary / turnsRatio; // Vs = Vp * (Ns / Np)

  let calculatedPout = poutWatts;
  let calculatedLosses = lossesWatts;

  if (typeof calculatedPout === 'number' && !isNaN(calculatedPout)) {
    calculatedLosses = Math.max(0, pinWatts - calculatedPout);
  } else if (typeof calculatedLosses === 'number' && !isNaN(calculatedLosses)) {
    calculatedPout = Math.max(0, pinWatts - calculatedLosses);
  } else {
    calculatedLosses = 0;
    calculatedPout = pinWatts; // Ideal transformer
  }

  const efficiency = pinWatts > 0 ? (calculatedPout! / pinWatts) * 100 : 0;
  const isStepUp = turnsRatio < 1;

  const steps: StepExplanation[] = [
    {
      step: 'Turns Ratio (a)',
      formula: 'a = N_p / N_s',
      substitution: `${nPrimary} / ${nSecondary}`,
      result: `${turnsRatio.toFixed(4)} (${isStepUp ? 'Step-Up Transformer' : 'Step-Down Transformer'})`,
    },
    {
      step: 'Secondary Voltage (V_s)',
      formula: 'V_s = V_p × (N_s / N_p)',
      substitution: `${vPrimary} V × (${nSecondary} / ${nPrimary})`,
      result: `${vSecondary.toFixed(3)} V`,
    },
    {
      step: 'Power Loss',
      formula: 'P_loss = P_in - P_out',
      substitution: `${pinWatts} W - ${calculatedPout!.toFixed(2)} W`,
      result: `${calculatedLosses!.toFixed(2)} W`,
    },
    {
      step: 'Transformer Efficiency (η)',
      formula: 'η = (P_out / P_in) × 100%',
      substitution: `(${calculatedPout!.toFixed(2)} W / ${pinWatts} W) × 100%`,
      result: `${efficiency.toFixed(2)} %`,
    },
  ];

  return {
    values: {
      turnsRatio,
      vSecondary,
      efficiency,
      losses: calculatedLosses!,
      pout: calculatedPout!,
    },
    steps,
    formulaSummary: 'V_p / V_s = N_p / N_s = I_s / I_p | η = (P_out / P_in) × 100%',
  };
}

// 7. Frequency, Angular Frequency, and Period Conversion
export function solveFrequencyAndPeriod(
  frequencyHz?: number,
  omegaRadS?: number,
  periodSec?: number
): CalculationResult {
  const steps: StepExplanation[] = [];
  let f = frequencyHz;
  let w = omegaRadS;
  let t = periodSec;

  if (typeof f === 'number' && !isNaN(f) && f > 0) {
    w = 2 * Math.PI * f;
    t = 1 / f;
    steps.push({
      step: 'Angular Frequency (ω)',
      formula: 'ω = 2 × π × f',
      substitution: `2 × π × ${f} Hz`,
      result: `${w.toFixed(4)} rad/s`,
    });
    steps.push({
      step: 'Time Period (T)',
      formula: 'T = 1 / f',
      substitution: `1 / ${f} Hz`,
      result: `${t.toFixed(6)} s (${(t * 1000).toFixed(3)} ms)`,
    });
  } else if (typeof w === 'number' && !isNaN(w) && w > 0) {
    f = w / (2 * Math.PI);
    t = 1 / f;
    steps.push({
      step: 'Frequency (f)',
      formula: 'f = ω / (2 × π)',
      substitution: `${w} rad/s / (2 × π)`,
      result: `${f.toFixed(4)} Hz`,
    });
    steps.push({
      step: 'Time Period (T)',
      formula: 'T = 2 × π / ω',
      substitution: `2 × π / ${w}`,
      result: `${t.toFixed(6)} s`,
    });
  } else if (typeof t === 'number' && !isNaN(t) && t > 0) {
    f = 1 / t;
    w = 2 * Math.PI * f;
    steps.push({
      step: 'Frequency (f)',
      formula: 'f = 1 / T',
      substitution: `1 / ${t} s`,
      result: `${f.toFixed(4)} Hz`,
    });
    steps.push({
      step: 'Angular Frequency (ω)',
      formula: 'ω = 2 × π / T',
      substitution: `2 × π / ${t} s`,
      result: `${w.toFixed(4)} rad/s`,
    });
  }

  return {
    values: {
      frequency: f || 0,
      omega: w || 0,
      period: t || 0,
    },
    steps,
    formulaSummary: 'f = 1 / T | ω = 2πf | T = 1 / f = 2π / ω',
  };
}

// 8. Star-Delta (Wye-Delta) Transformation
export function solveStarToDelta(ra: number, rb: number, rc: number): CalculationResult {
  if (ra <= 0 || rb <= 0 || rc <= 0) throw new Error('Resistances must be positive');
  const sumProducts = ra * rb + rb * rc + rc * ra;
  const rab = sumProducts / rc;
  const rbc = sumProducts / ra;
  const rca = sumProducts / rb;

  const steps: StepExplanation[] = [
    {
      step: 'Calculate Numerator (∑ R_i R_j)',
      formula: '∑ = (R_a × R_b) + (R_b × R_c) + (R_c × R_a)',
      substitution: `(${ra}×${rb}) + (${rb}×${rc}) + (${rc}×${ra})`,
      result: `${sumProducts.toFixed(3)} Ω²`,
    },
    {
      step: 'Delta Resistor R_ab',
      formula: 'R_ab = (R_a × R_b + R_b × R_c + R_c × R_a) / R_c',
      substitution: `${sumProducts.toFixed(2)} / ${rc}`,
      result: `${rab.toFixed(4)} Ω`,
    },
    {
      step: 'Delta Resistor R_bc',
      formula: 'R_bc = (R_a × R_b + R_b × R_c + R_c × R_a) / R_a',
      substitution: `${sumProducts.toFixed(2)} / ${ra}`,
      result: `${rbc.toFixed(4)} Ω`,
    },
    {
      step: 'Delta Resistor R_ca',
      formula: 'R_ca = (R_a × R_b + R_b × R_c + R_c × R_a) / R_b',
      substitution: `${sumProducts.toFixed(2)} / ${rb}`,
      result: `${rca.toFixed(4)} Ω`,
    },
  ];

  return {
    values: { rab, rbc, rca },
    steps,
    formulaSummary: 'R_ab = (RaRb + RbRc + RcRa)/Rc | R_bc = (...)/Ra | R_ca = (...)/Rb',
  };
}

export function solveDeltaToStar(rab: number, rbc: number, rca: number): CalculationResult {
  if (rab <= 0 || rbc <= 0 || rca <= 0) throw new Error('Resistances must be positive');
  const sumDelta = rab + rbc + rca;
  const ra = (rab * rca) / sumDelta;
  const rb = (rab * rbc) / sumDelta;
  const rc = (rbc * rca) / sumDelta;

  const steps: StepExplanation[] = [
    {
      step: 'Calculate Denominator (R_ab + R_bc + R_ca)',
      formula: '∑ R_delta = R_ab + R_bc + R_ca',
      substitution: `${rab} + ${rbc} + ${rca}`,
      result: `${sumDelta.toFixed(3)} Ω`,
    },
    {
      step: 'Star Resistor R_a',
      formula: 'R_a = (R_ab × R_ca) / ∑ R_delta',
      substitution: `(${rab} × ${rca}) / ${sumDelta.toFixed(2)}`,
      result: `${ra.toFixed(4)} Ω`,
    },
    {
      step: 'Star Resistor R_b',
      formula: 'R_b = (R_ab × R_bc) / ∑ R_delta',
      substitution: `(${rab} × ${rbc}) / ${sumDelta.toFixed(2)}`,
      result: `${rb.toFixed(4)} Ω`,
    },
    {
      step: 'Star Resistor R_c',
      formula: 'R_c = (R_bc × R_ca) / ∑ R_delta',
      substitution: `(${rbc} × ${rca}) / ${sumDelta.toFixed(2)}`,
      result: `${rc.toFixed(4)} Ω`,
    },
  ];

  return {
    values: { ra, rb, rc },
    steps,
    formulaSummary: 'R_a = (R_ab × R_ca)/(R_ab + R_bc + R_ca) | R_b = (R_ab × R_bc)/∑ | R_c = (R_bc × R_ca)/∑',
  };
}

// 9. Engineering Unit Conversion definitions
export interface EngineeringUnitGroup {
  name: string;
  baseUnit: string;
  units: { name: string; symbol: string; factor: number }[];
}

export const ENGINEERING_UNITS: EngineeringUnitGroup[] = [
  {
    name: 'Voltage',
    baseUnit: 'V',
    units: [
      { name: 'Microvolts', symbol: 'µV', factor: 1e-6 },
      { name: 'Millivolts', symbol: 'mV', factor: 1e-3 },
      { name: 'Volts', symbol: 'V', factor: 1 },
      { name: 'Kilovolts', symbol: 'kV', factor: 1e3 },
      { name: 'Megavolts', symbol: 'MV', factor: 1e6 },
    ],
  },
  {
    name: 'Current',
    baseUnit: 'A',
    units: [
      { name: 'Nanoamperes', symbol: 'nA', factor: 1e-9 },
      { name: 'Microamperes', symbol: 'µA', factor: 1e-6 },
      { name: 'Milliamperes', symbol: 'mA', factor: 1e-3 },
      { name: 'Amperes', symbol: 'A', factor: 1 },
      { name: 'Kiloamperes', symbol: 'kA', factor: 1e3 },
    ],
  },
  {
    name: 'Resistance & Impedance',
    baseUnit: 'Ω',
    units: [
      { name: 'Milliohms', symbol: 'mΩ', factor: 1e-3 },
      { name: 'Ohms', symbol: 'Ω', factor: 1 },
      { name: 'Kiloohms', symbol: 'kΩ', factor: 1e3 },
      { name: 'Megaohms', symbol: 'MΩ', factor: 1e6 },
      { name: 'Gigaohms', symbol: 'GΩ', factor: 1e9 },
    ],
  },
  {
    name: 'Power',
    baseUnit: 'W',
    units: [
      { name: 'Milliwatts', symbol: 'mW', factor: 1e-3 },
      { name: 'Watts', symbol: 'W', factor: 1 },
      { name: 'Kilowatts', symbol: 'kW', factor: 1e3 },
      { name: 'Megawatts', symbol: 'MW', factor: 1e6 },
      { name: 'Horsepower (Electrical)', symbol: 'hp', factor: 746 },
    ],
  },
  {
    name: 'Capacitance',
    baseUnit: 'F',
    units: [
      { name: 'Picofarads', symbol: 'pF', factor: 1e-12 },
      { name: 'Nanofarads', symbol: 'nF', factor: 1e-9 },
      { name: 'Microfarads', symbol: 'µF', factor: 1e-6 },
      { name: 'Millifarads', symbol: 'mF', factor: 1e-3 },
      { name: 'Farads', symbol: 'F', factor: 1 },
    ],
  },
  {
    name: 'Inductance',
    baseUnit: 'H',
    units: [
      { name: 'Nanohenries', symbol: 'nH', factor: 1e-9 },
      { name: 'Microhenries', symbol: 'µH', factor: 1e-6 },
      { name: 'Millihenries', symbol: 'mH', factor: 1e-3 },
      { name: 'Henries', symbol: 'H', factor: 1 },
    ],
  },
  {
    name: 'Frequency',
    baseUnit: 'Hz',
    units: [
      { name: 'Hertz', symbol: 'Hz', factor: 1 },
      { name: 'Kilohertz', symbol: 'kHz', factor: 1e3 },
      { name: 'Megahertz', symbol: 'MHz', factor: 1e6 },
      { name: 'Gigahertz', symbol: 'GHz', factor: 1e9 },
      { name: 'Revolutions / min', symbol: 'RPM', factor: 1 / 60 },
    ],
  },
];

export function convertEngineeringUnit(
  val: number,
  fromFactor: number,
  toFactor: number
): number {
  if (isNaN(val)) return 0;
  const baseValue = val * fromFactor;
  return baseValue / toFactor;
}
