import type { Route } from "../+types/root";
import AuthGuard from "~/components/auth-guard";
import PageShell from "~/components/page-shell";
import { useMockApp } from "~/lib/mock-app";

export function meta({}: Route.MetaArgs) {
  return [{ title: "History | Nexvio" }];
}

export default function History() {
  const { interviews, authError, isSupabaseEnabled } = useMockApp();

  return (
    <AuthGuard>
      <PageShell
        eyebrow="Archive"
        title="Interview history"
        description="Real products keep every session reachable. This page now reflects authenticated storage and makes progress feel genuinely saved."
      >
        {authError ? (
          <div className="mb-6 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            Supabase sync issue: {authError}
          </div>
        ) : null}
        {!isSupabaseEnabled ? (
          <div className="mb-6 rounded-[1.6rem] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            Supabase is not configured yet, so interview history is using local fallback data.
          </div>
        ) : null}

        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center text-gray-400">
              No interviews yet. Upload your first interview or start a live mock round.
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-black text-white">{interview.role}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {interview.type} • {interview.date}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                    {interview.status}
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-300">{interview.summary}</p>
              </div>
            ))
          )}
        </div>
      </PageShell>
    </AuthGuard>
  );
}
