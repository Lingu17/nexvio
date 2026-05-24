import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Link } from "react-router";

const linkGroups = [
  {
    title: "Product",
    links: [
      { to: "/pricing", label: "Pricing" },
      { to: "/live-interview", label: "AI Coach" },
      { to: "/analysis", label: "Mock Interviews" },
      { to: "/resume-analyzer", label: "Resume Scanner" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/architecture", label: "Architecture" },
      { to: "/contact", label: "Contact" },
      { to: "/careers", label: "Careers" },
      { to: "/story", label: "Story" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/cookies", label: "Cookies" },
      { to: "/status", label: "Status" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#040914] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-md">
            <p className="text-2xl font-black tracking-tight">Nexvio</p>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              Interview coaching that feels live, measurable, and product-grade.
              Practice with AI, review every answer, and improve with weekly trends.
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300/80">
                Newsletter
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3">
                <Mail className="h-4 w-4 text-cyan-300" />
                <span className="text-sm text-gray-300">team@nexvio.ai</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Product updates, interview prompts, and release notes. Version `v2.6.0`.
              </p>
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gray-500">
                {group.title}
              </p>
              <div className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block text-sm text-gray-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/8 pt-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexvio. Built for real interview prep.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/LingrajMalipatil"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
