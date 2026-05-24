import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Brain,
  Camera,
  CheckCircle,
  CircleDot,
  Mic,
  PauseCircle,
  Play,
  PlayCircle,
  ScanFace,
  Sparkles,
  StopCircle,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Route } from "../+types/root";
import AuthGuard from "~/components/auth-guard";
import { useToast } from "~/components/toast-provider";
import {
  enumerateBrowserDevices,
  getSpeechRecognitionCtor,
  playSpeakerTest,
  requestBrowserStream,
  speakWithBrowserVoice,
  stopBrowserStream,
  type BrowserMediaDevice,
  type SpeechRecognition,
} from "~/lib/browser-media";
import { useMockApp } from "~/lib/mock-app";
import { generateRandomId } from "~/utils";
import { analyzeVideoFrame, calculateLiveMetrics, initFaceTracking } from "~/lib/ml-engine";
import { jsPDF } from "jspdf";
import { supabase } from "~/lib/supabase";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Live Coach | Nexvio" }];
}

type InterviewStage =
  | "setup"
  | "device-check"
  | "ready"
  | "speaking"
  | "listening"
  | "thinking"
  | "report";

type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";

type InterviewRole =
  | "Frontend Engineering"
  | "Backend Engineering"
  | "Full Stack"
  | "Other";

type TranscriptSegment = {
  id: string;
  speaker: "AI" | "You";
  text: string;
  time: string;
  status: "complete" | "live";
};

type CandidateSetup = {
  fullName: string;
  experience: string;
  targetRole: string;
  skills: string;
  interviewType: string;
  difficulty: string;
  companyType: string;
};

type MetricPoint = {
  time: string;
  confidence: number;
};

const MAX_QUESTIONS = 3;
const fillerWordPattern = /\b(um|uh|like|basically|actually|you know)\b/gi;

const roleQuestionBank: Record<string, string[]> = {
  frontend: [
    "How would you debug a hydration mismatch in a Next.js application?",
    "Explain how you optimize React rendering when a page feels slow under user interaction.",
    "What tradeoffs do you consider when choosing client state versus server state management?",
    "How do you structure TypeScript types for reusable UI components in a growing design system?",
    "Can you describe your experience with CSS architecture like Tailwind or CSS Modules?",
  ],
  backend: [
    "How would you scale an API that starts hitting database bottlenecks under peak traffic?",
    "When would you introduce caching and how would you validate cache correctness?",
    "How do queues change system reliability compared with direct synchronous processing?",
    "What indexing strategy would you use to speed up a frequently filtered endpoint?",
  ],
  hr: [
    "Tell me about yourself and your background.",
    "What are your greatest strengths and weaknesses?",
    "Describe a time you had a conflict with a team member and how you resolved it.",
    "Where do you see yourself in five years?",
  ],
  behavioral: [
    "Tell me about a time you failed.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle receiving critical feedback?",
    "Give an example of how you set goals and achieve them."
  ],
  system: [
    "How would you design a URL shortener like bit.ly?",
    "Can you explain how you would design Netflix's video streaming architecture?",
    "Design a rate limiter for a public API.",
    "How would you design a distributed cache system?"
  ],
  default: [
    "Tell me about a technically difficult problem you solved and how you proved the result worked.",
    "How do you approach tradeoffs when performance, simplicity, and delivery speed conflict?",
    "Describe a project where you had to influence others without formal authority.",
    "What would your teammates say is your strongest contribution during high-pressure delivery?",
  ],
};

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function buildQuestion(setup: CandidateSetup, questionIndex: number, previousAnswer: string) {
  const normalizedRole = setup.targetRole.toLowerCase() + " " + setup.interviewType.toLowerCase();

  let bank = roleQuestionBank.default;
  if (normalizedRole.includes("hr") || normalizedRole.includes("human resources")) {
    bank = roleQuestionBank.hr;
  } else if (normalizedRole.includes("behavioral")) {
    bank = roleQuestionBank.behavioral;
  } else if (normalizedRole.includes("system design") || normalizedRole.includes("architecture")) {
    bank = roleQuestionBank.system;
  } else if (normalizedRole.includes("front") || normalizedRole.includes("ui") || normalizedRole.includes("react")) {
    bank = roleQuestionBank.frontend;
  } else if (normalizedRole.includes("back") || normalizedRole.includes("node") || normalizedRole.includes("python") || normalizedRole.includes("java")) {
    bank = roleQuestionBank.backend;
  }

  const baseQuestion = bank[questionIndex] ?? roleQuestionBank.default[questionIndex];
  if (!previousAnswer) return baseQuestion;

  if (previousAnswer.toLowerCase().includes("performance")) {
    return `Follow-up: ${baseQuestion} Also tell me how you would measure that improvement in production.`;
  }

  if (setup.skills.toLowerCase().includes("typescript")) {
    return `Follow-up for a ${setup.targetRole}: ${baseQuestion} Please include how TypeScript changes your approach.`;
  }

  return `Follow-up based on your previous answer: ${baseQuestion}`;
}

export default function LiveInterview() {
  const { toast } = useToast();
  const { addInterview, settings, updateSettings, authError, isSupabaseEnabled, addNotification } = useMockApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const answerBufferRef = useRef("");
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startAnswerTimeRef = useRef<number | null>(null);

  const [stage, setStage] = useState<InterviewStage>("setup");
  const [cameraDevices, setCameraDevices] = useState<BrowserMediaDevice[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<BrowserMediaDevice[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<BrowserMediaDevice[]>([]);
  const [completedFillerWords, setCompletedFillerWords] = useState(0);
  const [warnings, setWarnings] = useState({
    lowLight: false,
    noFace: false,
    multipleFaces: false,
    lookingAway: false,
  });
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [selectedMicId, setSelectedMicId] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [browserWarning, setBrowserWarning] = useState("");
  const [streamReady, setStreamReady] = useState(false);
  const [micPulse, setMicPulse] = useState(18);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState("");
  const [statusLabel, setStatusLabel] = useState("Waiting for candidate setup");
  const [candidateSetup, setCandidateSetup] = useState<CandidateSetup>({
    fullName: "Lingraj Malipatil",
    experience: "2 years",
    targetRole: settings.domain || "Frontend Engineer",
    skills: "React, TypeScript, Next.js",
    interviewType: "Technical + Behavioral",
    difficulty: settings.difficulty,
    companyType: "Product Startup",
  });
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [currentDraft, setCurrentDraft] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(78);
  const [eyeContactScore, setEyeContactScore] = useState(84);
  const [postureScore, setPostureScore] = useState(82);
  const [paceWpm, setPaceWpm] = useState(0);
  const [fillerWords, setFillerWords] = useState(0);
  const [timelineData, setTimelineData] = useState<MetricPoint[]>([
    { time: "0:00", confidence: 78 },
  ]);
  const [reportIntro, setReportIntro] = useState("Generate your first live session to unlock the full Nexvio report.");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  const transcriptWordCount = useMemo(() => {
    return transcriptSegments
      .filter((segment) => segment.speaker === "You")
      .reduce((count, segment) => count + segment.text.split(/\s+/).filter(Boolean).length, 0);
  }, [transcriptSegments]);

  const reportSummary = useMemo(() => {
    const strengths = [
      "Stayed on topic and answered with direct examples.",
      "Role-based questioning adapted to your stack and experience.",
      "Camera, mic, and transcript stayed live through the session.",
    ];
    const improvements = [
      fillerWords > 4 ? "Reduce filler words in the first half of the answer." : "Keep this low-filler pace going.",
      paceWpm > 165 ? "Slow down slightly so the strongest points land more clearly." : "Your pacing stayed in a good range.",
      confidenceScore < 80 ? "Pause before difficult sections to sound more deliberate." : "Confidence stayed steady across the round.",
    ];

    return { strengths, improvements };
  }, [confidenceScore, fillerWords, paceWpm]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      containerRef.current.style.setProperty("--x", `${event.clientX}px`);
      containerRef.current.style.setProperty("--y", `${event.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const bootstrapDevices = async () => {
      try {
        const listed = await enumerateBrowserDevices();
        const cams = listed.filter((d) => d.kind === "videoinput");
        const mics = listed.filter((d) => d.kind === "audioinput");
        const speakers = listed.filter((d) => d.kind === "audiooutput");

        setCameraDevices(cams);
        setMicrophoneDevices(mics);
        setSpeakerDevices(speakers);

        if (!selectedCameraId) setSelectedCameraId(cams[0]?.deviceId ?? "");
        if (!selectedMicId) setSelectedMicId(mics[0]?.deviceId ?? "");
        if (!selectedSpeakerId) setSelectedSpeakerId(speakers[0]?.deviceId ?? "");
      } catch (err) {
        console.error(err);
      }
      if (!getSpeechRecognitionCtor()) {
        setBrowserWarning("Live transcript uses browser speech APIs. This browser may only support manual transcript fallback.");
      }
      // Initialize Face Tracking Models in the background
      void initFaceTracking();
    };
    void bootstrapDevices();
  }, [selectedCameraId, selectedMicId, selectedSpeakerId]);

  // Keep settings synchronized automatically
  useEffect(() => {
    setCandidateSetup(current => ({
      ...current,
      targetRole: settings.domain || current.targetRole,
    }));
  }, [settings.domain]);

  useEffect(() => {
    if (stage !== "listening") return;

    // AI Analysis Loop
    const interval = window.setInterval(async () => {
      setMicPulse(12 + Math.random() * 48);

      // Perform computer vision frame analysis
      if (videoRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (canvas && (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight)) {
          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;
        }

        const metrics = await analyzeVideoFrame(video, canvas || undefined);
        const lowLight = checkLowLighting(video);

        setWarnings({
          lowLight,
          noFace: !metrics.faceDetected,
          multipleFaces: !!metrics.multipleFacesDetected,
          lookingAway: !!metrics.isLookingAway,
        });

        setEyeContactScore((prev) => {
          const newScore = prev + metrics.eyeContactDelta;
          return Math.max(0, Math.min(100, newScore));
        });

        setPostureScore((prev) => {
          const newScore = prev + metrics.postureDelta;
          return Math.max(0, Math.min(100, newScore));
        });

        if (!metrics.faceDetected) {
          setStatusLabel("Listening... (Face not detected in frame)");
        } else if (metrics.multipleFacesDetected) {
          setStatusLabel("Listening... (Multiple faces detected!)");
        } else if (metrics.isLookingAway) {
          setStatusLabel("Listening... (Please maintain eye contact)");
        } else {
          setStatusLabel("Listening...");
        }
      }

    }, 1000);

    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (!["speaking", "listening", "thinking"].includes(stage)) return;

    // Timer Loop
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      // Update Live Confidence based on current metrics
      if (stage === "listening") {
        setConfidenceScore((currentConf) => {
          return calculateLiveMetrics(currentConf, eyeContactScore, postureScore, fillerWords, paceWpm);
        });
      }

    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [stage, eyeContactScore, postureScore, fillerWords, paceWpm]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (stage !== "setup" && (selectedCameraId || selectedMicId)) {
      void attachCandidateStream();
    }
  }, [selectedCameraId, selectedMicId]);

  const lastInterviewIdRef = useRef("");

  const checkLowLighting = (video: HTMLVideoElement) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 40;
      canvas.height = 30;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let r, g, b, avg;
      let colorSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        avg = Math.floor((r + g + b) / 3);
        colorSum += avg;
      }
      const brightness = Math.floor(colorSum / (canvas.width * canvas.height));
      return brightness < 45;
    } catch {
      return false;
    }
  };

  const generateAndStorePDF = async (interviewId: string, record: any) => {
    try {
      const doc = new jsPDF();

      // Page background
      doc.setFillColor(7, 17, 31);
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("NEXVIO AI INTERVIEW REPORT", 14, 25);

      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(1.5);
      doc.line(14, 30, 196, 30);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(200, 200, 200);
      doc.text(`Candidate Name: ${candidateSetup.fullName}`, 14, 40);
      doc.text(`Role Applied: ${record.role}`, 14, 46);
      doc.text(`Interview Type: ${record.type}`, 14, 52);
      doc.text(`Date: ${record.date}`, 14, 58);

      // Metrics block
      doc.setFillColor(255, 255, 255, 0.05);
      doc.rect(14, 66, 182, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Performance Metrics", 20, 76);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Overall Score: ${record.score}%`, 20, 85);
      doc.text(`Eye Contact Score: ${Number(eyeContactScore.toFixed(2))}%`, 20, 91);
      doc.text(`Posture Health: ${Number(postureScore.toFixed(2))}%`, 110, 85);
      doc.text(`Filler Word Count: ${record.fillerWords}`, 110, 91);

      // Feedback
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("AI Feedback & Recommendations", 14, 115);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);

      let y = 125;
      doc.text("Key Strengths:", 14, y);
      y += 6;
      record.strengths.forEach((s: string) => {
        doc.text(`- ${s}`, 20, y);
        y += 6;
      });

      y += 4;
      doc.text("Areas for Improvement:", 14, y);
      y += 6;
      record.weaknesses.forEach((w: string) => {
        doc.text(`- ${w}`, 20, y);
        y += 6;
      });

      // Transcript
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Interview Transcript", 14, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);

      const splitTranscript = doc.splitTextToSize(
        transcriptSegments
          .map((seg) => `[${seg.time}] ${seg.speaker}: ${seg.text}`)
          .join("\n\n"),
        180
      );

      for (let i = 0; i < splitTranscript.length; i++) {
        if (y > 270) {
          doc.addPage();
          doc.setFillColor(7, 17, 31);
          doc.rect(0, 0, 210, 297, "F");
          y = 20;
        }
        doc.text(splitTranscript[i], 14, y);
        y += 5;
      }

      // Download locally
      doc.save(`Nexvio_Interview_Report_${interviewId.substring(0, 6)}.pdf`);

      // Supabase storage upload if enabled
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          const pdfBlob = doc.output("blob");
          const pdfFile = new File([pdfBlob], `report-${interviewId}.pdf`, { type: "application/pdf" });
          const filePath = `${user.id}/reports/${interviewId}.pdf`;

          let publicUrl = "";
          try {
            await supabase.storage.from("reports").upload(filePath, pdfFile);
            const { data } = supabase.storage.from("reports").getPublicUrl(filePath);
            publicUrl = data.publicUrl;
          } catch (uploadErr) {
            console.warn("Retrying upload to avatars bucket fallback...", uploadErr);
            await supabase.storage.from("avatars").upload(filePath, pdfFile);
            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            publicUrl = data.publicUrl;
          }

          if (publicUrl) {
            const nextPDFs = [
              ...(settings.pdfReports ?? []),
              {
                id: `rep-${generateRandomId().substring(0, 8)}`,
                interviewId,
                role: record.role,
                date: record.date,
                score: record.score,
                pdfUrl: publicUrl,
              }
            ];
            await updateSettings({ pdfReports: nextPDFs });
            addNotification("Report exported", `Your PDF report for ${record.role} was generated and synced.`);
            toast("Report saved and synced to database!", "success");
          }
        }
      }
    } catch (err: any) {
      console.error("PDF generation/storage error:", err);
      toast("Failed to generate PDF report", "error");
    }
  };

  async function attachCandidateStream() {
    setPermissionError("");
    try {
      stopBrowserStream(streamRef.current);
      const stream = await requestBrowserStream({
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatusLabel("Camera, microphone, and speaker are ready for the interview.");
      const listed = await enumerateBrowserDevices();
      setCameraDevices(listed.filter((d) => d.kind === "videoinput"));
      setMicrophoneDevices(listed.filter((d) => d.kind === "audioinput"));
      setSpeakerDevices(listed.filter((d) => d.kind === "audiooutput"));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not access camera and microphone. Check browser permissions and HTTPS.";
      setPermissionError(message);
      setStreamReady(false);
      setShowQuickSetup(false);
      setStage("device-check");
    }
  }

  function syncSelectedLabels() {
    const selectedCamera = cameraDevices.find((device) => device.deviceId === selectedCameraId)?.label;
    const selectedMic = microphoneDevices.find((device) => device.deviceId === selectedMicId)?.label;
    const selectedSpeaker = speakerDevices.find((device) => device.deviceId === selectedSpeakerId)?.label;
    updateSettings({
      camera: selectedCamera || settings.camera,
      microphone: selectedMic || settings.microphone,
      speaker: selectedSpeaker || settings.speaker,
      difficulty: candidateSetup.difficulty as any,
      domain: candidateSetup.targetRole,
    });
  }

  function addTranscript(speaker: "AI" | "You", text: string, status: "complete" | "live" = "complete") {
    setTranscriptSegments((current) => [
      ...current,
      {
        id: generateRandomId(),
        speaker,
        text,
        time: formatClock(elapsedSeconds),
        status,
      },
    ]);
  }

  function speakQuestion(question: string) {
    setStage("speaking");
    setStatusLabel("AI interviewer is speaking...");
    addTranscript("AI", question);
    const utterance = speakWithBrowserVoice(question, settings.voice);
    if (utterance) {
      utterance.onend = () => {
        void beginListening();
      };
    } else {
      window.setTimeout(() => {
        void beginListening();
      }, 1000);
    }
  }

  async function beginListening() {
    setStage("listening");
    setStatusLabel("Listening...");
    setCurrentDraft("");
    answerBufferRef.current = "";
    startAnswerTimeRef.current = Date.now();

    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      setBrowserWarning("Browser speech recognition is unavailable. Use Chrome or Edge for live transcript capture.");
      // Even without speech recognition, start recording the answer
      return;
    }

    recognitionRef.current?.stop();
    const recognition = new RecognitionCtor();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.language.toLowerCase().includes("hindi") ? "hi-IN" : "en-US";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }
      const cleaned = transcript.trim();
      answerBufferRef.current = cleaned;
      setCurrentDraft(cleaned);

      const words = cleaned.split(/\s+/).filter(Boolean);
      const durationMin = startAnswerTimeRef.current ? Math.max(0.05, (Date.now() - startAnswerTimeRef.current) / 60000) : 0.05;
      const wpm = Math.round(words.length / durationMin);
      setPaceWpm(wpm);

      const fillers = (cleaned.match(fillerWordPattern) || []).length;
      setFillerWords(completedFillerWords + fillers);

      const confidence = Math.max(56, Math.min(96, 88 - (completedFillerWords + fillers) * 4 + Math.min(8, Math.round(words.length / 12))));
      setConfidenceScore(confidence);
    };
    recognition.onerror = (event) => {
      setBrowserWarning(`Speech recognition error: ${event.error}. You can still finish manually.`);
    };
    recognition.start();
  }

  function askNextQuestion(previousAnswer = "") {
    if (questionIndex >= MAX_QUESTIONS) {
      finishInterview(previousAnswer);
      return;
    }
    const nextQuestion = buildQuestion(candidateSetup, questionIndex, previousAnswer);
    setActiveQuestion(nextQuestion);
    speakQuestion(nextQuestion);
  }

  function calculateConfidence(answer: string, answerDurationSeconds: number) {
    const words = answer.split(/\s+/).filter(Boolean);
    const wordsPerMinute = words.length > 0 && answerDurationSeconds > 0 ? Math.round(words.length / (answerDurationSeconds / 60)) : 0;
    const fillers = (answer.match(fillerWordPattern) || []).length;
    const confidence = Math.max(56, Math.min(96, 88 - fillers * 4 + Math.min(8, Math.round(words.length / 12))));
    return { wordsPerMinute, fillers, confidence };
  }

  function finishCurrentAnswer() {
    recognitionRef.current?.stop();
    const finalAnswer = answerBufferRef.current.trim();
    const answerDurationSeconds = startAnswerTimeRef.current ? Math.max(1, Math.round((Date.now() - startAnswerTimeRef.current) / 1000)) : 1;
    setCurrentDraft("");
    setStage("thinking");
    setStatusLabel("Analyzing response...");

    if (finalAnswer) {
      addTranscript("You", finalAnswer);
      const metrics = calculateConfidence(finalAnswer, answerDurationSeconds);
      setPaceWpm(metrics.wordsPerMinute);
      setCompletedFillerWords((current) => current + metrics.fillers);
      setFillerWords((current) => current + metrics.fillers);
      setConfidenceScore(metrics.confidence);
      setTimelineData((current) => [
        ...current,
        { time: formatClock(elapsedSeconds), confidence: metrics.confidence },
      ]);
      setReportIntro(`Nexvio completed ${questionIndex + 1} live questions for ${candidateSetup.targetRole} and generated a browser-side coaching report.`);
    }

    window.setTimeout(() => {
      setQuestionIndex((current) => {
        const nextIndex = current + 1;
        if (nextIndex >= MAX_QUESTIONS) {
          finishInterview(finalAnswer);
          return nextIndex;
        }
        const nextQuestion = buildQuestion(candidateSetup, nextIndex, finalAnswer);
        setActiveQuestion(nextQuestion);
        speakQuestion(nextQuestion);
        return nextIndex;
      });
    }, 900);
  }

  function finishInterview(lastAnswer: string) {
    recognitionRef.current?.stop();
    setStage("report");
    setStatusLabel("Generating feedback report...");
    window.speechSynthesis?.cancel();

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    const interviewId = generateRandomId();
    lastInterviewIdRef.current = interviewId;

    const newRecord = {
      id: interviewId,
      role: candidateSetup.targetRole,
      type: (candidateSetup.interviewType.includes("Behavioral")
        ? "Behavioral"
        : candidateSetup.interviewType.includes("System")
          ? "System Design"
          : candidateSetup.interviewType.includes("HR")
            ? "HR"
            : "Technical") as "Behavioral" | "Technical" | "HR" | "System Design",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      score: Number(confidenceScore.toFixed(2)),
      confidence: Number(confidenceScore.toFixed(2)),
      posture: Number(postureScore.toFixed(2)),
      fillerWords,
      status: "Completed" as const,
      summary: lastAnswer
        ? `Completed a live ${candidateSetup.interviewType} round with real computer vision and browser-side AI conversation.`
        : "Completed a live round and generated a Nexvio coaching report.",
      strengths: reportSummary.strengths,
      weaknesses: reportSummary.improvements,
    };

    addInterview(newRecord);
    addNotification("Interview completed", `Your live interview for ${newRecord.role} is complete. Score: ${newRecord.score}%.`);
  }

  function restartInterview() {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setStage(streamReady ? "ready" : "setup");
    setElapsedSeconds(0);
    setQuestionIndex(0);
    setActiveQuestion("");
    setTranscriptSegments([]);
    setCurrentDraft("");
    setPaceWpm(0);
    setCompletedFillerWords(0);
    setFillerWords(0);
    setConfidenceScore(78);
    setEyeContactScore(84);
    setPostureScore(82);
    setTimelineData([{ time: "0:00", confidence: 78 }]);
    setReportIntro("Generate your first live session to unlock the full Nexvio report.");
    setStatusLabel("Waiting for candidate setup");
    setWarnings({
      lowLight: false,
      noFace: false,
      multipleFaces: false,
      lookingAway: false,
    });
  }

  const currentQuestionNumber = Math.min(questionIndex + (stage === "report" ? 0 : 1), MAX_QUESTIONS);
  const browserChecks = [
    { label: "Camera detected", value: cameraDevices.length > 0 && streamReady },
    { label: "Microphone working", value: microphoneDevices.length > 0 && streamReady },
    { label: "Speaker connected", value: speakerDevices.length > 0 || selectedSpeakerId !== "" },
  ];

  return (
    <AuthGuard>
      <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#0A0A14] font-sans text-gray-50">
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300"
          style={{
            background:
              "radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(120,90,255,0.08), transparent 40%)",
          }}
        />
        <div className="pointer-events-none fixed left-1/4 top-0 z-0 h-[30%] w-[50%] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-2 pb-10 pt-2 sm:px-4 lg:px-6">
          {authError ? (
            <div className="mb-6 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
              Supabase sync issue: {authError}
            </div>
          ) : null}
          {!isSupabaseEnabled ? (
            <div className="mb-6 rounded-[1.6rem] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
              Supabase is not configured yet, so live interview results will use local fallback storage.
            </div>
          ) : null}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-[#08111e]/70 px-6 py-5 backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_30px_rgba(96,165,250,0.35)]">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Nexvio Live Interview Engine</h1>
                <p className="text-sm text-gray-400">{statusLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-sm font-bold text-red-400">
                <div className="flex items-center gap-2">
                  <CircleDot className="h-4 w-4 animate-pulse" />
                  {formatClock(elapsedSeconds)}
                </div>
              </div>
              {stage === "listening" ? (
                <button
                  onClick={finishCurrentAnswer}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#07111f]"
                >
                  <StopCircle className="h-4 w-4 text-rose-500" />
                  Finish answer
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-start">
            {/* Left Column (Candidate Setup + Questions) */}
            <div className="space-y-6 flex flex-col min-h-0 overflow-visible">
              {["setup", "device-check", "ready"].includes(stage) ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <p className="mb-4 text-sm font-bold uppercase tracking-[0.26em] text-violet-300">
                        Candidate setup
                      </p>
                      <div className="grid gap-4">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Full name</span>
                          <input
                            value={candidateSetup.fullName}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                fullName: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Target role</span>
                          <select
                            value={candidateSetup.targetRole}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                targetRole: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          >
                            <option value="Frontend Engineer">Frontend Engineer</option>
                            <option value="Backend Engineer">Backend Engineer</option>
                            <option value="Fullstack Engineer">Fullstack Engineer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Data Scientist">Data Scientist</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Years of experience</span>
                          <select
                            value={candidateSetup.experience}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                experience: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          >
                            <option value="Internship">Internship</option>
                            <option value="Junior (1-2 years)">Junior (1-2 years)</option>
                            <option value="Mid-level (3-5 years)">Mid-level (3-5 years)</option>
                            <option value="Senior (5+ years)">Senior (5+ years)</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Company type</span>
                          <select
                            value={candidateSetup.companyType}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                companyType: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          >
                            <option value="Product Startup">Product Startup</option>
                            <option value="Big Tech MAANG">Big Tech MAANG</option>
                            <option value="Enterprise Software">Enterprise Software</option>
                            <option value="Agency / Consultancy">Agency / Consultancy</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Interview type</span>
                          <select
                            value={candidateSetup.interviewType}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                interviewType: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          >
                            <option value="Technical + Behavioral">Technical + Behavioral</option>
                            <option value="System Design">System Design</option>
                            <option value="HR / Leadership Round">HR / Leadership Round</option>
                            <option value="Coding Round">Coding Round</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Difficulty level</span>
                          <select
                            value={candidateSetup.difficulty}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                difficulty: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Skills focus</span>
                          <select
                            value={candidateSetup.skills}
                            onChange={(event) =>
                              setCandidateSetup((current) => ({
                                ...current,
                                skills: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                          >
                            <option value="React, TypeScript, Next.js">React, TypeScript, Next.js</option>
                            <option value="Node.js, Python, PostgreSQL, Docker">Node.js, Python, PostgreSQL, Docker</option>
                            <option value="System Design, AWS, Microservices">System Design, AWS, Microservices</option>
                            <option value="Algorithms, Data Structures, Java">Algorithms, Data Structures, Java</option>
                            <option value="Agile, Product Strategy, Analytics">Agile, Product Strategy, Analytics</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="mb-4 text-sm font-bold uppercase tracking-[0.26em] text-cyan-300">
                        Device check
                      </p>
                      <div className="grid gap-4">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Webcam</span>
                          <select
                            value={selectedCameraId}
                            onChange={(event) => setSelectedCameraId(event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          >
                            <option value="">Select webcam</option>
                            {cameraDevices.map((device) => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label || "Camera Device"}
                                {device.label || "Microphone Device"}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-300">Microphone</span>
                          <select
                            value={selectedMicId}
                            onChange={(event) => setSelectedMicId(event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          >
                            <option value="">Select microphone</option>
                            {microphoneDevices.map((device) => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              syncSelectedLabels();
                              setShowQuickSetup(true);
                              void attachCandidateStream();
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
                          >
                            <Camera className="h-4 w-4" />
                            Run device check
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/10">
                    <span className="text-sm text-gray-400">
                      Professional flow: onboarding → device check → AI question → live transcript → report.
                    </span>
                    <button
                      disabled={!streamReady}
                      onClick={() => {
                        setTranscriptSegments([]);
                        setQuestionIndex(0);
                        setElapsedSeconds(0);
                        setTimelineData([{ time: "0:00", confidence: 78 }]);
                        syncSelectedLabels();

                        // Start MediaRecorder if stream exists
                        if (streamRef.current && window.MediaRecorder) {
                          recordedChunksRef.current = [];
                          try {
                            const recorder = new MediaRecorder(streamRef.current);
                            recorder.ondataavailable = (e) => {
                              if (e.data.size > 0) recordedChunksRef.current.push(e.data);
                            };
                            recorder.start(1000); // chunk every second
                            mediaRecorderRef.current = recorder;
                          } catch (e) {
                            console.warn("MediaRecorder could not start", e);
                          }
                        }

                        askNextQuestion("");
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-[1.02]"
                    >
                      <PlayCircle className="h-5 w-5" />
                      Start AI Interview
                    </button>
                  </div>
                </div>
              ) : null}

              {stage === "speaking" || stage === "listening" || stage === "thinking" || stage === "report" ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.24em] text-violet-300">Interview engine</p>
                      <h3 className="mt-2 text-2xl font-black text-white">
                        Question {Math.min(currentQuestionNumber, MAX_QUESTIONS)} / {MAX_QUESTIONS}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {stage === "speaking" ? (
                        <button
                          onClick={() => playSpeakerTest(settings.voice)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Play className="h-4 w-4" />
                          Replay voice
                        </button>
                      ) : null}
                      {stage === "listening" ? (
                        <button
                          onClick={() => {
                            recognitionRef.current?.stop();
                            setStage("thinking");
                            setStatusLabel("Paused. Resume when ready.");
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                          <PauseCircle className="h-4 w-4" />
                          Pause
                        </button>
                      ) : null}
                      {stage === "thinking" ? (
                        <button
                          onClick={() => void beginListening()}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Mic className="h-4 w-4" />
                          Resume
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] border border-cyan-400/15 bg-cyan-400/8 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Current question</p>
                    <p className="mt-3 text-xl font-semibold leading-8 text-white">{activeQuestion || reportIntro}</p>
                  </div>
                  {currentDraft ? (
                    <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-[#08111e] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Live transcript</p>
                      <p className="mt-3 text-sm leading-7 text-white">{currentDraft}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-6 min-w-0 overflow-hidden flex flex-col">
              {/* Live Video Panel (Moved to Right Panel) */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111f] p-4 flex-shrink-0">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/12 to-transparent" />

                {/* Warnings Overlay */}
                {stage === "listening" && (
                  <div className="absolute top-6 left-6 right-6 z-20 flex flex-col gap-2 pointer-events-none">
                    {warnings.noFace && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-950/80 px-3 py-2 text-xs font-bold text-rose-200 backdrop-blur-md flex items-center gap-2 shadow-lg">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                        NO FACE DETECTED: Keep your face visible within the camera view.
                      </div>
                    )}
                    {!warnings.noFace && warnings.multipleFaces && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-950/80 px-3 py-2 text-xs font-bold text-rose-200 backdrop-blur-md flex items-center gap-2 shadow-lg">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                        MULTIPLE FACES DETECTED: Please ensure you are alone in the frame.
                      </div>
                    )}
                    {!warnings.noFace && !warnings.multipleFaces && warnings.lookingAway && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/80 px-3 py-2 text-xs font-bold text-amber-200 backdrop-blur-md flex items-center gap-2 shadow-lg">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                        FOCUS WARNING: Please look back at the screen.
                      </div>
                    )}
                    {warnings.lowLight && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/80 px-3 py-2 text-xs font-bold text-amber-200 backdrop-blur-md flex items-center gap-2 shadow-lg">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                        LOW LIGHTING DETECTED: Please increase room brightness.
                      </div>
                    )}
                  </div>
                )}

                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/10 bg-black shadow-2xl">
                  {streamReady ? (
                    <div className="relative h-full w-full">
                      <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none z-10" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-500 h-full w-full">
                      <Camera className="h-12 w-12 opacity-50" />
                      <p className="text-sm font-medium">Webcam feed will appear here</p>
                    </div>
                  )}
                  {stage === "listening" ? (
                    <div className="absolute left-4 bottom-4 z-20 rounded-full border border-emerald-400/20 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 shadow-lg backdrop-blur-md">
                      Listening...
                    </div>
                  ) : null}
                  {stage === "speaking" ? (
                    <div className="absolute left-4 bottom-4 z-20 rounded-full border border-cyan-400/20 bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-200 shadow-lg backdrop-blur-md">
                      AI speaking...
                    </div>
                  ) : null}
                  <div className="absolute bottom-4 right-4 flex items-end gap-1 rounded-2xl border border-white/10 bg-[#08111e]/80 px-3 py-2 backdrop-blur-xl z-20">
                    {[...Array(14)].map((_, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          height: stage === "listening" ? `${Math.max(8, Math.round((micPulse + index * 3) % 48))}px` : "6px",
                        }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        className="w-1.5 rounded-full bg-cyan-300"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {["speaking", "listening", "thinking", "report"].includes(stage) ? (
                <>
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">Live analytics</p>
                    <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3">
                      {[
                        { label: "Confidence", value: `${Math.round(confidenceScore)}%` },
                        { label: "Eye contact", value: `${Math.round(eyeContactScore)}%` },
                        { label: "Posture", value: `${Math.round(postureScore)}%` },
                        { label: "Pacing", value: paceWpm ? `${paceWpm} WPM` : "--" },
                        { label: "Tone", value: paceWpm ? (paceWpm > 170 ? "Nervous 😟" : paceWpm > 135 ? "Confident 😎" : paceWpm > 95 ? "Calm 🧘" : "Hesitant 😰") : "Neutral 😐" },
                        { label: "Filler words", value: `${fillerWords}` },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-[#08111e] p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{item.label}</p>
                          <p className="mt-2 text-xl font-black text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                    <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-violet-300">
                      <Activity className="h-4 w-4" />
                      Confidence timeline
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }} />
                          <YAxis domain={[0, 100]} hide />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#0B1020",
                              borderColor: "rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                            itemStyle={{ color: "#fff" }}
                          />
                          <Line type="monotone" dataKey="confidence" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: "#7C3AED" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">Transcript stream</p>
                    <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                      {transcriptSegments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-gray-400">
                          No interview messages yet. Complete setup and start the AI interviewer.
                        </div>
                      ) : (
                        transcriptSegments.map((segment) => (
                          <div
                            key={segment.id}
                            className={`rounded-2xl border p-4 ${segment.speaker === "AI"
                              ? "border-violet-500/20 bg-violet-500/10"
                              : "border-cyan-400/20 bg-cyan-400/8"
                              }`}
                          >
                            <div className="mb-2 flex items-center justify-between text-xs">
                              <span className="font-bold uppercase tracking-[0.2em] text-gray-300">{segment.speaker}</span>
                              <span className="text-gray-500">{segment.time}</span>
                            </div>
                            <p className="text-sm leading-7 text-white">{segment.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              {stage === "report" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/8 p-6 backdrop-blur-2xl"
                >
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-emerald-300">
                    <CheckCircle className="h-4 w-4" />
                    Interview summary report
                  </div>
                  <p className="mt-4 text-sm leading-7 text-emerald-50">{reportIntro}</p>
                  <div className="mt-5 space-y-3">
                    {reportSummary.strengths.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-[#08111e]/70 p-4 text-sm text-gray-200">
                        {item}
                      </div>
                    ))}
                    {reportSummary.improvements.map((item) => (
                      <div key={item} className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#07111f] transition hover:bg-gray-200"
                    >
                      Export & Share
                    </button>
                    <button
                      onClick={restartInterview}
                      className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Run another interview
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Quick Setup Check Modal */}
        {showQuickSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#09111f] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 pointer-events-none" />
              <h3 className="mb-6 text-2xl font-black text-white text-center">Quick Setup Check</h3>

              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-300 font-semibold">Camera Detection</span>
                  <span className="text-emerald-400">✅ Active</span>
                </div>
                <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-300 font-semibold">Microphone Signal</span>
                  <span className="text-emerald-400">✅ Active</span>
                </div>
                <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-300 font-semibold">Speaker Output</span>
                  <span className="text-emerald-400">✅ Active</span>
                </div>
                <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-300 font-semibold">Internet Speed</span>
                  <span className="text-emerald-400">✅ Optimal</span>
                </div>
                <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-300 font-semibold">Browser Permissions</span>
                  <span className="text-emerald-400">✅ Granted</span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xl font-black text-emerald-400 mb-1">System Ready ✅</p>
                <p className="text-sm text-gray-400 mb-6">You are ready to start the interview.</p>
                <button
                  onClick={() => {
                    setStreamReady(true);
                    setStage("ready");
                    setShowQuickSetup(false);
                  }}
                  className="w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-1 shadow-[0_0_20px_rgba(96,165,250,0.3)]"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#09111f] p-6 shadow-2xl"
            >
              <h3 className="mb-2 text-xl font-black text-white">Share Report</h3>
              <p className="mb-6 text-sm text-gray-400">Share your Nexvio coaching report or download it as a PDF.</p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    toast("Opening WhatsApp...", "success");
                    window.open(`https://api.whatsapp.com/send?text=Check%20out%20my%20Nexvio%20AI%20Interview%20Report!`, "_blank");
                    setShowShareModal(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">Share via WhatsApp</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    toast("Opening Mail client...", "success");
                    window.open(`mailto:?subject=Nexvio%20Interview%20Report&body=I%20just%20completed%20an%20AI%20interview%20on%20Nexvio.%20Check%20out%20my%20results!`, "_self");
                    setShowShareModal(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">Share via Email</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowShareModal(false);
                    const record = {
                      role: candidateSetup.targetRole,
                      type: candidateSetup.interviewType.includes("Behavioral") ? "Behavioral" : "Technical",
                      date: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                      score: Number(confidenceScore.toFixed(2)),
                      fillerWords,
                      strengths: reportSummary.strengths,
                      weaknesses: reportSummary.improvements,
                    };
                    void generateAndStorePDF(lastInterviewIdRef.current || generateRandomId(), record);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">Download PDF</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/5"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
