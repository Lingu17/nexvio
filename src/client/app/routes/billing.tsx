import { CreditCard, Receipt } from "lucide-react";
import type { Route } from "../+types/root";
import PageShell from "~/components/page-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Billing | Nexvio" }];
}

export default function Billing() {
  return (
    <PageShell
      eyebrow="Billing"
      title="Plan and payment details"
      description="Even in a frontend-first product, billing surfaces make the platform feel real and end-to-end."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <CreditCard className="h-6 w-6 text-cyan-300" />
          <p className="mt-5 text-2xl font-black text-white">Pro Plan</p>
          <p className="mt-2 text-sm text-gray-400">$19/month • renews on June 20, 2026</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <Receipt className="h-6 w-6 text-violet-300" />
          <p className="mt-5 text-2xl font-black text-white">Invoices</p>
          <p className="mt-2 text-sm text-gray-400">May 2026 invoice ready. Team billing can be added later.</p>
        </div>
      </div>
    </PageShell>
  );
}
