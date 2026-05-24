import { Download, FileText } from "lucide-react";
import type { Route } from "../+types/root";
import AuthGuard from "~/components/auth-guard";
import PageShell from "~/components/page-shell";
import { useMockApp } from "~/lib/mock-app";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Reports | Nexvio" }];
}

export default function Reports() {
  const { interviews, authError, isSupabaseEnabled } = useMockApp();
  const completed = interviews.filter((item) => item.status !== "Scheduled");

  return (
    <AuthGuard>
      <PageShell
        eyebrow="Reports"
        title="AI-generated summaries and exports"
        description="Your saved interview summaries now live behind authenticated product routes and are ready for database-backed report expansion."
      >
        {authError ? (
          <div className="mb-6 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            Supabase sync issue: {authError}
          </div>
        ) : null}
        {!isSupabaseEnabled ? (
          <div className="mb-6 rounded-[1.6rem] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            Supabase is not configured yet, so reports are being shown from local fallback state.
          </div>
        ) : null}

        {completed.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center text-gray-400">
            No reports yet. Complete an interview and Nexvio will save a report here.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {completed.map((interview) => (
              <div
                key={interview.id}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between">
                  <FileText className="h-6 w-6 text-cyan-300" />
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
                <p className="mt-4 text-xl font-black text-white">{interview.role}</p>
                <p className="mt-1 text-sm text-gray-400">{interview.date}</p>
                <p className="mt-4 text-sm text-gray-300">{interview.summary}</p>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    </AuthGuard>
  );
}
