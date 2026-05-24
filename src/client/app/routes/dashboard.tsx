import {
  Activity,
  ArrowUpRight,
  CheckCircle,
  CircleAlert,
  Download,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Route } from "../+types/root";
import { Link } from "react-router";
import AuthGuard from "~/components/auth-guard";
import PageShell from "~/components/page-shell";
import { useToast } from "~/components/toast-provider";
import { useMockApp } from "~/lib/mock-app";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard | Nexvio" }];
}

const weeklyData = [
  { day: "Mon", score: 74, confidence: 70 },
  { day: "Tue", score: 78, confidence: 76 },
  { day: "Wed", score: 81, confidence: 79 },
  { day: "Thu", score: 83, confidence: 82 },
  { day: "Fri", score: 88, confidence: 85 },
  { day: "Sat", score: 90, confidence: 88 },
];

const confidenceFlow = [
  { label: "Intro", value: 72 },
  { label: "Problem", value: 84 },
  { label: "Action", value: 91 },
  { label: "Impact", value: 87 },
];

export default function Dashboard() {
  const { interviews, notifications, user, authError, isSupabaseEnabled, settings } = useMockApp();
  const { toast } = useToast();
  const completedInterviews = interviews.filter((item) => item.status === "Completed");
  const latest = completedInterviews[0];
  const averageScore = completedInterviews.length
    ? Math.round(completedInterviews.reduce((total, item) => total + item.score, 0) / completedInterviews.length)
    : 0;
  const averageFillers = completedInterviews.length
    ? (
        completedInterviews.reduce((total, item) => total + item.fillerWords, 0) /
        completedInterviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <AuthGuard>
      <PageShell
        eyebrow="Control Center"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Your interview operating system now has authenticated product behaviors: Supabase-backed sessions, settings sync, saved interview history, and report-ready analytics."
      >
        {authError ? (
          <div className="mb-6 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            Supabase sync issue: {authError}
          </div>
        ) : null}
        {!isSupabaseEnabled ? (
          <div className="mb-6 rounded-[1.6rem] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            Supabase is not configured yet, so dashboard data is running in local fallback mode.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cyan-300">Weekly improvement</p>
                <h2 className="mt-2 text-2xl font-black text-white">Confidence is trending upward</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
                <TrendingUp className="h-4 w-4" />
                +12% this week
              </div>
            </div>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="dashboardScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.55)" }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#08111e",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#dashboardScore)" strokeWidth={3} />
                  <Line type="monotone" dataKey="confidence" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-300">Live activity</p>
                <h2 className="mt-2 text-2xl font-black text-white">Startup-like signals</h2>
              </div>
              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
            </div>
            <div className="mt-6 space-y-3">
              {[
                "12,084 candidates practiced this month",
                "React technical rounds are up 18% this week",
                "Recruiter mode was used 431 times today",
                "Avg. session length: 14m 22s",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-[#08111e]/80 px-4 py-3 text-sm text-gray-300">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Active streak</p>
              <div className="mt-3 flex items-center gap-3">
                <Flame className="h-7 w-7 text-amber-300" />
                <p className="text-xl font-black text-white">6 day practice streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Recent interviews", value: `${completedInterviews.length}`, icon: Activity },
            { label: "Average score", value: `${averageScore} / 100`, icon: Target },
            { label: "Filler words", value: `${averageFillers} avg`, icon: CircleAlert },
            { label: "Export reports", value: `${settings.pdfReports?.length || 0} Reports`, icon: Download },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
              <item.icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-4 text-sm text-gray-400">{item.label}</p>
              <p className="mt-1 text-3xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-300">Recent interviews</p>
                <h2 className="mt-2 text-2xl font-black text-white">Session history</h2>
              </div>
              <button 
                onClick={() => {
                  const reports = settings.pdfReports || [];
                  if (reports.length > 0) {
                    window.open(reports[reports.length - 1].pdfUrl, "_blank");
                  } else {
                    toast("No exported PDF reports available. Start an interview to generate one.", "info");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 cursor-pointer"
              >
                Download Latest PDF
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {interviews.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-gray-400">
                  No interviews saved yet. Run a live round and Nexvio will store it in your history.
                </div>
              ) : (
                interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="grid gap-3 rounded-[1.6rem] border border-white/8 bg-[#08111e]/85 p-4 md:grid-cols-[1.1fr_0.7fr_0.6fr]"
                  >
                    <div>
                      <p className="text-lg font-bold text-white">{interview.role}</p>
                      <p className="text-sm text-gray-400">
                        {interview.type} • {interview.date}
                      </p>
                      <p className="mt-2 text-sm text-gray-300">{interview.summary}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Score</p>
                        <p className="text-xl font-black text-white">
                          {interview.status === "Scheduled" ? "--" : interview.score}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Status</p>
                        <p className="text-sm font-bold text-cyan-300">{interview.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center md:justify-end gap-2">
                      {settings.pdfReports?.some((r) => r.interviewId === interview.id) && (
                        <button
                          onClick={() => {
                            const rep = settings.pdfReports?.find((r) => r.interviewId === interview.id);
                            if (rep) window.open(rep.pdfUrl, "_blank");
                          }}
                          className="rounded-full bg-cyan-500/10 border border-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 cursor-pointer"
                        >
                          PDF
                        </button>
                      )}
                      <Link 
                        to="/analysis"
                        className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/6"
                      >
                        View report
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <p className="text-sm font-semibold text-cyan-300">AI suggestions</p>
              <div className="mt-4 space-y-3">
                {[
                  "Move the business result earlier in your STAR answer.",
                  "Eye contact stayed strong after the first 15 seconds. Keep that opening steadier.",
                  "Your system-design rounds score higher when you sketch the data flow first.",
                ].map((tip) => (
                  <div key={tip} className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-cyan-50">
                    <Sparkles className="mb-2 h-4 w-4 text-cyan-300" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <p className="text-sm font-semibold text-violet-300">Confidence graph</p>
              <div className="mt-5 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={confidenceFlow}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.55)" }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#08111e",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{ r: 5, fill: "#22d3ee" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <p className="text-sm font-semibold text-emerald-300">Strengths and weaknesses</p>
              {latest ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Strengths</p>
                    <div className="space-y-2">
                      {latest.strengths.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-gray-200">
                          <CheckCircle className="h-4 w-4 text-emerald-300" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-500/8 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Needs work</p>
                    <div className="space-y-2">
                      {latest.weaknesses.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-gray-200">
                          <CircleAlert className="h-4 w-4 text-amber-300" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-gray-400">
                  No completed interviews yet. Run your first session to unlock strengths and weakness tracking.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <p className="text-sm font-semibold text-violet-300">Notifications</p>
              <div className="mt-4 space-y-3">
                {notifications.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-[#08111e]/85 p-4">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
