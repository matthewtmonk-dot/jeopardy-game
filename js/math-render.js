function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function looksMathy(s) {
  return /[=^/]|sqrt\s*\(|\bpi\b|\(|\)|\+|\-|\*|\b\d+\s*[x y]\b|\b[x y]\b/i.test(s);
}

function plainToTeX(expr) {
  let s = expr;
  s = s.replace(/\s+/g, " ").trim();

  // sqrt(...) -> \sqrt{...}
  s = s.replace(/sqrt\s*\(([^()]*)\)/gi, (_, inside) => `\\sqrt{${plainToTeX(inside)}}`);

  // x^2, 3^2, x ^ 2 -> x^{2}
  s = s.replace(/\^\s*(\-?\d+|\w+)/g, "^{$1}");

  // a/b -> \frac{a}{b} (avoid a/b/c and URLs)
  if (!/\bhttps?:\/\//i.test(s)) {
    s = s.replace(
      /(\([^()]+\)|\b\-?\w+\b|\b\-?\d+(?:\.\d+)?\b)\s*\/\s*(\([^()]+\)|\b\w+\b|\b\d+(?:\.\d+)?\b)(?!\s*\/)/g,
      (_, num, den) => `\\frac{${stripParens(num)}}{${stripParens(den)}}`
    );
  }

  // a*b -> a \cdot b
  s = s.replace(/\s*\*\s*/g, " \\cdot ");

  // unicode × to \cdot
  s = s.replace(/\s*×\s*/g, " \\cdot ");

  // pi -> \pi
  s = s.replace(/\bpi\b/gi, "\\pi");

  // implicit multiplication: 3x -> 3x (MathJax is fine), but 3 x -> 3x
  s = s.replace(/\b(\d+)\s+([a-z])\b/gi, "$1$2");

  return s;

  function stripParens(t) {
    const tt = t.trim();
    if (tt.startsWith("(") && tt.endsWith(")")) return tt.slice(1, -1).trim();
    return tt;
  }
}

function renderMathText(raw) {
  if (raw == null) return "";

  // Escape HTML first so normal text is safe
  const safe = escapeHtml(raw);

  // Match "math-ish" segments inside normal sentences.
  // This intentionally grabs multi-token expressions like: "3/4 + 5/8", "x^2", "sqrt(16)"
  const MATH_RE =
    /(sqrt\s*\([^)]*\)|\bpi\b|(?:\b\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\b(?:\s*[\+\-\*]\s*\b\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\b)+)|\b\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\b|(?:\b\d+(?:\.\d+)?\b|\b[a-zA-Z]\w*\b|\([^)]*\))\s*\^\s*-?(?:\d+|\w+)\b|\b\d+(?:\.\d+)?\b\s*[\+\-\*]\s*\b\d+(?:\.\d+)?\b)/gi;

  // Replace only the matched segments with MathJax inline delimiters
  return safe.replace(MATH_RE, (match) => `\\(${plainToTeX(match)}\\)`);
}

async function typesetMath(containerEl) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    await window.MathJax.typesetPromise([containerEl]);
  }
}

// IMPORTANT: expose the API your app.js is expecting
window.MathRender = {
  renderMathText,
  typesetMath,
};