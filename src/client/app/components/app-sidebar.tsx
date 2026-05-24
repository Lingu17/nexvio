import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  Tag,
  Upload,
  UserRoundSearch,
} from "lucide-react";
import { Link, useLocation } from "react-router";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/live-interview", label: "Live Coach", icon: Sparkles },
  { to: "/analysis", label: "Upload", icon: Upload },
  { to: "/resume-analyzer", label: "ATS Analyzer", icon: UserRoundSearch },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/history", label: "Interview History", icon: History },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/pricing", label: "Pricing", icon: Tag },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 border-r border-white/8 bg-[#07111f]/95 backdrop-blur-3xl transition-all duration-300 lg:relative lg:flex lg:flex-col lg:translate-x-0 ${collapsed ? "-translate-x-full lg:w-[88px]" : "translate-x-0 w-[280px]"
        }`}
    >
      <div className="flex h-[72px] items-center justify-between border-b border-white/8 px-4">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_30px_rgba(96,165,250,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-lg font-black tracking-tight text-white">Nexvio</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">Interview OS</p>
            </div>
          ) : null}
        </Link>
        <button
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 transition hover:bg-white/[0.08]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${active
                  ? "border-violet-400/25 bg-violet-500/12 text-white shadow-[0_0_30px_rgba(139,92,246,0.14)]"
                  : "border-transparent text-gray-400 hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
                }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/8 px-4 py-4 text-xs text-gray-500">
        {!collapsed ? (
          <>
            <p className="font-bold uppercase tracking-[0.22em] text-cyan-300/70">Realtime Processing Active</p>
            <p className="mt-2">Nexvio AI Interview OS</p>
            <p className="mt-1">v1.2.4</p>
          </>
        ) : (
          <div className="mx-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
        )}
      </div>
    </aside>
  );
}
