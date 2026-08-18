function factorial(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0 || n > 170) {
    throw Error("Fatorial inválido");
  }

  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function degToRad(x) {
  return x * Math.PI / 180;
}

function radToDeg(x) {
  return x * 180 / Math.PI;
}

function balanceParentheses(s) {
  const open = (s.match(/\(/g) || []).length;
  const close = (s.match(/\)/g) || []).length;
  return open > close ? s + ")".repeat(open - close) : s;
}

function findMatchingParen(s, openIndex) {
  let depth = 0;

  for (let i = openIndex; i < s.length; i++) {
    if (s[i] === "(") depth++;
    if (s[i] === ")") depth--;

    if (depth === 0) return i;
  }

  return -1;
}

function replaceFunctionCalls(s, name, replacer) {
  let result = "";
  let i = 0;

  while (i < s.length) {
    const prev = i > 0 ? s[i - 1] : "";
    const isName =
      s.slice(i, i + name.length) === name &&
      s[i + name.length] === "(" &&
      !/[a-zA-Z0-9_.]/.test(prev);

    if (!isName) {
      result += s[i];
      i++;
      continue;
    }

    const openIndex = i + name.length;
    const closeIndex = findMatchingParen(s, openIndex);

    if (closeIndex === -1) {
      result += s.slice(i);
      break;
    }

    const inner = s.slice(openIndex + 1, closeIndex);
    result += replacer(inner);
    i = closeIndex + 1;
  }

  return result;
}

function preprocess(raw, angleMode = "DEG") {
  let s = String(raw || "").replace(/\s+/g, "");

  s = balanceParentheses(s);

  s = s
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/mod/g, "%")
    .replace(/³√\(/g, "cbrt(")
    .replace(/√\(/g, "sqrt(");

  s = s.replace(/(\d+(?:\.\d+)?|Math\.PI|Math\.E|\))!/g, "factorial($1)");
  s = s.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  s = s.replace(/(\d+(?:\.\d+)?|Math\.PI|Math\.E|\))²/g, "($1**2)");
  s = s.replace(/\^/g, "**");

  const trig = ["sin", "cos", "tan"];

  for (const f of trig) {
    s = replaceFunctionCalls(s, f, inner => {
      if (angleMode === "DEG") {
        return `Math.${f}(degToRad(${inner}))`;
      }
      return `Math.${f}(${inner})`;
    });
  }

  const inv = ["asin", "acos", "atan"];

  for (const f of inv) {
    s = replaceFunctionCalls(s, f, inner => {
      if (angleMode === "DEG") {
        return `radToDeg(Math.${f}(${inner}))`;
      }
      return `Math.${f}(${inner})`;
    });
  }

  const normalFunctions = {
    sinh: inner => `Math.sinh(${inner})`,
    cosh: inner => `Math.cosh(${inner})`,
    tanh: inner => `Math.tanh(${inner})`,
    log2: inner => `Math.log2(${inner})`,
    log: inner => `Math.log10(${inner})`,
    ln: inner => `Math.log(${inner})`,
    sqrt: inner => `Math.sqrt(${inner})`,
    cbrt: inner => `Math.cbrt(${inner})`,
    abs: inner => `Math.abs(${inner})`
  };

  for (const name of Object.keys(normalFunctions)) {
    s = replaceFunctionCalls(s, name, normalFunctions[name]);
  }

  return s;
}

function calculateExpression(raw, angleMode) {
  if (!raw || raw === "0") return 0;

  const js = preprocess(raw, angleMode);

  const fn = new Function(
    "factorial",
    "degToRad",
    "radToDeg",
    `"use strict"; return (${js});`
  );

  const out = fn(factorial, degToRad, radToDeg);

  if (!Number.isFinite(out)) {
    throw Error("Resultado inválido");
  }

  return Math.round((out + Number.EPSILON) * 1e12) / 1e12;
}
