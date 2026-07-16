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

function HistoryList({ entries, selectedId, onView, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-[#1F1F29] bg-[rgba(11,11,15,0.4)] font-mono text-sm text-[#8A8A99]">
        No history yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isSelected = entry._id === selectedId;
        const preview = entry.code?.trim().split("\n")[0]?.slice(0, 60);

        return (
          <div
            key={entry._id}
            onClick={() => onView(entry)}
            className={`group flex cursor-pointer flex-col gap-1.5 rounded-md border px-4 py-3 font-mono transition-colors ${
              isSelected
                ? "border-[#00F2FE]/60 bg-[#00F2FE]/[0.06]"
                : "border-[#1F1F29] bg-white/[0.02] hover:border-[#00F2FE]/40 hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                    isSelected
                      ? "border-[#00F2FE] bg-[#00F2FE]/10 text-[#00F2FE]"
                      : "border-[#00F2FE]/40 bg-[#00F2FE]/5 text-[#00F2FE]"
                  }`}
                >
                  {TYPE_ICON[entry.type]}
                  {entry.type}
                </span>
                <span className="truncate text-sm text-[#C9C9D3]">
                  {entry.sourceLanguage}
                  {entry.targetLanguage && ` → ${entry.targetLanguage}`}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className="text-[11px] text-[#8A8A99]">
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry._id);
                  }}
                  className="text-[11px] uppercase tracking-widest text-[#8A8A99] opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>

            {preview && (
              <p className="truncate text-[11px] text-[#54545f]">
                {preview}
                {entry.code.trim().length > 60 && "…"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HistoryList;