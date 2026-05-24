import { motion } from "framer-motion";
import {
  Activity,
  Award,
  Brain,
  CheckCircle,
  ChevronRight,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { Route } from "../+types/root";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Nexvio | Home" },
    {
      name: "description",
      content:
        "Get personalized feedback on your interview performance through advanced video analysis",
    },
  ];
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      containerRef.current.style.setProperty('--x', `${e.clientX}px`);
      containerRef.current.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A14] text-gray-50 font-sans relative overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Mouse Glow */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300" style={{ background: 'radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(120,90,255,0.08), transparent 40%)' }} />
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-semibold tracking-wide mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time AI Interview Coach</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-6 text-white">
              Ace Interviews<br />with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Real-Time AI
              </span> Feedback
            </h1>
            <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-xl mb-10">
              Analyze posture, confidence, speech clarity, eye contact, and communication skills using advanced AI-powered video intelligence.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                to="/live-interview"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition-all duration-300"
              >
                Start Mock Interview
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all duration-300 flex items-center group"
              >
                See Live Demo <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="flex items-center gap-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-xl md:text-2xl font-black text-white">Real-time AI</p>
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">Powered Feedback</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/10"></div>
              <div>
                <p className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  MediaPipe <span className="text-purple-400">+</span> Whisper <span className="text-blue-400">+</span> GPT
                </p>
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">Enterprise Stack</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative mt-12 lg:mt-0 group"
          >
            {/* Purple Glow Depth Effect Behind Dashboard */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            {/* Main Dashboard Card */}
            <div className="relative z-10 bg-[#0A0A14]/60 backdrop-blur-[18px] border border-white/5 rounded-2xl p-6 shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out hover:-translate-y-[6px]">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-500 ml-2">Live Analysis Dashboard</span>
                </div>
                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>

              <div className="space-y-4">
                {/* Realistic Webcam UI Mock */}
                <div className="w-full h-48 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group bg-[#111827]">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                    alt="Webcam Feed"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14] via-transparent to-transparent"></div>

                  {/* Facial Tracking Box Overlay */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[15%] left-[40%] w-20 h-24 border border-emerald-400/50 rounded-lg flex items-start justify-between p-1">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  </motion.div>

                  {/* Realistic Transcript Overlay */}
                  <div className="absolute top-3 left-3 right-3 text-[10px] font-medium text-white/90 bg-[#0A0A14]/70 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-lg leading-relaxed">
                    <span className="text-blue-400 font-bold">Interviewer:</span> Can you describe a complex problem you solved? <br />
                    <span className="text-purple-400 font-bold">You:</span> Yes, in my last role I optimized a React rendering bottleneck...
                  </div>

                  {/* Waveform and Live Status */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="bg-[#0A0A14]/80 backdrop-blur-md px-2.5 py-1.5 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Analyzing Posture
                    </div>
                    <div className="flex gap-0.5 items-end h-6 bg-[#0A0A14]/80 backdrop-blur-md p-1.5 rounded-md border border-white/10">
                      {[40, 80, 60, 100, 50, 70, 30].map((height, i) => (
                        <motion.div key={i} animate={{ height: ["20%", `${height}%`, "20%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }} className="w-1 bg-blue-400 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fake Metric Cards inside dashboard */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Confidence Score</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-white">94%</p>
                      <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div className="w-[94%] h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Eye Contact</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-white">88%</p>
                      <CheckCircle className="w-4 h-4 text-purple-400 mb-1" />
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div className="w-[88%] h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decoration Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 top-12 bg-[#111827] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Clear Speech</p>
                  <p className="text-xs text-gray-400">0 filler words</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-8 bottom-20 bg-[#111827] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AI Emotion</p>
                  <p className="text-xs text-gray-400">Confident, Calm</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Beyond Simple Recording</h2>
            <p className="text-gray-400 text-lg">We don't just record your answers. We analyze every micro-expression, vocal tone, and posture shift to give you human-like feedback.</p>
          </div>

          {/* Alternating Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 mb-6 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <Video className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Real-Time Posture & Eye Contact</h3>
              <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed mb-8">
                Our computer vision models track 17 key body points and facial landmarks to ensure you maintain perfect alignment, strong eye contact, and professional body language throughout the session.
              </p>
              <ul className="space-y-4">
                {["Spinal alignment tracking", "Distraction/look-away detection", "Nervous movement alerts"].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-[18px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <div className="w-full h-72 bg-[#0B1020] rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-purple-500/50 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <Users className="w-16 h-16 text-purple-400 relative z-10 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
              </div>
            </motion.div>
          </div>

          {/* Alternating Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-[18px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out order-2 lg:order-1">
              <div className="w-full h-72 bg-[#0B1020] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-end p-6 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
                {/* Bar chart mock */}
                <div className="flex items-end gap-3 h-48 relative z-10 w-full max-w-sm mx-auto">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-md shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-1 lg:order-2">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 mb-6 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                <Brain className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Vocal Analytics & Tone Profiling</h3>
              <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed mb-8">
                Identify filler words, measure speaking speed, and analyze emotional undertones. Our AI tells you exactly when you sounded confident and when hesitation crept in.
              </p>
              <ul className="space-y-4">
                {["Filler word frequency analysis", "Speech clarity & pace (WPM)", "Confidence timeline graphs"].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Trusted by Top Candidates</h2>
            <p className="text-gray-400 text-lg">See how our AI coach is helping candidates land offers at leading tech companies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The real-time posture feedback was a game-changer. I didn't realize how much I was slouching until the AI pointed it out. Landed my dream role at Google!",
                name: "Sarah Chen",
                role: "Frontend Engineer",
                company: "Google"
              },
              {
                quote: "I always struggled with rambling during behavioral rounds. The speech pace and filler word analytics helped me tighten my answers significantly.",
                name: "Marcus Rodriguez",
                role: "Product Manager",
                company: "Stripe"
              },
              {
                quote: "Felt like having a mock interview with a real recruiter. The emotional tone profiling gave me confidence that I was projecting the right energy.",
                name: "Priya Patel",
                role: "Data Scientist",
                company: "Amazon"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-[18px] hover:bg-white/[0.04] transition-all duration-300 ease-out hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] relative group flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-16 h-16 text-purple-400" />
                </div>
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-8 relative z-10 font-medium">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{testimonial.name}</p>
                    <p className="text-purple-400 font-semibold text-xs tracking-wide uppercase mt-0.5">{testimonial.role} <span className="text-gray-500 font-normal normal-case">@ {testimonial.company}</span></p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3"></div>

            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight relative z-10">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of candidates who have transformed their interview performance using our enterprise-grade AI insights.
            </p>
            <Link
              to="/analysis"
              className="px-10 py-5 bg-white text-[#0B1020] rounded-full font-black text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 inline-block relative z-10"
            >
              Start Your Free Analysis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
