import { BellRing } from "lucide-react";
import type { Route } from "../+types/root";
import PageShell from "~/components/page-shell";
import { useMockApp } from "~/lib/mock-app";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Notifications | Nexvio" }];
}

export default function Notifications() {
  const { notifications, markNotificationRead } = useMockApp();

  return (
    <PageShell
      eyebrow="Inbox"
      title="Product notifications"
      description="This handles reminders, coaching alerts, saved transcript confirmations, and weekly summary nudges."
    >
      <div className="space-y-4">
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`block w-full rounded-[2rem] border p-6 text-left backdrop-blur-2xl ${
              item.unread
                ? "border-cyan-400/20 bg-cyan-400/8"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-cyan-300" />
                  <p className="text-lg font-black text-white">{item.title}</p>
                </div>
                <p className="mt-3 text-sm text-gray-300">{item.body}</p>
              </div>
              <span className="text-sm text-gray-500">{item.time}</span>
            </div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
