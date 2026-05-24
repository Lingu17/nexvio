import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef } from "react";
import {
  CheckCircle,
  Lightbulb,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Nexvio | About us" }];
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      containerRef.current.style.setProperty("--x", `${e.clientX}px`);
      containerRef.current.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A14] text-gray-50 font-sans relative overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Mouse Glow */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300" style={{ background: "radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(120,90,255,0.08), transparent 40%)" }} />
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-[1400px] mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-semibold tracking-wide mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Our Vision</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6 text-white">
              Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Interview Prep</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-2xl mx-auto">
              We're revolutionizing interview preparation through enterprise-grade AI-powered analysis, transforming candidate anxiety into unshakeable confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">
                Democratizing Career Success
              </h2>
              <div className="space-y-6 text-base md:text-lg font-medium text-gray-400 leading-relaxed mb-8">
                <p>
                  We believe everyone deserves the opportunity to present their best self during interviews. The days of practicing in front of a mirror with zero feedback are over.
                </p>
                <p>
                  Through advanced computer vision and natural language processing, we help candidates identify blind spots, correct posture imbalances, and eliminate filler words before the real interview happens.
                </p>
              </div>
              <ul className="space-y-4">
                {["Objective, data-driven feedback", "Real-time posture and tone tracking", "Accessible to everyone, everywhere"].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

              {[
                { icon: Target, title: "Precision", desc: "Granular AI analysis for accurate, micro-level feedback.", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
                { icon: Users, title: "Accessibility", desc: "Built to support candidates from all backgrounds.", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
                { icon: Trophy, title: "Excellence", desc: "Enterprise-grade algorithms committed to quality.", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
                { icon: Lightbulb, title: "Innovation", desc: "Pushing the boundaries of what browser AI can do.", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:bg-white/[0.04] transition-all duration-300 ease-out hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] group relative overflow-hidden"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 transition-transform duration-300 group-hover:scale-110 ${card.bg} ${card.border}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">Built by Builders</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The engineering mind pushing the boundaries of AI web technologies.
            </p>
          </motion.div>
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] max-w-sm backdrop-blur-[18px] relative group overflow-hidden hover:bg-white/[0.04] transition-all duration-300 ease-out hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <div className="relative mb-6 mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-[spin_4s_linear_infinite] group-hover:border-purple-400 transition-colors"></div>
                <div className="absolute inset-2 rounded-full border-2 border-blue-500/30 animate-[spin_3s_linear_infinite_reverse] group-hover:border-blue-400 transition-colors"></div>
                <img
                  src="https://avatars.githubusercontent.com/u/89966270?v=4"
                  alt="Lingraj Malipatil"
                  className="w-full h-full rounded-full object-cover relative z-10 border-4 border-[#0B1020]"
                />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1 text-white">Lingraj Malipatil</h3>
                <p className="text-purple-400 font-semibold text-sm tracking-wide uppercase mb-6">Software Engineer</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Software Engineer specializing in AI-powered applications, full-stack systems, and scalable SaaS products. Focused on React, TypeScript, AI integrations, backend architecture, and interview intelligence systems.
                </p>
                <div className="inline-flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">TypeScript</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">React</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">Next.js</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">AI Systems</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
