import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { MONACO_LANGUAGE_MAP } from "../constants/languages.js";
import { checkSyntax } from "../utils/syntaxCheck.js";
import { checkSyntaxTreeSitter } from "../utils/treeSitterCheck.js";

const MARKER_OWNER = "syntaxCheck";
const DEBOUNCE_MS = 400;

const definePolyGlotTheme = (monaco) => {
  monaco.editor.defineTheme("polyglot-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8A8A99", fontStyle: "italic" },
      { token: "keyword", foreground: "00F2FE" },
      { token: "string", foreground: "B9F5FF" },
      { token: "number", foreground: "7F00FF" },
      { token: "type", foreground: "00F2FE" },
      { token: "function", foreground: "E4E4E7" },
    ],
    colors: {
      "editor.background": "#000000",
      "editor.foreground": "#E4E4E7",
      "editorCursor.foreground": "#00F2FE",
      "editor.lineHighlightBackground": "#0B0B0F",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#54545F",
      "editorLineNumber.activeForeground": "#00F2FE",
      "editor.selectionBackground": "#00F2FE33",
      "editor.inactiveSelectionBackground": "#00F2FE1A",
      "editorIndentGuide.background": "#1F1F29",
      "editorIndentGuide.activeBackground": "#7F00FF66",
      "editorWhitespace.foreground": "#1F1F29",
      "editorBracketMatch.background": "#7F00FF26",
      "editorBracketMatch.border": "#7F00FF",
      "editorGutter.background": "#000000",
      "scrollbarSlider.background": "#1F1F2999",
      "scrollbarSlider.hoverBackground": "#00F2FE4D",
      "scrollbarSlider.activeBackground": "#00F2FE80",
      "editorWidget.background": "#0B0B0FE6",
      "editorWidget.border": "#1F1F29",
      "editorSuggestWidget.background": "#0B0B0FE6",
      "editorSuggestWidget.border": "#1F1F29",
      "editorSuggestWidget.selectedBackground": "#00F2FE1A",
      "editorHoverWidget.background": "#0B0B0FE6",
      "editorHoverWidget.border": "#1F1F29",
      "diffEditor.insertedTextBackground": "#00F2FE14",
      "diffEditor.removedTextBackground": "#7F00FF14",
    },
  });
};

function CodeEditor({ code, onChange, language, readOnly = false }) {
  const displayLanguage = MONACO_LANGUAGE_MAP[language] || "plaintext";
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (readOnly) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;

      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;

      const model = editor.getModel();
      if (!model) return;

      let result = await checkSyntaxTreeSitter(code, language);
      if (!result) {
        result = checkSyntax(code, language);
      }

      if (requestIdRef.current !== requestId) return;

      const lineCount = model.getLineCount();
      const monacoMarkers = result.markers.map((m) => {
        const lineNumber = Math.min(Math.max(m.line, 1), lineCount);
        return {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: model.getLineMaxColumn(lineNumber),
          message: m.message,
          severity: monaco.MarkerSeverity.Error,
        };
      });

      monaco.editor.setModelMarkers(model, MARKER_OWNER, monacoMarkers);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code, language, readOnly]);

  return (
    <div className="flex flex-col h-full w-full rounded-md border border-[#1F1F29] bg-black overflow-hidden">
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#1F1F29] bg-[#0B0B0F]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#8A8A99]">
            {displayLanguage}
          </span>
        </div>

        {readOnly && (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-sm border border-[#7F00FF]/50 text-[#7F00FF] bg-[#7F00FF]/[0.08]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            READ-ONLY
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={displayLanguage}
          value={code}
          onChange={(v) => onChange(v || "")}
          theme="polyglot-dark"
          beforeMount={definePolyGlotTheme}
          onMount={handleMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            readOnly,
            padding: { top: 14, bottom: 14 },
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: "on",
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            matchBrackets: "always",
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            folding: true,
            smoothScrolling: true,
            fixedOverflowWidgets: true,
            cursorBlinking: "phase",
            cursorSmoothCaretAnimation: "on",
          }}
          loading={
            <div className="flex h-full w-full items-center justify-center bg-black">
              <div className="flex items-center gap-2 font-mono text-xs text-[#8A8A99]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
                // booting_monaco_editor...
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default CodeEditor;