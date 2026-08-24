const SUPPORTED_LANGUAGES = new Set(["c", "cpp", "csharp", "java", "python"]);

const BRACKET_PAIRS = { ")": "(", "]": "[", "}": "{" };
const OPENERS = new Set(["(", "[", "{"]);
const CLOSERS = new Set([")", "]", "}"]);

const checkStructure = (code, isPython) => {
  const markers = [];
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
          markers.push({ line, message: `Unexpected closing '${ch}' — no matching opening bracket.` });
        } else {
          const top = stack.pop();
          if (top.ch !== BRACKET_PAIRS[ch]) {
            markers.push({ line: top.line, message: `'${top.ch}' opened here is never closed properly.` });
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
        markers.push({ line: line - 1, message: "Unterminated string literal." });
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

  if (state === "string") markers.push({ line, message: `Unterminated string literal (missing closing ${stringDelim}).` });
  if (state === "triple-string") markers.push({ line, message: "Unterminated triple-quoted string." });
  if (state === "block-comment") markers.push({ line, message: "Unterminated block comment (missing closing */)." });
  stack.forEach((s) => {
    markers.push({ line: s.line, message: `'${s.ch}' opened here is never closed.` });
  });

  return markers;
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
  const markers = [];
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
          markers.push({ line: idx + 1, message: "Expected ':' at the end of this statement." });
        }
      }
    }

    const leading = rawLine.match(/^[ \t]*/)[0];
    if (leading.includes(" ") && leading.includes("\t")) {
      markers.push({ line: idx + 1, message: "Mixed tabs and spaces in indentation." });
    }
  });

  return markers;
};

export const checkSyntax = (code, languageId) => {
  if (!code || !SUPPORTED_LANGUAGES.has(languageId)) {
    return { valid: true, markers: [] };
  }

  const isPython = languageId === "python";
  const markers = [
    ...checkStructure(code, isPython),
    ...(isPython ? checkPythonStyle(code) : []),
  ];

  return { valid: markers.length === 0, markers };
};