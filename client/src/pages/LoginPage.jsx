import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext.jsx";
import { emailLogin, register, googleLogin } from "../services/authService.js";

function LoginPage() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Email is required");
    }

    if (!password) {
      return toast.error("Password is required");
    }

    if (isSignUp && !name) {
      return toast.error("Name is required");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const result = isSignUp
        ? await register(name, email, password)
        : await emailLogin(email, password);

      login(result.token, result.user);

      toast.success(
        isSignUp
          ? `Welcome, ${result.user.name}!`
          : `Welcome back, ${result.user.name}!`
      );

      navigate("/");
    } catch (error) {
      toast.error("An error occurred while processing your request");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse.credential);
      login(result.token, result.user);

      toast.success(`Welcome, ${result.user.name}!`);
      navigate("/");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-[#E4E4E7] font-mono relative flex items-center justify-center px-6 py-16 overflow-hidden">
      {/* ambient grid + glow, consistent with Part 1 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 30% 20%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 30% 20%, black 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed -top-40 -left-40 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed -bottom-40 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(127,0,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Floating Blade Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative rounded-md p-8 border border-[#1F1F29] bg-[rgba(11,11,15,0.72)] backdrop-blur-xl">
          {/* corner brackets */}
          <span className="absolute -top-px -left-px w-[18px] h-[18px] border-t-2 border-l-2 border-[#00F2FE]" />
          <span className="absolute -top-px -right-px w-[18px] h-[18px] border-t-2 border-r-2 border-[#00F2FE]" />
          <span className="absolute -bottom-px -left-px w-[18px] h-[18px] border-b-2 border-l-2 border-[#00F2FE]" />
          <span className="absolute -bottom-px -right-px w-[18px] h-[18px] border-b-2 border-r-2 border-[#00F2FE]" />

          {/* vertical accent blade */}
          <div
            className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
            style={{
              background: "linear-gradient(to bottom, #00F2FE, #7F00FF)",
            }}
          />

          <div className="pl-4">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A99] mb-6">
              // auth_gate.{isSignUp ? "register" : "login"}()
            </p>

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full border border-[#1F1F29] bg-black flex items-center justify-center mb-3">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#54545f"
                  strokeWidth="1.6"
                >
                  <circle cx="12" cy="8" r="3.4" />
                  <path d="M4.5 20c1.4-3.6 4.4-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
                </svg>
              </div>
              <h1 className="font-semibold text-lg text-white">
                {isSignUp ? "Create your account" : "Welcome back"}
                <span className="text-[#00F2FE] animate-pulse">_</span>
              </h1>
              <p className="text-xs text-[#8A8A99] mt-1">
                {isSignUp
                  ? "Set up access to PolyGlot.AI."
                  : "Sign in to continue translating."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs mb-1.5 text-[#8A8A99]"
                  >
                    # Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full rounded-sm px-3.5 py-2.5 text-sm text-white bg-white/[0.02] border border-[#1F1F29] placeholder-[#54545f] focus:bg-black focus:border-[#00F2FE] focus:outline-none focus:ring-2 focus:ring-[#00F2FE]/20 transition-all"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs mb-1.5 text-[#8A8A99]"
                >
                  @ Email
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#54545f"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.dev"
                    className="w-full rounded-sm pl-9 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-[#1F1F29] placeholder-[#54545f] focus:bg-black focus:border-[#00F2FE] focus:outline-none focus:ring-2 focus:ring-[#00F2FE]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs mb-1.5 text-[#8A8A99]"
                >
                  🔑 Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#54545f"
                    strokeWidth="1.8"
                  >
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full rounded-sm pl-9 pr-9 py-2.5 text-sm text-white bg-white/[0.02] border border-[#1F1F29] placeholder-[#54545f] focus:bg-black focus:border-[#00F2FE] focus:outline-none focus:ring-2 focus:ring-[#00F2FE]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-wide text-[#8A8A99] hover:text-[#00F2FE] transition-colors"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-[11px] text-[#8A8A99]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-[#00F2FE] w-3.5 h-3.5"
                    />
                    remember_session
                  </label>
                  <a href="#" className="hover:text-[#00F2FE] transition-colors">
                    forgot_password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm py-2.5 text-sm font-semibold tracking-wide text-black bg-[#00F2FE] shadow-[0_0_0_1px_rgba(0,242,254,0.5),0_0_24px_rgba(0,242,254,0.35)] hover:shadow-[0_0_0_1px_rgba(0,242,254,0.8),0_0_32px_rgba(0,242,254,0.55)] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading
                  ? "PROCESSING..."
                  : isSignUp
                  ? "CREATE ACCOUNT →"
                  : "SIGN IN →"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-[#1F1F29]" />
              <span className="text-[10px] tracking-widest text-[#8A8A99]">
                OR
              </span>
              <div className="h-px flex-1 bg-[#1F1F29]" />
            </div>

            {/* Google SSO — styled wrapper around @react-oauth/google's button
                since its internal iframe can't take Tailwind classes directly */}
            <div className="google-btn-wrap w-full flex justify-center overflow-hidden rounded-sm border border-[#1F1F29] hover:border-[#00F2FE]/50 transition-colors">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Login failed. Please try again.")}
                theme="filled_black"
                shape="rectangular"
                width="336"
              />
            </div>

            <p className="text-center text-[11px] text-[#8A8A99] mt-6">
              {isSignUp ? "already_have_account? " : "new_here? "}
              <button
                type="button"
                onClick={() => setIsSignUp((v) => !v)}
                className="text-[#00F2FE] hover:underline"
              >
                {isSignUp ? "sign_in()" : "create_account()"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;