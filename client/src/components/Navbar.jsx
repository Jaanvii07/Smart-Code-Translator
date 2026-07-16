import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "Translate" },
  { to: "/history", label: "History" },
];

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#1F1F29] bg-[#0B0B0F]/60 px-6 py-3 backdrop-blur-md font-mono">
      <div className="flex items-center gap-8">
        <span className="font-display text-lg font-bold tracking-tight text-white">
          PolyGlot<span className="text-[#00F2FE]">.AI</span>
        </span>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  isActive
                    ? "bg-[#00F2FE]/10 text-[#00F2FE]"
                    : "text-[#8A8A99] hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user?.name && (
          <span className="hidden sm:inline text-[11px] text-[#8A8A99]">
            {user.name}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-sm border border-[#1F1F29] px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#8A8A99] transition-colors hover:border-[#00F2FE]/50 hover:text-[#00F2FE]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;