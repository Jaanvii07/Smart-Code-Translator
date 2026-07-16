import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders AI-generated markdown (explanations, suggestions) with the
// PolyGlot.AI theme — inline `code` gets the cyan pill treatment,
// headings stay compact since they're just section titles inside a
// panel, not page headings.
function MarkdownText({ content }) {
  if (!content) return null;

  return (
    <div className="text-[13px] leading-7 text-[#C9C9D3]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,

          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),

          em: ({ children }) => <em className="italic">{children}</em>,

          h1: ({ children }) => (
            <h1 className="mb-2 mt-4 first:mt-0 text-base font-semibold text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 first:mt-0 flex items-center gap-2 text-sm font-semibold text-white">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#00F2FE]" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-3 first:mt-0 text-[13px] font-semibold text-white">
              {children}
            </h3>
          ),

          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-[#00F2FE]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1.5 pl-5 marker:text-[#00F2FE]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,

          // inline `code`
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="rounded-sm border border-[#1F1F29] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-[#00F2FE]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-[12px]" {...props}>
                {children}
              </code>
            );
          },

          // fenced ```code blocks```
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-sm border border-[#1F1F29] bg-black p-3 leading-6">
              {children}
            </pre>
          ),

          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[#00F2FE] underline decoration-[#00F2FE]/40 underline-offset-2 hover:decoration-[#00F2FE]"
            >
              {children}
            </a>
          ),

          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-[#7F00FF]/50 pl-3 text-[#8A8A99] italic">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-4 border-[#1F1F29]" />,

          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto rounded-sm border border-[#1F1F29]">
              <table className="w-full border-collapse text-[12px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[#1F1F29] bg-white/[0.03]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-[#8A8A99]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-[#1F1F29] px-3 py-2 text-[#C9C9D3]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownText;