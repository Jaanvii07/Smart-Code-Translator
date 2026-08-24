import { Parser, Language } from "web-tree-sitter";

// If a filename here doesn't match your postinstall console output, fix it.
const GRAMMAR_PATHS = {
  c: "/grammars/tree-sitter-c.wasm",
  cpp: "/grammars/tree-sitter-cpp.wasm",
  csharp: "/grammars/tree-sitter-c_sharp.wasm",
  java: "/grammars/tree-sitter-java.wasm",
  python: "/grammars/tree-sitter-python.wasm",
};

let initPromise = null;
const languageCache = {};
const parserCache = {};

const ensureInit = () => {
  if (!initPromise) {
    initPromise = Parser.init({ locateFile: () => "/tree-sitter.wasm" });
  }
  return initPromise;
};

const getParser = async (languageId) => {
  if (parserCache[languageId]) return parserCache[languageId];

  const path = GRAMMAR_PATHS[languageId];
  if (!path) return null;

  try {
    await ensureInit();

    if (!languageCache[languageId]) {
      languageCache[languageId] = await Language.load(path);
    }

    const parser = new Parser();
    parser.setLanguage(languageCache[languageId]);
    parserCache[languageId] = parser;
    return parser;
  } catch (error) {
    console.error(`Tree-sitter grammar failed to load for "${languageId}":`, error.message);
    return null;
  }
};

const collectErrorNodes = (node, markers) => {
  const nodeHasError = typeof node.hasError === "function" ? node.hasError() : node.hasError;
  if (!nodeHasError && !node.isMissing && node.type !== "ERROR") return;

  if (node.isMissing) {
    markers.push({
      line: node.startPosition.row + 1,
      message: `Syntax error: missing '${node.type}'.`,
    });
  } else if (node.type === "ERROR") {
    markers.push({
      line: node.startPosition.row + 1,
      message: "Syntax error: unexpected or invalid code here.",
    });
  }

  for (let i = 0; i < node.childCount; i++) {
    collectErrorNodes(node.child(i), markers);
  }
};

export const checkSyntaxTreeSitter = async (code, languageId) => {
  const parser = await getParser(languageId);
  if (!parser) return null;

  try {
    const tree = parser.parse(code);
    const markers = [];
    collectErrorNodes(tree.rootNode, markers);
    return { valid: markers.length === 0, markers };
  } catch (error) {
    console.error("Tree-sitter parse failed:", error.message);
    return null;
  }
};