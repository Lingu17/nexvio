import { Mail } from "lucide-react";
import { useState } from "react";
import type { Route } from "../+types/root";
import PageShell from "~/components/page-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Forgot Password | Nexvio" }];
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("lingraj@example.com");
  const [sent, setSent] = useState(false);

  return (
    <PageShell
      eyebrow="Recovery"
      title="Reset your password"
      description="A complete SaaS flow needs recovery states too, not just happy-path login."
    >
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-300">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3">
            <Mail className="h-4 w-4 text-cyan-300" />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </label>
        <button
          onClick={() => setSent(true)}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white"
        >
          Send reset link
        </button>
        {sent ? (
          <p className="mt-4 text-sm text-emerald-300">
            Reset email queued for {email}. This confirmation state makes the flow feel complete.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
