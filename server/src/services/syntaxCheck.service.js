const SUPPORTED_LANGUAGES = new Set(["c", "cpp", "csharp", "java", "python"]);

const BRACKET_PAIRS = { ")": "(", "]": "[", "}": "{" };
const OPENERS = new Set(["(", "[", "{"]);
const CLOSERS = new Set([")", "]", "}"]);

const checkStructure = (code, isPython) => {
  const errors = [];
  const stack = [];
  let line = 1;
  let state = "code";
  let stringDelim = null;
  let tripleDelim = null;
  let i = 0;

  while (i < code.length) {
    const ch = code[i];
    const next2 = code.slice(i, i + 2);
    const next3 = code.slice(i, i + 3);
    if (ch === "\n") line++;

    if (state === "code") {
      if (!isPython && next2 === "//") { state = "line-comment"; i += 2; continue; }
      if (!isPython && next2 === "/*") { state = "block-comment"; i += 2; continue; }
      if (isPython && ch === "#") { state = "line-comment"; i += 1; continue; }
      if (isPython && (next3 === '"""' || next3 === "'''")) {
        state = "triple-string"; tripleDelim = next3; i += 3; continue;
      }
      if (ch === '"' || ch === "'") { state = "string"; stringDelim = ch; i += 1; continue; }
      if (OPENERS.has(ch)) { stack.push({ ch, line }); i++; continue; }
      if (CLOSERS.has(ch)) {
        if (stack.length === 0) {
          errors.push(`Unexpected closing '${ch}' at line ${line} with no matching opening bracket.`);
        } else {
          const top = stack.pop();
          if (top.ch !== BRACKET_PAIRS[ch]) {
            errors.push(`Mismatched bracket: '${top.ch}' opened at line ${top.line} but closed with '${ch}' at line ${line}.`);
          }
        }
        i++; continue;
      }
      i++; continue;
    }

    if (state === "line-comment") {
      if (ch === "\n") state = "code";
      i++; continue;
    }

    if (state === "block-comment") {
      if (next2 === "*/") { state = "code"; i += 2; continue; }
      i++; continue;
    }

    if (state === "string") {
      if (ch === "\\") { i += 2; continue; }
      if (ch === "\n") {
        errors.push(`Unterminated string literal on line ${line - 1}.`);
        state = "code";
        continue;
      }
      if (ch === stringDelim) { state = "code"; i++; continue; }
      i++; continue;
    }

    if (state === "triple-string") {
      if (next3 === tripleDelim) { state = "code"; i += 3; continue; }
      i++; continue;
    }
  }

  if (state === "string") errors.push(`Unterminated string literal (missing closing ${stringDelim}).`);
  if (state === "triple-string") errors.push(`Unterminated triple-quoted string (missing closing ${tripleDelim}).`);
  if (state === "block-comment") errors.push("Unterminated block comment (missing closing */).");
  if (stack.length > 0) {
    const unclosed = stack.map((s) => `'${s.ch}' opened at line ${s.line}`).join(", ");
    errors.push(`Unclosed bracket(s): ${unclosed}.`);
  }

  return errors;
};

const netBracketDelta = (line) => {
  let delta = 0;
  for (const ch of line) {
    if (OPENERS.has(ch)) delta++;
    if (CLOSERS.has(ch)) delta--;
  }
  return delta;
};

const BLOCK_KEYWORD_PATTERN = /^\s*(if|elif|else|for|while|def|class|try|except|finally|with)\b/;

const checkPythonStyle = (code) => {
  const errors = [];
  const lines = code.split("\n");

  lines.forEach((rawLine, idx) => {
    const commentIdx = rawLine.indexOf("#");
    const line = (commentIdx !== -1 ? rawLine.slice(0, commentIdx) : rawLine).trimEnd();

    if (line.trim()) {
      const isBlockStart = BLOCK_KEYWORD_PATTERN.test(line);
      if (isBlockStart) {
        const lastChar = line[line.length - 1];
        const continues = netBracketDelta(line) !== 0 || lastChar === "\\";
        if (!continues && lastChar !== ":") {
          errors.push(`Line ${idx + 1}: expected ':' at the end of this statement.`);
        }
      }
    }

    const leading = rawLine.match(/^[ \t]*/)[0];
    if (leading.includes(" ") && leading.includes("\t")) {
      errors.push(`Line ${idx + 1}: mixed tabs and spaces in indentation.`);
    }
  });

  return errors;
};

export const checkSyntax = (code, languageId) => {
  if (!SUPPORTED_LANGUAGES.has(languageId)) {
    return null;
  }

  try {
    const isPython = languageId === "python";
    const errors = [
      ...checkStructure(code, isPython),
      ...(isPython ? checkPythonStyle(code) : []),
    ];

    if (errors.length > 0) {
      return { valid: false, errors: errors.join("\n") };
    }
    return { valid: true };
  } catch (error) {
    console.error("Syntax check failed unexpectedly:", error.message);
    return null;
  }
};