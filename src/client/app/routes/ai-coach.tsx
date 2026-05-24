import { Brain, Mic, ScanEye, Sparkles } from "lucide-react";
import type { Route } from "../+types/root";
import PageShell from "~/components/page-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "AI Coach | Nexvio" }];
}

export default function AiCoach() {
  return (
    <PageShell
      eyebrow="Coach"
      title="AI coach modes"
      description="Behavioral rounds, coding rounds, HR simulation, and system design prompts now sit together as believable product features instead of isolated ideas."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Behavioral", icon: Sparkles, copy: "STAR-based coaching with tone and structure feedback." },
          { title: "Technical", icon: Brain, copy: "Frontend and DSA prompts with confidence tracking." },
          { title: "HR Round", icon: Mic, copy: "Salary, motivation, and situational answer rehearsal." },
          { title: "System Design", icon: ScanEye, copy: "Architecture prompts with whiteboard-style evaluation." },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl"
          >
            <card.icon className="h-7 w-7 text-cyan-300" />
            <p className="mt-5 text-xl font-black text-white">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-gray-400">{card.copy}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
