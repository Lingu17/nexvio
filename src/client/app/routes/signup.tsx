import { CheckCircle, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import type { Route } from "../+types/root";
import PageShell from "~/components/page-shell";
import { useMockApp } from "~/lib/mock-app";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Signup | Nexvio" }];
}

export default function Signup() {
  const [name, setName] = useState("Lingraj");
  const [email, setEmail] = useState("lingraj@example.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUpWithPassword, signInWithOAuth, authError, isSupabaseEnabled } = useMockApp();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[520px] px-4 py-12">
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.34em] text-cyan-300/80">Get Started</p>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Create your workspace</h1>
        <p className="mt-4 text-base text-gray-400">Join Nexvio to start practicing for your next interview.</p>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-emerald-300" />
            Gmail sign-in is connected through the Nexvio onboarding flow.
          </div>
        </div>
        <div className="space-y-5 text-left">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-300">Name</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3">
              <User className="h-4 w-4 text-cyan-300" />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-300">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3">
              <Mail className="h-4 w-4 text-violet-300" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-300">Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3">
              <User className="h-4 w-4 text-cyan-300" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
          </label>
        </div>
        <button
          onClick={async () => {
            setSubmitting(true);
            try {
              await signUpWithPassword(name, email, password);
              navigate("/dashboard");
            } finally {
              setSubmitting(false);
            }
          }}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(96,165,250,0.28)]"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <div className="mt-4">
          <button
            onClick={() => void signInWithOAuth("google")}
            className="w-full rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Continue with Gmail
          </button>
        </div>
        {authError ? <p className="mt-4 text-sm text-rose-300 text-center">{authError}</p> : null}
        {!isSupabaseEnabled ? (
          <p className="mt-4 text-sm text-amber-300 text-center">
            Supabase keys are not configured yet, so signup falls back to local demo behavior.
          </p>
        ) : null}
        <div className="mt-5 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:text-cyan-300">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
