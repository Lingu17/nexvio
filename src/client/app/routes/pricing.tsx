import { CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import type { Route } from "../+types/root";
import PageShell from "~/components/page-shell";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Pricing | Nexvio" }];
}

const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "For quick practice and first-time users",
    features: ["2 interviews / month", "Resume scan", "Basic transcript", "Single report export"],
  },
  {
    name: "Pro",
    price: "$19",
    detail: "For serious candidates preparing weekly",
    features: [
      "Unlimited interviews",
      "Advanced analytics",
      "AI coach feedback",
      "PDF exports",
      "Settings sync",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$79",
    detail: "For training cells, bootcamps, and placement teams",
    features: [
      "Team dashboard",
      "Shared analytics",
      "Interview libraries",
      "Admin seats",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <PageShell
        eyebrow="Pricing"
        title="Simple plans for practice, growth, and teams"
        description="A real SaaS needs pricing clarity. These tiers make the product feel complete while matching the coaching and analytics depth already in the app."
      >
        <div className="grid gap-8 pb-12 items-stretch" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-[2rem] border p-8 backdrop-blur-2xl transition-all hover:-translate-y-1 ${plan.featured
                ? "border-violet-400/40 bg-gradient-to-b from-violet-500/15 to-cyan-500/10 shadow-[0_0_40px_rgba(139,92,246,0.18)]"
                : plan.name === "Enterprise"
                  ? "border-white/5 bg-[#030812]"
                  : "border-white/10 bg-transparent"
                }`}
            >
              {plan.featured ? (
                <div className="mb-4 inline-flex self-start items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-violet-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Most popular
                </div>
              ) : <div className="mb-4 h-6"></div>}
              <h2 className="text-3xl font-black text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-gray-400 min-h-[40px]">{plan.detail}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="pb-2 text-gray-500">/ month</span>
              </div>
              <div className="mt-8 space-y-4 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-200">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-bold transition-all ${plan.featured
                  ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-[0_0_30px_rgba(96,165,250,0.28)] hover:-translate-y-1"
                  : "border border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:-translate-y-1"
                  }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </PageShell>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0f172a] to-[#07111f] p-10 text-center shadow-[0_0_50px_rgba(96,165,250,0.15)] relative overflow-hidden transition-all transform scale-100 opacity-100">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-cyan-500 to-violet-500"></div>

            <h2 className="text-3xl font-black text-white mb-4">Pricing Coming Soon</h2>

            <p className="text-gray-300 text-base leading-relaxed mb-6">
              We’re truly happy that you’re interested in our platform ❤️<br /><br />
              Our pricing plans are currently being finalized to give you the best possible experience at the most affordable pricing.<br /><br />
              Thank you for supporting us early and believing in our journey. We’ll be launching our plans very soon.<br /><br />
              <span className="font-bold text-cyan-300">Stay connected with us 🚀</span>
            </p>

            <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest font-semibold">
              Early supporters will receive exclusive benefits and priority access.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Back to Home
              </button>
              <Link
                to="/contact"
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white transition hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5"
              >
                Notify Me
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
