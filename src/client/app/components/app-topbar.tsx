import { Bell, LogOut, Search, Settings, Menu } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useMockApp } from "~/lib/mock-app";

export default function AppTopbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, notifications, markNotificationRead, interviews, settings } = useMockApp();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: Array<{ title: string; description: string; type: string; url: string }> = [];

    // Filter interviews
    (interviews || []).forEach((item) => {
      if (
        item.role.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
      ) {
        results.push({
          title: `${item.role} (${item.type})`,
          description: `Score: ${item.score}% - ${item.summary.substring(0, 50)}...`,
          type: "Interview",
          url: `/history`,
        });
      }
    });

    // Filter PDF reports
    (settings.pdfReports || []).forEach((item) => {
      if (item.role.toLowerCase().includes(query)) {
        results.push({
          title: `PDF: ${item.role} Coaching Report`,
          description: `Score: ${item.score}% - Published ${item.date}`,
          type: "Report",
          url: item.pdfUrl,
        });
      }
    });

    // Filter Static Pages/Settings
    const pages = [
      { name: "Dashboard", path: "/dashboard", desc: "View your performance summary & analytics overview" },
      { name: "Live Interview Engine", path: "/live-interview", desc: "Start a real-time AI-powered interview" },
      { name: "Resume Analyzer", path: "/resume-analyzer", desc: "Upload and analyze your resume for improvements" },
      { name: "AI Coach", path: "/ai-coach", desc: "Chat with your personalized AI career coach" },
      { name: "Settings", path: "/settings", desc: "Configure webcam, voice, themes, and notification profiles" },
      { name: "Interview History", path: "/history", desc: "Browse previous interview sessions and stats" },
      { name: "Pricing", path: "/pricing", desc: "Explore subscription plans" },
      { name: "Billing", path: "/billing", desc: "Manage billing subscriptions and invoices" },
    ];

    pages.forEach((p) => {
      if (p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)) {
        results.push({
          title: p.name,
          description: p.desc,
          type: "Page",
          url: p.path,
        });
      }
    });

    return results;
  }, [searchQuery, interviews, settings.pdfReports]);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/8 bg-[#07111f]/88 px-4 backdrop-blur-2xl sm:px-6">
      <div className="flex w-full max-w-md items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-200 transition hover:bg-white/[0.08] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interviews, reports, settings"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
          {searchQuery && (
            <div className="absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-[1.4rem] border border-white/10 bg-[#08111e] p-3 shadow-[0_18px_60px_rgba(3,7,18,0.42)] scrollbar-thin">
              <div className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Search Results
              </div>
              <div className="space-y-1">
                {searchResults.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">No matches found</p>
                ) : (
                  searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery("");
                        if (result.url.startsWith("http")) {
                          window.open(result.url, "_blank");
                        } else {
                          window.location.href = result.url;
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/5 cursor-pointer"
                    >
                      <div>
                        <p className="font-semibold text-white">{result.title}</p>
                        <p className="text-xs text-gray-400">{result.description}</p>
                      </div>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {result.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-200 transition hover:bg-white/[0.08]"
          >
            <Bell className="h-4 w-4" />
            {notifications.some((n) => n.unread) ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="absolute right-0 top-14 w-80 rounded-[1.4rem] border border-white/10 bg-[#08111e] p-3 shadow-[0_18px_60px_rgba(3,7,18,0.42)]">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-sm font-semibold text-white">Notifications</p>
                <button
                  onClick={() => notifications.forEach((n) => markNotificationRead(n.id))}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">No new notifications</p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`cursor-pointer rounded-2xl border border-white/5 p-3 transition hover:bg-white/5 ${
                        item.unread ? "bg-white/[0.03]" : "bg-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        {item.unread && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{item.body}</p>
                      <p className="mt-2 text-[10px] text-gray-500">{item.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-1.5 text-left"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-white">
              {user.avatar}
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email || "Signed in"}</p>
            </div>
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-14 w-56 rounded-[1.4rem] border border-white/10 bg-[#08111e] p-2 shadow-[0_18px_60px_rgba(3,7,18,0.42)]">
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-gray-200 transition hover:bg-white/6"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={async () => {
                  await signOut();
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
      </div>
    </header>
  );
}
