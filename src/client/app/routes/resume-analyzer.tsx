import { motion } from "framer-motion";
import {
    AlertTriangle,
    Award,
    FileCheck,
    FileText,
    Search,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "AI Resume Analyzer | Nexvio" }];
}

export default function ResumeAnalyzer() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

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

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsAnalyzing(true);
        // Mock AI analysis delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult({
                atsScore: 82,
                missingKeywords: ["React Hooks", "GraphQL", "Agile Methodologies", "CI/CD"],
                grammarIssues: [
                    { text: "Responsible for manage the team", suggestion: "Managed the team" },
                    { text: "Lead 5 developer", suggestion: "Led a team of 5 developers" }
                ],
                skillGaps: [
                    "Cloud deployment experience (AWS/Azure) is missing for senior frontend roles.",
                    "Consider adding specific performance metrics (e.g., 'reduced load time by 20%')."
                ]
            });
        }, 3000);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
        },
        maxFiles: 1,
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0A0A14] text-gray-50 font-sans relative overflow-hidden selection:bg-purple-500/30">
            {/* Dynamic Mouse Glow */}
            <div className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300" style={{ background: 'radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(120,90,255,0.08), transparent 40%)' }} />
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-8 md:px-6 md:py-10">

                {!result && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center mb-16"
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-semibold tracking-wide mb-6">
                            <FileCheck className="w-4 h-4" />
                            <span>ATS Optimization</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6 text-white">
                            AI Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Analyzer</span>
                        </h1>
                        <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
                            Upload your resume to get an instant ATS score, grammar corrections, skill gap analysis, and missing keywords based on real job descriptions.
                        </p>

                        <div
                            {...getRootProps()}
                            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-16 cursor-pointer transition-all duration-300 ease-out bg-[#0A0A14]/60 backdrop-blur-[18px] max-w-2xl mx-auto hover:-translate-y-[6px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)]
                ${isDragActive
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-10 h-10 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Upload your resume</h3>
                            <p className="text-gray-400 text-center max-w-sm mb-6 leading-relaxed">
                                Drag & drop your PDF or Word document here, or click to browse files.
                            </p>
                            <div className="flex gap-3 text-xs font-semibold text-gray-400">
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">PDF</span>
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">DOCX</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto bg-white/[0.02] border border-white/5 rounded-3xl p-12 backdrop-blur-[18px] text-center relative overflow-hidden hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] hover:-translate-y-[6px] transition-all duration-300 ease-out"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                        <div className="relative z-10">
                            <Search className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-bounce" />
                            <h3 className="text-2xl font-black text-white mb-3">Parsing Resume Data...</h3>
                            <p className="text-gray-400 text-lg">Running ATS simulation and extracting key metrics.</p>
                        </div>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 max-w-6xl mx-auto"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
                                <FileCheck className="w-8 h-8 text-blue-400 mr-3" /> Resume Intelligence Report
                            </h2>
                            <button
                                onClick={() => setResult(null)}
                                className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all duration-300"
                            >
                                Analyze Another
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* ATS Score Card */}
                            <div className="lg:col-span-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] hover:-translate-y-[6px] transition-all duration-300 ease-out">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Award className="w-32 h-32 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-6 relative z-10">ATS Compatibility Score</h3>
                                <div className="relative z-10 w-48 h-48 rounded-full border-[12px] border-[#0B1020] shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-purple-500 rotate-45"></div>
                                    <div>
                                        <span className="text-6xl font-black text-white">{result.atsScore}</span>
                                        <span className="text-xl text-gray-400 font-bold">/100</span>
                                    </div>
                                </div>
                                <p className="mt-6 text-sm text-gray-300 font-medium relative z-10">
                                    Your resume is highly compatible but missing a few critical industry keywords.
                                </p>
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                {/* Missing Keywords */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-[18px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] hover:-translate-y-[6px] transition-all duration-300 ease-out">
                                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Search className="w-5 h-5 text-purple-400 mr-3" /> Missing Industry Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {result.missingKeywords.map((keyword: string, i: number) => (
                                            <span key={i} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg font-semibold text-sm">
                                                + {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Skill Gaps */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-[18px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] hover:-translate-y-[6px] transition-all duration-300 ease-out">
                                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-400 mr-3" /> Skill Gap Analysis
                                    </h4>
                                    <ul className="space-y-4">
                                        {result.skillGaps.map((gap: string, i: number) => (
                                            <li key={i} className="flex items-start text-gray-300">
                                                <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{gap}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Grammar Issues */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-[18px] hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] hover:-translate-y-[6px] transition-all duration-300 ease-out">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                                <Sparkles className="w-5 h-5 text-blue-400 mr-3" /> Grammar & Phrasing Suggestions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.grammarIssues.map((issue: any, i: number) => (
                                    <div key={i} className="bg-[#0B1020]/50 border border-white/5 rounded-2xl p-5">
                                        <div className="mb-3">
                                            <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Current</p>
                                            <p className="text-gray-400 line-through">"{issue.text}"</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Suggested</p>
                                            <p className="text-white font-medium">"{issue.suggestion}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}
