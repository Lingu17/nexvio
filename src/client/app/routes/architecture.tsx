import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef } from "react";
import {
  Database,
  Server,
  Cpu,
  Video,
  MessageSquare,
  BarChart,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Nexvio | Architecture" }];
}

export default function Architecture() {
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
      <div className="fixed top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-[1400px] mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-semibold tracking-wide mb-6">
              <Server className="w-4 h-4" />
              <span>Under the Hood</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6 text-white">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Architecture</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Discover how our microservices pipeline processes high-definition video into real-time AI inferences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-24 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-black mb-16 text-center text-white">
              System Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block -z-10"></div>

              {[
                { title: "Video Processing", icon: Video, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", items: ["High-definition video support", "Quality validation", "Frame extraction", "Preprocessing pipeline"] },
                { title: "AI Core Analysis", icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", items: ["MediaPipe pose detection", "Facial landmark tracking", "Gesture recognition", "Behavioral classification"] },
                { title: "Audio & NLP Engine", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", items: ["Whisper Speech-to-text", "Tone & sentiment profiling", "WPM pace measurement", "Filler word detection"] }
              ].map((comp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-[18px] hover:bg-white/[0.04] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out relative group overflow-hidden"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-8 transition-transform duration-300 group-hover:scale-110 ${comp.bg} ${comp.border} shadow-lg`}>
                    <comp.icon className={`w-7 h-7 ${comp.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-white">{comp.title}</h3>
                  <ul className="space-y-4">
                    {comp.items.map((item, idx) => (
                      <li key={idx} className="flex items-start text-gray-400 text-sm">
                        <CheckCircle className={`w-4 h-4 mr-3 flex-shrink-0 mt-0.5 ${comp.color}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Flow */}
      <section className="py-32 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-20 text-center text-white">
            Technical Flow
          </h2>

          {/* Desktop Animated Pipeline Diagram */}
          <div className="relative max-w-5xl mx-auto mt-12 mb-8 hidden md:block">
            {/* Animated line connecting everything */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
            </div>

            <div className="relative flex justify-between items-center z-10">
              {[
                { icon: Video, label: "Frontend", sub: "React + WebRTC", color: "text-purple-400" },
                { icon: Server, label: "Transport", sub: "Socket Streams", color: "text-blue-400" },
                { icon: Cpu, label: "AI Engine", sub: "MediaPipe/Whisper", color: "text-emerald-400" },
                { icon: BarChart, label: "Analytics", sub: "Vector Processing", color: "text-amber-400" },
                { icon: MessageSquare, label: "Feedback", sub: "GPT-4 Scoring", color: "text-rose-400" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center relative group w-32">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="w-20 h-20 rounded-2xl bg-[#0A0A14] border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center mb-4 relative group-hover:border-white/30 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(120,90,255,0.2)]"
                  >
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </motion.div>
                  <span className="text-sm font-bold text-white tracking-wide text-center">{step.label}</span>
                  <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase text-center mt-1">{step.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Vertical Pipeline View */}
          <div className="flex md:hidden flex-col gap-8 relative max-w-sm mx-auto mt-10">
            <div className="absolute left-[39px] top-0 w-1 h-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-full h-1/3 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
              />
            </div>
            {[
              { icon: Video, label: "Frontend", sub: "React + WebRTC", color: "text-purple-400" },
              { icon: Server, label: "Transport", sub: "Socket Streams", color: "text-blue-400" },
              { icon: Cpu, label: "AI Engine", sub: "MediaPipe/Whisper", color: "text-emerald-400" },
              { icon: BarChart, label: "Analytics", sub: "Vector Processing", color: "text-amber-400" },
              { icon: MessageSquare, label: "Feedback", sub: "GPT-4 Scoring", color: "text-rose-400" }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-[#0A0A14] border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex-shrink-0 flex items-center justify-center">
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white tracking-wide">{step.label}</span>
                  <span className="block text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-24 relative z-10 mb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center text-white">
            Core Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Frontend Engineering",
                items: [
                  "React 18 Concurrent Features",
                  "Framer Motion Physics Animation",
                  "Tailwind CSS with Glassmorphism",
                  "WebRTC Media Streams"
                ]
              },
              {
                title: "AI / ML Pipelines",
                items: [
                  "TensorFlow.js / MediaPipe",
                  "OpenAI GPT-4 Turbo Integration",
                  "Local Python Microservices",
                  "WebSockets for Real-Time State"
                ]
              }
            ].map((spec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#111827] to-[#0B1020] p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Database className="w-24 h-24 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-8 text-white relative z-10">{spec.title}</h3>
                <ul className="space-y-4 relative z-10">
                  {spec.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-300 font-medium">
                      <ArrowRight className="w-5 h-5 text-purple-400 mr-3 opacity-70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
