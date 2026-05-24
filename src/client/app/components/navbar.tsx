import { Brain, ChevronDown, LogOut, Menu, Settings, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useMockApp } from "~/lib/mock-app";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pricing", label: "Pricing" },
  { to: "/architecture", label: "Architecture" },
  { to: "/analysis", label: "Upload" },
  { to: "/live-interview", label: "Live Coach" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useMockApp();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const ctaLabel = useMemo(
    () => (user.authenticated ? "Open Dashboard" : "Get Started"),
    [user.authenticated]
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className={`mx-auto max-w-[1440px] rounded-[1.6rem] border transition-all duration-300 ${isScrolled
            ? "border-white/10 bg-[#08111e]/82 py-3 shadow-[0_18px_60px_rgba(3,7,18,0.42)] backdrop-blur-2xl"
            : "border-white/6 bg-[#08111e]/62 py-4 backdrop-blur-xl"
          }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_30px_rgba(96,165,250,0.35)]">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">Nexvio</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">
                AI Interview OS
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {primaryLinks.map((link) => {
              const active =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${active
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/6 hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {user.authenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(96,165,250,0.28)] transition hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Open Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((open) => !open)}
                    className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-black">
                      {user.avatar}
                    </span>
                    {user.name.split(" ")[0]}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {profileOpen ? (
                    <div className="absolute right-0 top-14 w-56 rounded-[1.4rem] border border-white/10 bg-[#08111e] p-2 shadow-[0_18px_60px_rgba(3,7,18,0.42)]">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-gray-200 transition hover:bg-white/6"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-rose-200 transition hover:bg-white/6"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/20 hover:bg-white/6"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(96,165,250,0.28)] transition hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {ctaLabel}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen ? (
          <div className="px-4 pb-4 pt-4 lg:hidden sm:px-6">
            <div className="space-y-2 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-3">
              {primaryLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/6"
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {user.authenticated ? (
                  <>
                    <Link
                      to="/settings"
                      className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={signOut}
                      className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      {ctaLabel}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
