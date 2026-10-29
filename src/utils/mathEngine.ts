/**
 * Safe Mathematical Expression Engine for NEON-X
 * Implements tokenization, shunting-yard algorithm, and RPN evaluator.
 * No arbitrary eval() is ever used.
 */

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

export type AngleUnit = 'DEG' | 'RAD';

// Factorial calculation with safety bounds
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires non-negative integer');
  }
  if (n > 170) {
    throw new Error('Factorial overflow (max 170)');
  }
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Operators and precedence
interface OperatorDef {
  prec: number;
  assoc: 'left' | 'right';
  unary?: boolean;
}

const OPERATORS: Record<string, OperatorDef> = {
  '+': { prec: 1, assoc: 'left' },
  '-': { prec: 1, assoc: 'left' },
  '*': { prec: 2, assoc: 'left' },
  '/': { prec: 2, assoc: 'left' },
  '%': { prec: 2, assoc: 'left' },
  '^': { prec: 3, assoc: 'right' },
  'u-': { prec: 4, assoc: 'right', unary: true },
  'u+': { prec: 4, assoc: 'right', unary: true },
};

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'asinh', 'acosh', 'atanh',
  'log', 'ln', 'log2',
  'sqrt', 'cbrt', 'abs',
  'exp', 'fact', 'floor', 'ceil', 'round'
]);

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
};

// Tokenizer
export function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const cleanExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');

  while (i < cleanExpr.length) {
    const ch = cleanExpr[i];

    // Numbers (including decimals and scientific e/E notation)
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(cleanExpr[i + 1] || ''))) {
      let numStr = '';
      let hasDot = false;
      while (i < cleanExpr.length) {
        const c = cleanExpr[i];
        if (/[0-9]/.test(c)) {
          numStr += c;
          i++;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          numStr += c;
          i++;
        } else if ((c === 'e' || c === 'E') && /[0-9+\-]/.test(cleanExpr[i + 1] || '')) {
          numStr += c;
          i++;
          if (cleanExpr[i] === '+' || cleanExpr[i] === '-') {
            numStr += cleanExpr[i];
            i++;
          }
        } else {
          break;
        }
      }
      tokens.push(numStr);
      continue;
    }

    // Identifiers (functions or constants)
    if (/[a-zA-Zπ]/.test(ch)) {
      let ident = '';
      while (i < cleanExpr.length && /[a-zA-Z0-9π]/.test(cleanExpr[i])) {
        ident += cleanExpr[i];
        i++;
      }
      tokens.push(ident.toLowerCase());
      continue;
    }

    // Factorial postfix symbol '!'
    if (ch === '!') {
      tokens.push('!');
      i++;
      continue;
    }

    // Percent symbol '%'
    if (ch === '%') {
      tokens.push('%');
      i++;
      continue;
    }

    // Operators and brackets
    if ('+-*/^(),'.includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character: "${ch}"`);
  }

  return tokens;
}

// Transform tokens with unary handling and implicit multiplication
export function processTokens(rawTokens: string[]): string[] {
  const processed: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    const prev = i > 0 ? processed[processed.length - 1] : null;

    // Check for implicit multiplication:
    // e.g., 2(x), )3, )(, 5sin, 5pi, pi(2)
    if (prev) {
      const isPrevOperand = !isNaN(Number(prev)) || prev in CONSTANTS || prev === ')' || prev === '!';
      const isCurrOperand = !isNaN(Number(token)) || token in CONSTANTS || FUNCTIONS.has(token) || token === '(';

      if (isPrevOperand && isCurrOperand && token !== ')' && token !== '!' && token !== '%') {
        processed.push('*');
      }
    }

    // Check for unary minus / plus
    if (token === '-' || token === '+') {
      const isUnary = !prev || prev === '(' || prev === ',' || prev in OPERATORS || prev === 'u-' || prev === 'u+';
      if (isUnary) {
        processed.push(token === '-' ? 'u-' : 'u+');
        continue;
      }
    }

    processed.push(token);
  }

  return processed;
}

// Convert Infix to RPN via Shunting-Yard
export function infixToRPN(tokens: string[]): string[] {
  const output: string[] = [];
  const operatorStack: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Numbers
    if (!isNaN(Number(token))) {
      output.push(token);
      continue;
    }

    // Constants
    if (token in CONSTANTS) {
      output.push(token);
      continue;
    }

    // Functions
    if (FUNCTIONS.has(token)) {
      operatorStack.push(token);
      continue;
    }

    // Postfix Factorial '!'
    if (token === '!') {
      output.push('fact');
      continue;
    }

    // Postfix Percent '%'
    if (token === '%') {
      output.push('%_postfix');
      continue;
    }

    // Comma for multi-arg functions
    if (token === ',') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        output.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) {
        throw new Error('Misplaced comma or mismatched parentheses');
      }
      continue;
    }

    // Operators
    if (token in OPERATORS) {
      const o1 = token;
      while (operatorStack.length > 0) {
        const o2 = operatorStack[operatorStack.length - 1];
        if (FUNCTIONS.has(o2)) {
          output.push(operatorStack.pop()!);
          continue;
        }
        if (o2 in OPERATORS) {
          const prec1 = OPERATORS[o1].prec;
          const prec2 = OPERATORS[o2].prec;
          const assoc1 = OPERATORS[o1].assoc;
          if ((assoc1 === 'left' && prec1 <= prec2) || (assoc1 === 'right' && prec1 < prec2)) {
            output.push(operatorStack.pop()!);
            continue;
          }
        }
        break;
      }
      operatorStack.push(o1);
      continue;
    }

    // Left bracket
    if (token === '(') {
      operatorStack.push(token);
      continue;
    }

    // Right bracket
    if (token === ')') {
      let matched = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop()!;
        if (top === '(') {
          matched = true;
          break;
        }
        output.push(top);
      }
      if (!matched) {
        throw new Error('Mismatched parentheses');
      }
      if (operatorStack.length > 0 && FUNCTIONS.has(operatorStack[operatorStack.length - 1])) {
        output.push(operatorStack.pop()!);
      }
      continue;
    }

    throw new Error(`Unrecognized symbol: ${token}`);
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top === '(' || top === ')') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

// Evaluate RPN
export function evaluateRPN(rpn: string[], angleUnit: AngleUnit = 'DEG'): number {
  const stack: number[] = [];

  const toRad = (angle: number) => (angleUnit === 'DEG' ? (angle * Math.PI) / 180 : angle);
  const fromRad = (rad: number) => (angleUnit === 'DEG' ? (rad * 180) / Math.PI : rad);

  for (const token of rpn) {
    // Number literal
    if (!isNaN(Number(token))) {
      stack.push(Number(token));
      continue;
    }

    // Constant
    if (token in CONSTANTS) {
      stack.push(CONSTANTS[token]);
      continue;
    }

    // Postfix percent
    if (token === '%_postfix') {
      if (stack.length < 1) throw new Error('Invalid percent operation');
      const val = stack.pop()!;
      stack.push(val / 100);
      continue;
    }

    // Unary Operators
    if (token === 'u-') {
      if (stack.length < 1) throw new Error('Unary minus missing operand');
      stack.push(-stack.pop()!);
      continue;
    }
    if (token === 'u+') {
      if (stack.length < 1) throw new Error('Unary plus missing operand');
      // No-op on sign
      continue;
    }

    // Single-argument functions
    if (FUNCTIONS.has(token)) {
      if (stack.length < 1) throw new Error(`Function ${token}() missing argument`);
      const a = stack.pop()!;

      switch (token) {
        case 'sin':
          stack.push(Math.sin(toRad(a)));
          break;
        case 'cos': {
          // Normalize exact zero for 90, 270 deg
          const rad = toRad(a);
          const val = Math.cos(rad);
          stack.push(Math.abs(val) < 1e-15 ? 0 : val);
          break;
        }
        case 'tan': {
          const rad = toRad(a);
          if (angleUnit === 'DEG' && Math.abs(a % 180) === 90) {
            throw new Error('Tangent undefined at 90°');
          }
          stack.push(Math.tan(rad));
          break;
        }
        case 'asin':
          if (a < -1 || a > 1) throw new Error('Arcsin domain [-1, 1]');
          stack.push(fromRad(Math.asin(a)));
          break;
        case 'acos':
          if (a < -1 || a > 1) throw new Error('Arccos domain [-1, 1]');
          stack.push(fromRad(Math.acos(a)));
          break;
        case 'atan':
          stack.push(fromRad(Math.atan(a)));
          break;
        case 'sinh':
          stack.push(Math.sinh(a));
          break;
        case 'cosh':
          stack.push(Math.cosh(a));
          break;
        case 'tanh':
          stack.push(Math.tanh(a));
          break;
        case 'asinh':
          stack.push(Math.asinh(a));
          break;
        case 'acosh':
          if (a < 1) throw new Error('Acosh domain [1, ∞)');
          stack.push(Math.acosh(a));
          break;
        case 'atanh':
          if (a <= -1 || a >= 1) throw new Error('Atanh domain (-1, 1)');
          stack.push(Math.atanh(a));
          break;
        case 'log':
          if (a <= 0) throw new Error('Log domain (0, ∞)');
          stack.push(Math.log10(a));
          break;
        case 'ln':
          if (a <= 0) throw new Error('Ln domain (0, ∞)');
          stack.push(Math.log(a));
          break;
        case 'log2':
          if (a <= 0) throw new Error('Log2 domain (0, ∞)');
          stack.push(Math.log2(a));
          break;
        case 'sqrt':
          if (a < 0) throw new Error('Square root of negative number');
          stack.push(Math.sqrt(a));
          break;
        case 'cbrt':
          stack.push(Math.cbrt(a));
          break;
        case 'abs':
          stack.push(Math.abs(a));
          break;
        case 'exp':
          stack.push(Math.exp(a));
          break;
        case 'fact':
          stack.push(factorial(a));
          break;
        case 'floor':
          stack.push(Math.floor(a));
          break;
        case 'ceil':
          stack.push(Math.ceil(a));
          break;
        case 'round':
          stack.push(Math.round(a));
          break;
        default:
          throw new Error(`Unsupported function: ${token}`);
      }
      continue;
    }

    // Binary Operators
    if (token in OPERATORS) {
      if (stack.length < 2) throw new Error(`Operator ${token} missing operand`);
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          stack.push(a / b);
          break;
        case '%':
          if (b === 0) throw new Error('Modulo by zero');
          stack.push(a % b);
          break;
        case '^':
          if (a < 0 && !Number.isInteger(b)) {
            throw new Error('Complex result unsupported');
          }
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unsupported operator: ${token}`);
      }
      continue;
    }

    throw new Error(`Unexpected token during evaluation: ${token}`);
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression format');
  }

  return stack[0];
}

// Format numbers according to precision settings and scientific thresholds
export function formatResult(val: number, precision: number = 8): string {
  if (isNaN(val)) return 'Error';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
  if (val === 0) return '0';

  const absVal = Math.abs(val);

  // Auto scientific notation for very large or tiny non-zero numbers
  if (absVal >= 1e14 || (absVal < 1e-6 && absVal > 0)) {
    return val.toExponential(Math.min(precision, 8));
  }

  // Regular rounded representation
  const fixed = val.toFixed(precision);
  // Remove unnecessary trailing zeroes after decimal point
  if (fixed.includes('.')) {
    const trimmed = fixed.replace(/\.?0+$/, '');
    return trimmed === '-0' ? '0' : trimmed;
  }
  return fixed;
}

// Main evaluation entry point
export function evaluateExpression(
  expression: string,
  angleUnit: AngleUnit = 'DEG',
  precision: number = 8
): EvaluationResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { success: false, error: 'Empty expression' };
  }

  try {
    const rawTokens = tokenize(trimmed);
    const processed = processTokens(rawTokens);
    const rpn = infixToRPN(processed);
    const value = evaluateRPN(rpn, angleUnit);
    const formatted = formatResult(value, precision);

    return {
      success: true,
      value,
      formatted,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Syntax error';
    return {
      success: false,
      error: message,
    };
  }
}
