import { useState } from "react";
import toast from "react-hot-toast";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import { STARTER_CODE } from "../constants/languages.js";
import {
  translateCode,
  analyzeComplexity,
  optimizeCode,
  explainCode,
} from "../services/codeService.js";

const ACTIONS = ["translate", "analyze", "optimize", "explain"];

function HomePage() {
  const [code, setCode] = useState(STARTER_CODE.python);
  const [sourceLanguage, setSourceLanguage] = useState("python");
  const [targetLanguage, setTargetLanguage] = useState("java");
  const [activeAction, setActiveAction] = useState("translate");

  // Cache of results per action: { translate: {...}, analyze: {...}, optimize: {...}, explain: {...} }
  // Each entry also stores which language it was computed against, since analyze/optimize/explain
  // may run on either the original source code or the translated target code depending on how
  // they were triggered.
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeResult = results[activeAction] || null;

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (Object.keys(results).length > 0) setResults({});
  };

  const handleSourceChange = (langId) => {
    setSourceLanguage(langId);
    if (STARTER_CODE[langId]) setCode(STARTER_CODE[langId]);
    setResults({});
  };

  const handleSwap = () => {
    if (activeAction !== "translate") return;
    const translated = results.translate?.translatedCode;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translated) {
      setCode(translated);
      setResults({});
    }
  };

  const handleCopy = async () => {
    if (!activeResult) return;

    let text = "";
    if (activeAction === "translate") text = activeResult.translatedCode || "";
    else if (activeAction === "optimize") text = activeResult.optimizedCode || "";
    else if (activeAction === "explain") text = activeResult.explanation || "";
    else if (activeAction === "analyze")
      text = `Time: ${activeResult.timeComplexity}\nSpace: ${activeResult.spaceComplexity}\n\n${
        activeResult.explanation || ""
      }`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return toast.error("Please write some code first.");
    if (!sourceLanguage) return toast.error("Select a source language.");
    if (activeAction === "translate" && !targetLanguage) {
      return toast.error("Select a target language.");
    }

    setLoading(true);
    try {
      const fns = {
        translate: () => translateCode(code, sourceLanguage, targetLanguage),
        analyze: () => analyzeComplexity(code, sourceLanguage),
        optimize: () => optimizeCode(code, sourceLanguage),
        explain: () => explainCode(code, sourceLanguage),
      };
      const res = await fns[activeAction]();
      const language = activeAction === "translate" ? targetLanguage : sourceLanguage;
      setResults((prev) => ({
        ...prev,
        [activeAction]: { ...res, language },
      }));
      toast.success("Done!");
    } catch (err) {
     if (err.response?.status === 429) {
         toast.error("Daily AI quota reached. Try again after midnight Pacific time.");
      } else if (err.response?.status === 422) {
        toast.error(err.response?.data?.error || err.response?.data?.message || "Syntax error detected.");
      } else {
        toast.error(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-black text-[#E4E4E7] font-mono">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-[#1F1F29] bg-[#0B0B0F]/60 px-6 py-3 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1 rounded-md border border-[#1F1F29] bg-white/[0.02] p-1">
          {ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => setActiveAction(a)}
              className={`rounded-sm px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                activeAction === a
                  ? "bg-[#00F2FE] text-black shadow-[0_0_16px_rgba(0,242,254,0.35)]"
                  : "text-[#8A8A99] hover:text-white"
              }`}
            >
              {a}
              {results[a] && activeAction !== a && (
                <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-[#00F2FE] align-middle" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="rounded-sm bg-[#00F2FE] px-6 py-2 text-sm font-semibold tracking-wide text-black shadow-[0_0_0_1px_rgba(0,242,254,0.5),0_0_24px_rgba(0,242,254,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(0,242,254,0.8),0_0_32px_rgba(0,242,254,0.55)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "RUNNING..." : "RUN →"}
        </button>
      </div>

      {/* Panels */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-6 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        {/* Source panel */}
        <div className="flex min-h-[320px] flex-1 flex-col gap-2 lg:min-h-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-widest text-[#8A8A99]">
                Source
              </span>
              <div className="w-36">
                <LanguageSelector
                  value={sourceLanguage}
                  onChange={handleSourceChange}
                />
              </div>
            </div>
            <button
              onClick={() => {
                setCode("");
                setResults({});
              }}
              className="text-[11px] uppercase tracking-widest text-[#8A8A99] hover:text-[#00F2FE] transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor code={code} onChange={handleCodeChange} language={sourceLanguage} />
          </div>
        </div>

        {/* Swap / direction indicator */}
        <div className="flex items-center justify-center shrink-0 lg:w-12 lg:flex-col">
          {activeAction === "translate" ? (
            <button
              onClick={handleSwap}
              title="Swap languages"
              className="flex h-9 w-9 rotate-90 items-center justify-center rounded-full border border-[#1F1F29] bg-white/[0.02] text-[#8A8A99] transition-colors hover:border-[#00F2FE]/60 hover:text-[#00F2FE] lg:rotate-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4M7 4L3 8M7 4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          ) : (
            <span className="rotate-90 text-lg text-[#8A8A99] lg:rotate-0">&#8594;</span>
          )}
        </div>

        {/* Output panel */}
        <div className="flex min-h-[320px] flex-1 flex-col gap-2 lg:min-h-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-widest text-[#8A8A99]">
                {activeAction === "translate" ? "Target" : "Output"}
              </span>
              {activeAction === "translate" && (
                <div className="w-36">
                  <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} />
                </div>
              )}
              {activeResult && activeAction !== "translate" && (
                <span className="rounded-sm border border-[#00F2FE]/40 bg-[#00F2FE]/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#00F2FE]">
                  {activeAction}
                </span>
              )}
            </div>
            {activeResult && (
              <button
                onClick={handleCopy}
                className={`rounded-sm border px-3 py-1 text-[11px] uppercase tracking-widest transition-colors ${
                  copied
                    ? "border-[#00F2FE]/60 text-[#00F2FE]"
                    : "border-[#1F1F29] text-[#8A8A99] hover:border-[#00F2FE]/50 hover:text-[#00F2FE]"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1">
            {loading ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1F1F29] border-t-[#00F2FE]" />
                <p className="text-xs text-[#8A8A99]">Processing...</p>
              </div>
            ) : (
              <OutputPanel
                result={activeResult}
                action={activeAction}
                targetLanguage={activeResult?.language || targetLanguage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;