import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import HistoryList from "../components/HistoryList.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import MarkdownText from "../components/MarkdownText.jsx";
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/historyService.js";

const TYPE_ICON = {
  translate: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 16V4M7 4L3 8M7 4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  analyze: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V10M12 20V4M20 20v-6" />
    </svg>
  ),
  optimize: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  ),
  explain: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
};

function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [copied, setCopied] = useState(false);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(currentPage, ITEMS_PER_PAGE);
      setEntries(data.entries);
      setTotalPages(data.totalPages);
      setTotalEntries(data.totalEntries);
    } catch {
      toast.error("Failed to load History");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      toast.success("Deleted");
      if (selectedEntry?._id === id) setSelectedEntry(null);
      fetchHistory();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete all history?")) return;
    try {
      const r = await clearHistory();
      toast.success(`Cleared ${r.deletedCount} entries`);
      setEntries([]);
      setTotalEntries(0);
      setTotalPages(0);
      setSelectedEntry(null);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to clear");
    }
  };

  const handleCopy = async () => {
    if (!selectedEntry) return;
    const o = selectedEntry.output || {};
    let text = "";
    if (selectedEntry.type === "translate") text = o.translatedCode || "";
    else if (selectedEntry.type === "optimize") text = o.optimizedCode || "";
    else if (selectedEntry.type === "explain") text = o.explanation || "";
    else if (selectedEntry.type === "analyze")
      text = `Time: ${o.timeComplexity}\nSpace: ${o.spaceComplexity}\n\n${o.explanation || ""}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-black text-[#E4E4E7] font-mono">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#1F1F29] bg-[#0B0B0F]/60 px-6 py-3 backdrop-blur-md">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-white">
            History
          </span>
          <span className="text-[11px] text-[#8A8A99]">
            {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
          </span>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[11px] uppercase tracking-widest text-[#8A8A99] hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Two-pane layout: list + detail */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-6 lg:grid-cols-[380px_1fr]">
        {/* Left: history list */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1F1F29] border-t-[#00F2FE]" />
                <p className="text-xs text-[#8A8A99]">Loading...</p>
              </div>
            ) : (
              <HistoryList
                entries={entries}
                selectedId={selectedEntry?._id}
                onView={setSelectedEntry}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex shrink-0 items-center justify-between rounded-md border border-[#1F1F29] bg-white/[0.02] px-3 py-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-[11px] uppercase tracking-widest text-[#8A8A99] hover:text-[#00F2FE] disabled:opacity-30 disabled:hover:text-[#8A8A99] transition-colors"
              >
                ← Prev
              </button>
              <span className="text-[11px] text-[#8A8A99]">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-[11px] uppercase tracking-widest text-[#8A8A99] hover:text-[#00F2FE] disabled:opacity-30 disabled:hover:text-[#8A8A99] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        <div className="min-h-0 overflow-y-auto rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)]">
          {!selectedEntry ? (
            <div className="flex h-full w-full items-center justify-center p-6">
              <p className="text-sm text-[#8A8A99]">
                Select an entry to view details
                <span className="text-[#00F2FE] animate-pulse">_</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-5">
              {/* Entry meta header */}
              <div className="flex flex-wrap items-center gap-3 border-b border-[#1F1F29] pb-4">
                <span className="flex items-center gap-1.5 rounded-sm border border-[#00F2FE]/40 bg-[#00F2FE]/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#00F2FE]">
                  {TYPE_ICON[selectedEntry.type]}
                  {selectedEntry.type}
                </span>
                <span className="text-sm text-[#C9C9D3]">
                  {selectedEntry.sourceLanguage}
                  {selectedEntry.targetLanguage &&
                    ` → ${selectedEntry.targetLanguage}`}
                </span>
                <span className="ml-auto text-[11px] text-[#8A8A99]">
                  {new Date(selectedEntry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Original source code */}
              {selectedEntry.code && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#8A8A99]">
                    Source
                  </span>
                  <div className="h-64">
                    <CodeEditor
                      code={selectedEntry.code}
                      onChange={() => {}}
                      language={selectedEntry.sourceLanguage}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Output section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-[#8A8A99]">
                    Output
                  </span>
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
                </div>

                <div className="rounded-md border border-[#1F1F29] bg-white/[0.02] p-5">
                  {selectedEntry.type === "translate" && (
                    <div className="space-y-3">
                      <span className="inline-block rounded-sm border border-[#00F2FE]/40 bg-[#00F2FE]/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#00F2FE]">
                        Target: {selectedEntry.targetLanguage}
                      </span>
                      <pre className="overflow-x-auto rounded-sm border border-[#1F1F29] bg-black p-4 font-mono text-[13px] leading-6 text-[#E4E4E7]">
                        {selectedEntry.output?.translatedCode}
                      </pre>
                    </div>
                  )}

                  {selectedEntry.type === "analyze" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-md border border-[#1F1F29] bg-white/[0.02] px-4 py-3">
                          <div className="text-[10px] uppercase tracking-widest text-[#8A8A99] mb-1">
                            Time
                          </div>
                          <div className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                            {selectedEntry.output?.timeComplexity}
                          </div>
                        </div>
                        <div className="rounded-md border border-[#1F1F29] bg-white/[0.02] px-4 py-3">
                          <div className="text-[10px] uppercase tracking-widest text-[#8A8A99] mb-1">
                            Space
                          </div>
                          <div className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                            {selectedEntry.output?.spaceComplexity}
                          </div>
                        </div>
                      </div>
                      {selectedEntry.output?.explanation && (
                        <MarkdownText content={selectedEntry.output.explanation} />
                      )}
                    </div>
                  )}

                  {selectedEntry.type === "optimize" && (
                    <div className="space-y-4">
                      <pre className="overflow-x-auto rounded-sm border border-[#1F1F29] bg-black p-4 font-mono text-[13px] leading-6 text-[#E4E4E7]">
                        {selectedEntry.output?.optimizedCode}
                      </pre>
                      {selectedEntry.output?.suggestions && (
                        <MarkdownText content={selectedEntry.output.suggestions} />
                      )}
                    </div>
                  )}

                  {selectedEntry.type === "explain" && (
                    <MarkdownText content={selectedEntry.output?.explanation} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;