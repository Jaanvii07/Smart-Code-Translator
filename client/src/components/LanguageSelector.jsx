import { LANGUAGES } from "../constants/languages.js";

function LanguageSelector({ value, onChange, disabled = false }) {
  return (
    <div className="relative inline-flex items-center w-full group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          w-full appearance-none cursor-pointer
          font-mono text-[13px] tracking-wide text-[#E4E4E7]
          bg-white/[0.02] border border-[#1F1F29] rounded-sm
          py-2.5 pl-3.5 pr-9
          transition-colors duration-200
          hover:enabled:border-[#00F2FE]/50
          focus:outline-none focus:bg-black focus:border-[#00F2FE]
          focus:ring-2 focus:ring-[#00F2FE]/20
          disabled:cursor-not-allowed disabled:text-[#8A8A99]
          disabled:border-[#7F00FF]/35 disabled:bg-[#7F00FF]/[0.05]
          [&>option]:bg-[#0B0B0F] [&>option]:text-[#E4E4E7]
        "
      >
        <option value="">Select</option>
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>

      {/* custom chevron — native <select> arrows can't be recolored,
          so appearance-none hides the OS one and we draw our own */}
      <svg
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
          disabled
            ? "text-[#7F00FF]/50"
            : "text-[#8A8A99] group-hover:text-[#00F2FE]"
        }`}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export default LanguageSelector;