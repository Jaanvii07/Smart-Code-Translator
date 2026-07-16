import CodeEditor from "./CodeEditor.jsx";
import MarkdownText from "./MarkdownText.jsx";

function OutputPanel({ result, action, targetLanguage }) {
  if (!result) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)]">
        <p className="font-mono text-sm text-[#8A8A99] text-center px-6">
          Write code, pick an action, and hit{" "}
          <span className="text-[#00F2FE] font-semibold">Run</span>
          <span className="text-[#00F2FE] animate-pulse">_</span>
        </p>
      </div>
    );
  }

  if (action === "translate") {
    return (
      <div className="h-full w-full">
        <CodeEditor
          code={result.translatedCode || ""}
          onChange={() => {}}
          language={targetLanguage}
          readOnly
        />
      </div>
    );
  }

  if (action === "analyze") {
    return (
      <div className="h-full w-full overflow-y-auto rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)] p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard label="Time" value={result.timeComplexity || "N/A"} />
          <InfoCard label="Space" value={result.spaceComplexity || "N/A"} />
        </div>
        {result.explanation && <MarkdownText content={result.explanation} />}
      </div>
    );
  }

  if (action === "optimize") {
    return (
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex-1 min-h-0">
          <CodeEditor
            code={result.optimizedCode || ""}
            onChange={() => {}}
            language={targetLanguage}
            readOnly
          />
        </div>
        {result.suggestions && (
          <div className="rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)] p-4 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#00F2FE]">
                Suggestions
              </span>
            </div>
            <MarkdownText content={result.suggestions} />
          </div>
        )}
      </div>
    );
  }

  if (action === "explain") {
    return (
      <div className="h-full w-full overflow-y-auto rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)] p-5">
        <MarkdownText content={result.explanation} />
      </div>
    );
  }

  return null;
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-md border border-[#1F1F29] bg-white/[0.02] px-4 py-3">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#8A8A99] mb-1">
        {label}
      </div>
      <div className="text-lg font-['Space_Grotesk'] font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

export default OutputPanel;