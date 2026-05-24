import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Brain,
  Camera,
  CheckCircle,
  ChevronRight,
  Info,
  Sparkles,
  TrendingUp,
  Upload,
  XCircle,
  LayoutDashboard,
  Clock,
  Trophy,
  Mic,
  Users,
  ScanEye,
  AudioWaveform,
} from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "../+types/root";
import LoadingFacts from "~/components/loading-facts";
import useInterviewAnalysisTask from "~/hooks/use-interview-analysis-task";
import usePostureAnalysisTask from "~/hooks/use-posture-analysis-task";
import { generateRandomId } from "~/utils";

interface LabelTips {
  [label: string]: string[];
}

const ALL_TIPS: LabelTips = {
  Engaged: [
    "Maintain eye contact with the camera to convey attentiveness and interest.",
    "Use positive body language to express enthusiasm and engagement.",
    "Ask thoughtful questions and actively listen to the interviewer's prompts.",
  ],
  EyeContact: [
    "Focus on looking directly into the camera for a virtual interview.",
    "Avoid excessive staring at notes or distractions in the room.",
    "Practice a balance between maintaining eye contact and natural blinking.",
  ],
  Smiled: [
    "Smile naturally and periodically throughout the interview.",
    "Practice a friendly and approachable facial expression.",
    "Be mindful of not appearing overly serious or expressionless.",
  ],
  Excited: [
    "Express genuine enthusiasm and excitement about the opportunity.",
    "Use positive and energetic language to convey your interest in the role.",
    "Share specific reasons why you are excited about the prospect of joining the company.",
  ],
  SpeakingRate: [
    "Speak at a moderate pace to ensure clarity and comprehension.",
    "Practice using pauses strategically to emphasize key points.",
    "Avoid speaking too rapidly, which can be challenging for the interviewer to follow.",
  ],
  NoFillers: [
    "Minimize the use of filler words such as 'um,' 'uh,' or 'like.'",
    "Practice pausing instead of using fillers to gather thoughts.",
    "Consciously focus on speaking with clarity and precision.",
  ],
  Friendly: [
    "Project a warm and approachable tone throughout the conversation.",
    "Use positive language and expressions to convey friendliness.",
    "Express genuine interest in the role and the company.",
  ],
  Paused: [
    "Use strategic pauses to allow the interviewer to process information.",
    "Avoid rushing through responses; take your time to formulate answers.",
    "Pausing can convey thoughtfulness and professionalism.",
  ],
  EngagingTone: [
    "Vary your tone to add emphasis and interest to your responses.",
    "Avoid a monotonous voice by incorporating changes in pitch and intonation.",
    "Practice conveying enthusiasm and passion through your tone.",
  ],
  StructuredAnswers: [
    "Organize your responses with a clear introduction, body, and conclusion.",
    "Use examples and anecdotes to illustrate your points.",
    "Practice concise and focused answers to showcase your communication skills.",
  ],
  Calm: [
    "Practice mindfulness techniques to stay calm and composed.",
    "Breathe deeply to manage nervousness and stress.",
    "Remember that it's okay to take a moment to collect your thoughts.",
  ],
  NotStressed: [
    "Prioritize self-care before the interview to reduce stress levels.",
    "Prepare thoroughly to build confidence in your knowledge and abilities.",
    "Focus on the present moment and the opportunity to showcase your skills.",
  ],
  Focused: [
    "Demonstrate active listening by fully engaging with the interviewer's questions.",
    "Maintain a clear and concise focus on relevant details in your responses.",
    "Avoid distractions and stay present throughout the interview.",
  ],
  NotAwkward: [
    "Practice common interview scenarios to build confidence.",
    "Maintain professional and confident body language.",
    "Remember that it's okay to acknowledge nerves and redirect them into positive energy.",
  ],
};

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Nexvio | Analysis" }];
}

export default function Analysis() {
  // Setup hooks for both analysis types
  const postureAnalysis = usePostureAnalysisTask();
  const interviewAnalysis = useInterviewAnalysisTask();

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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Reset both analyses
      postureAnalysis.reset();
      interviewAnalysis.reset();

      // Start both analyses simultaneously
      postureAnalysis.startAnalysis(file);
      interviewAnalysis.startAnalysis(file);
    },
    [postureAnalysis, interviewAnalysis]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxFiles: 1,
  });

  const areAllAnalysesComplete =
    postureAnalysis.state === "complete" &&
    interviewAnalysis.state === "complete";

  const hasAnyError =
    postureAnalysis.state === "error" || interviewAnalysis.state === "error";

  const resetAll = () => {
    postureAnalysis.reset();
    interviewAnalysis.reset();
  };

  const renderUploadSection = () => {
    if (
      postureAnalysis.state !== "idle" &&
      interviewAnalysis.state !== "idle" &&
      !hasAnyError
    ) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid min-h-[calc(100vh-80px)] grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
      >
        <div className="flex flex-col justify-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Video Intelligence</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[1.02]">
            AI-Powered Mock Interviews
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              With Real-Time Analysis
            </span>
          </h1>
          <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-xl">
            Analyze posture, confidence, speech clarity, eye contact, and communication skills using advanced video intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {["GPT-4", "Whisper", "MediaPipe", "TensorFlow"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-300"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-[18px] shadow-[0_0_30px_rgba(124,58,237,0.08)]">
              <p className="text-sm font-bold text-white">Real-Time Feedback</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Live coaching on posture, delivery, and confidence as your interview plays.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-[18px] shadow-[0_0_30px_rgba(59,130,246,0.08)]">
              <p className="text-sm font-bold text-white">MediaPipe + GPT</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Multimodal analysis combines body tracking, speech intelligence, and final scoring.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: AudioWaveform,
                title: "AI Speech",
                text: "Detect filler words, clarity, and speaking pace.",
                color: "text-purple-300",
                bg: "bg-purple-500/12",
              },
              {
                icon: ScanEye,
                title: "Eye Track",
                text: "Measure eye contact and focus consistency.",
                color: "text-blue-300",
                bg: "bg-blue-500/12",
              },
              {
                icon: Brain,
                title: "Tone AI",
                text: "Surface confidence, calmness, and emotional flow.",
                color: "text-emerald-300",
                bg: "bg-emerald-500/12",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-[18px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${card.bg} border border-white/10`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-sm font-bold text-white">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-10 translate-y-5 group lg:mt-10">
          <div className="absolute inset-[-8%] rounded-[2.5rem] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.26),transparent_58%)] blur-3xl opacity-80" />
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
          <div
            {...getRootProps()}
            className={`relative flex flex-col items-center justify-center overflow-hidden border-2 border-dashed rounded-[2rem] p-10 md:p-12 cursor-pointer transition-all duration-300 ease-out bg-[#0A0A14]/70 backdrop-blur-[22px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)]
              ${isDragActive
                ? "border-purple-500 bg-purple-500/10"
                : "border-white/10 hover:border-purple-500/50 hover:bg-white/[0.02]"
              }`}
          >
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/8 to-transparent" />
            <input {...getInputProps()} />
            <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner transition-transform duration-300 group-hover:scale-110">
              <Upload className="h-10 w-10 text-purple-400" />
            </div>
            <div className="relative z-10 mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                <Camera className="h-3.5 w-3.5" />
                Ready for analysis
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">Upload your session</h3>
              <p className="max-w-sm text-center leading-relaxed text-gray-400">
              Drag & drop your interview video here, or click to select a file from your computer.
              </p>
            </div>
            <div className="relative z-10 grid w-full gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-[#0B1020]/60 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">Supported</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">MP4</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">MOV</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">AVI</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#0B1020]/60 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">Recent uploads</p>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>frontend-mock-round.mp4</span>
                    <span className="text-gray-500">14m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>behavioral-practice.mov</span>
                    <span className="text-gray-500">yesterday</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-3 text-xs font-medium text-gray-500">
              <Mic className="h-4 w-4 text-blue-400" />
              Speech, posture, eye contact, and behavioral analytics generated in one pass.
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAnalysisState = (
    title: string,
    state: string,
    uploadProgress: number,
    error: string | null
  ) => {
    switch (state) {
      case "uploading":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] w-full"
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-gray-400 text-sm">Encrypting & uploading data...</p>
              </div>
            </div>
            <div className="w-full bg-[#0B1020] rounded-full h-2 border border-white/10 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
              </motion.div>
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold uppercase tracking-wider">
              <span className="text-gray-500">Progress</span>
              <span className="text-purple-400">{uploadProgress}%</span>
            </div>
          </motion.div>
        );

      case "analyzing":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-8 backdrop-blur-[18px] w-full text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
            <div className="relative z-10">
              <Activity className="w-10 h-10 text-blue-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-2">{title} Processing</h3>
              <div className="text-gray-400 text-sm max-w-md mx-auto"><LoadingFacts /></div>
            </div>
          </motion.div>
        );

      case "error":
        return (
          <motion.div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl w-full text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">{title} Error</h3>
            <p className="text-red-400 text-sm">{error ?? "An error occurred during analysis"}</p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Function to display posture analysis results
  const renderPostureResults = () => {
    if (postureAnalysis.state !== "complete" || !postureAnalysis.result) {
      return null;
    }

    const result = postureAnalysis.result;

    return (
      <div className="mt-16 relative">
        <div className="flex items-center space-x-3 mb-8">
          <Activity className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-black text-white tracking-tight">Posture Analytics</h2>
        </div>

        {result.status === "success" ? (
          <div className="space-y-6">
            {/* Average Angles Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(result.average_angles).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl backdrop-blur-[18px] hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-16 h-16 text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{key}</p>
                  <p className="text-4xl font-black text-white">
                    {value.toFixed(1)}°
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Posture Feedback Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
                <h4 className="text-lg font-bold text-white mb-6">Real-Time Evaluation</h4>
                <div className="space-y-4">
                  {Object.entries(result.feedback).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-4 bg-[#0B1020]/50 p-4 rounded-xl border border-white/5"
                    >
                      {value === "✅" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-200">{key}</p>
                        <p className="text-sm text-gray-500 mt-1">{value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Inferences Section */}
                {result.inferences && result.inferences.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Brain className="w-16 h-16 text-blue-400" /></div>
                    <h4 className="text-lg font-bold text-white mb-4 relative z-10 flex items-center">
                      <Sparkles className="w-5 h-5 text-blue-400 mr-2" /> AI Observations
                    </h4>
                    <ul className="space-y-3 relative z-10">
                      {result.inferences.map((inference, index) => (
                        <li key={generateRandomId()} className="flex items-start text-gray-300 text-sm">
                          <ChevronRight className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{inference}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips Section */}
                {result.tips && result.tips.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Info className="w-5 h-5 text-purple-400 mr-2" /> Coaching Tips
                    </h4>
                    <div className="space-y-3">
                      {result.tips.map((tip, index) => (
                        <div key={generateRandomId()} className="text-sm text-gray-400 bg-[#0B1020]/50 p-3 rounded-lg border border-white/5">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pt-2">
              Processed {result.stats.processed_frames} frames ({Math.round((result.stats.processed_frames / result.stats.total_frames) * 100)}% coverage)
            </div>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-[18px]">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p>{result.message || "An error occurred during analysis"}</p>
          </div>
        )}
      </div>
    );
  };

  // Function to display interview analysis results
  const renderInterviewResults = () => {
    if (interviewAnalysis.state !== "complete" || !interviewAnalysis.result) {
      return null;
    }

    const result = interviewAnalysis.result;

    const chartData = Object.entries(result.classifications).map(([key, value]) => {
      const friendlyNames: Record<string, string> = {
        Excited: "Energy",
        Paused: "Pacing",
        EngagingTone: "Vocal Tone",
        Calm: "Composure",
        NoFillers: "Clarity",
      };
      return {
        metric: friendlyNames[key] || key,
        score: Math.round((value as number) * 100),
      };
    });

    // Mock Data for new Visual Analytics Timeline/Emotions
    const timelineData = [
      { time: '0:00', confidence: 80, clarity: 75 },
      { time: '1:00', confidence: 85, clarity: 82 },
      { time: '2:00', confidence: 90, clarity: 88 },
      { time: '3:00', confidence: 75, clarity: 80 },
      { time: '4:00', confidence: 88, clarity: 92 },
      { time: '5:00', confidence: 94, clarity: 95 },
    ];

    const emotionData = [
      { time: '0:00', calm: 60, excited: 30, stressed: 10 },
      { time: '1:00', calm: 65, excited: 25, stressed: 10 },
      { time: '2:00', calm: 50, excited: 40, stressed: 10 },
      { time: '3:00', calm: 40, excited: 30, stressed: 30 },
      { time: '4:00', calm: 70, excited: 20, stressed: 10 },
      { time: '5:00', calm: 80, excited: 15, stressed: 5 },
    ];

    return (
      <div className="mt-8 relative">
        <div className="flex items-center space-x-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-black text-white tracking-tight">AI Intelligence Dashboard</h2>
        </div>

        {/* Top Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Overall Score", value: "89/100", trend: "+5%", icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/20", trendColor: "text-emerald-400" },
            { title: "Confidence", value: "92%", trend: "+12%", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/20", trendColor: "text-emerald-400" },
            { title: "Clarity", value: "85%", trend: "-2%", icon: Mic, color: "text-emerald-400", bg: "bg-emerald-500/20", trendColor: "text-red-400" },
            { title: "Engagement", value: "94%", trend: "+8%", icon: Users, color: "text-amber-400", bg: "bg-amber-500/20", trendColor: "text-emerald-400" }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${metric.bg}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <span className={`text-sm font-bold ${metric.trendColor} flex items-center`}>{metric.trend}</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">{metric.value}</p>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{metric.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          {/* Executive Summary / Inferences */}
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-2xl p-8 relative overflow-hidden hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-32 h-32 text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center">
              <Sparkles className="w-6 h-6 text-purple-400 mr-3" />
              AI Executive Summary
            </h4>
            <ul className="space-y-4 relative z-10">
              {result.inferences.map((inference, index) => (
                <motion.li
                  key={generateRandomId()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start text-gray-200 text-base"
                >
                  <ChevronRight className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{inference}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Visual Analytics Dashboard (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] flex flex-col hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 text-blue-400 mr-2" /> Skill Distribution Radar
              </h4>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)' }} tickCount={6} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.5}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] flex flex-col hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 text-emerald-400 mr-2" /> Performance Breakdown
              </h4>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                    <YAxis dataKey="metric" type="category" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="score" fill="url(#colorUv)" radius={[0, 4, 4, 0]} barSize={24} />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Timeline & Emotion Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] flex flex-col hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                <Clock className="w-5 h-5 text-purple-400 mr-2" /> Performance Timeline
              </h4>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED' }} />
                    <Line type="monotone" dataKey="clarity" name="Clarity" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emotion Area Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] flex flex-col hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 text-blue-400 mr-2" /> Emotion Flow Analysis
              </h4>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emotionData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="calm" name="Calm" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="excited" name="Confident" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="stressed" name="Stressed" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Behavioral Metrics Dashboard */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 tracking-wide">Behavioral Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(result.classifications).map(([key, value]) => {
                const percentage = Math.round(value * 100);
                const styleDescriptions = {
                  Excited: "Enthusiasm and energy engagement",
                  Paused: "Strategic, thoughtful pacing",
                  EngagingTone: "Vocal dynamic & variety",
                  Calm: "Composure and stress management",
                  NoFillers: "Clear, polished communication",
                  default: "Communication strength indicator",
                };
                const description =
                  // @ts-expect-error
                  styleDescriptions[key] || styleDescriptions.default;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:-translate-y-[6px] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-gray-200 font-bold tracking-wide">{key}</p>
                      <span className="text-xl font-black text-purple-400">{percentage}%</span>
                    </div>
                    <div className="w-full bg-[#0B1020] rounded-full h-2.5 mb-4 border border-white/5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                      </motion.div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Areas of Excellence */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <h4 className="text-xl font-bold text-white flex items-center mb-6">
                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3" />
                Areas of Excellence
              </h4>
              <div className="space-y-4">
                {result.good_performance.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-[#0B1020]/50 border border-emerald-500/10 rounded-xl overflow-hidden hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="bg-emerald-500/10 p-3 px-4 flex items-center border-b border-emerald-500/10">
                      <span className="text-emerald-400 font-bold tracking-wide">{item}</span>
                    </div>
                    <div className="p-4">
                      {ALL_TIPS[item] ? (
                        <ul className="space-y-2 text-sm text-gray-400">
                          {ALL_TIPS[item].map((tip, i) => (
                            <li key={generateRandomId()} className="flex items-start">
                              <span className="text-emerald-500 mr-2">•</span>{tip}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Continue practicing this skill to maintain your strong performance.
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-[18px] hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] transition-all duration-300 ease-out">
              <h4 className="text-xl font-bold text-white flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-amber-500 mr-3" />
                Areas for Improvement
              </h4>
              <div className="space-y-4">
                {result.improvement_opportunity.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-[#0B1020]/50 border border-amber-500/10 rounded-xl overflow-hidden hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="bg-amber-500/10 p-3 px-4 flex items-center border-b border-amber-500/10">
                      <span className="text-amber-400 font-bold tracking-wide">{item}</span>
                    </div>
                    <div className="p-4">
                      {ALL_TIPS[item] ? (
                        <ul className="space-y-2 text-sm text-gray-400">
                          {ALL_TIPS[item].map((tip, i) => (
                            <li key={generateRandomId()} className="flex items-start">
                              <span className="text-amber-500 mr-2">•</span>{tip}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Focus on developing this skill to enhance your interview performance.
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A14] text-gray-50 font-sans relative flex overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Mouse Glow */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300" style={{ background: 'radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(120,90,255,0.08), transparent 40%)' }} />
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* MAIN DASHBOARD AREA */}
      <main className="relative z-10 flex-1 overflow-y-auto px-2 pb-16 pt-2 md:px-4">
        <div className="mx-auto max-w-[1400px]">

          {renderUploadSection()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {renderAnalysisState("Posture Tracker", postureAnalysis.state, postureAnalysis.uploadProgress, postureAnalysis.error)}
            {renderAnalysisState("Interview Coach", interviewAnalysis.state, interviewAnalysis.uploadProgress, interviewAnalysis.error)}
          </div>

          {/* Dashboard Results View */}
          {(postureAnalysis.state === "complete" || interviewAnalysis.state === "complete") && (
            <div className="mt-8 space-y-16">
              {renderInterviewResults()}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              {renderPostureResults()}
            </div>
          )}

          {(hasAnyError || areAllAnalysesComplete) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-16"
            >
              <button
                onClick={resetAll}
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-lg rounded-full hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all duration-300 hover:-translate-y-1"
              >
                {hasAnyError ? "Try Again" : "Analyze Another Session"}
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
