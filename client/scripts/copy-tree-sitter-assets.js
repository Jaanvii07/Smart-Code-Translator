import { existsSync, mkdirSync, cpSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const publicDir = path.join(root, "public");
const grammarsDir = path.join(publicDir, "grammars");
const coreWasmSrc = path.join(root, "node_modules/web-tree-sitter/tree-sitter.wasm");
const grammarsSrc = path.join(root, "node_modules/tree-sitter-wasms/out");

if (!existsSync(coreWasmSrc)) {
  console.warn("[tree-sitter] web-tree-sitter not installed yet — skipping asset copy.");
  process.exit(0);
}

if (!existsSync(grammarsDir)) mkdirSync(grammarsDir, { recursive: true });

cpSync(coreWasmSrc, path.join(publicDir, "tree-sitter.wasm"));
cpSync(grammarsSrc, grammarsDir, { recursive: true });

console.log("[tree-sitter] Copied core runtime + grammars into public/.");
console.log("[tree-sitter] Available grammar files (check these match GRAMMAR_PATHS in treeSitterCheck.js):");
readdirSync(grammarsDir)
  .filter((f) => f.endsWith(".wasm"))
  .forEach((f) => console.log("  -", f));