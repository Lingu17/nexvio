import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import type { Route } from "../+types/root";
import { useEffect, useRef, useState } from "react";
import { healthCheck as interviewAnalysisMicroSvcHealthCheck } from "~/backend/interview-analysis/client";
import type { HealthCheckResponse } from "~/backend/interview-analysis/stubs";
import { healthCheck as postureAnalysisMicroSvcHealthCheck } from "~/backend/posture-analysis/client";
import type { PostureHealthCheckResponse } from "~/backend/posture-analysis/stubs";

interface ApiState {
  interview: {
    data: HealthCheckResponse | null;
    loading: boolean;
    error: string | null;
  };
  posture: {
    data: PostureHealthCheckResponse | null;
    loading: boolean;
    error: string | null;
  };
}

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Nexvio | System Health" }];
}

export default function HealthCheck() {
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

  const [apiState, setApiState] = useState<ApiState>({
    interview: {
      data: null,
      loading: true,
      error: null,
    },
    posture: {
      data: null,
      loading: true,
      error: null,
    },
  });

  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthStatus = async () => {
    setRefreshing(true);

    // Reset loading states
    setApiState((prev) => ({
      interview: { ...prev.interview, loading: true, error: null },
      posture: { ...prev.posture, loading: true, error: null },
    }));

    // Fetch interview API health
    try {
      const interviewData = await interviewAnalysisMicroSvcHealthCheck();
      setApiState((prev) => ({
        ...prev,
        interview: {
          data: interviewData.data,
          loading: false,
          error: null,
        },
      }));
    } catch (error) {
      setApiState((prev) => ({
        ...prev,
        interview: {
          data: null,
          loading: false,
          error: "Failed to connect to Interview API",
        },
      }));
    }

    // Fetch posture API health
    try {
      const postureData = await postureAnalysisMicroSvcHealthCheck();
      setApiState((prev) => ({
        ...prev,
        posture: {
          data: postureData.data,
          loading: false,
          error: null,
        },
      }));
    } catch (error) {
      setApiState((prev) => ({
        ...prev,
        posture: {
          data: null,
          loading: false,
          error: "Failed to connect to Posture API",
        },
      }));
    }

    setRefreshing(false);
  };

  useEffect(() => {
    fetchHealthStatus();

    // Set up interval to refresh status every 30 seconds
    const intervalId = setInterval(fetchHealthStatus, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const getStatusIcon = (service: "interview" | "posture") => {
    const { data, loading, error } = apiState[service];

    if (loading)
      return (
        <div className="w-8 h-8 border-4 border-t-purple-500 border-white/10 rounded-full animate-spin" />
      );
    if (error) return <XCircle className="w-8 h-8 text-red-500" />;
    if (data?.status === "ok")
      return <CheckCircle className="w-8 h-8 text-emerald-500" />;
    return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
  };

  const getStatusClass = (service: "interview" | "posture") => {
    const { data, loading, error } = apiState[service];

    if (loading) return "border-white/5 bg-white/[0.02]";
    if (error) return "border-red-500/30 bg-red-500/5";
    if (data?.status === "ok") return "border-emerald-500/30 bg-emerald-500/5";
    return "border-amber-500/30 bg-amber-500/5";
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A14] text-gray-50 font-sans relative overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Mouse Glow */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300" style={{ background: "radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(120,90,255,0.08), transparent 40%)" }} />
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-6 max-w-[1400px] mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Live Server Diagnostics</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6 text-white">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Health Status</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Monitor the real-time operational status of all background API microservices powering Nexvio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Health Status Cards */}
      <section className="py-12 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex justify-end mb-8">
            <button
              onClick={fetchHealthStatus}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RefreshCw
                className={`h-4 w-4 text-purple-400 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interview API Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`border rounded-[2rem] backdrop-blur-[18px] overflow-hidden transition-all duration-300 ease-out hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] relative group hover:-translate-y-[6px] ${getStatusClass(
                "interview"
              )}`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <h2 className="text-2xl font-black text-white flex items-center">
                    <Server className="w-6 h-6 text-purple-400 mr-3" />
                    Interview Engine
                  </h2>
                  {getStatusIcon("interview")}
                </div>

                {apiState.interview.loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  </div>
                ) : apiState.interview.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                    <p>{apiState.interview.error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Status:
                      </span>
                      <span className="text-emerald-400 font-black tracking-wide">
                        {apiState.interview.data?.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Service:
                      </span>
                      <span className="text-white font-medium">{apiState.interview.data?.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Queue:
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-md font-bold text-xs">
                        {apiState.interview.data?.queue_size} tasks in queue
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Posture API Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`border rounded-[2rem] backdrop-blur-[18px] overflow-hidden transition-all duration-300 ease-out hover:shadow-[0_0_40px_rgba(120,90,255,0.15)] relative group hover:-translate-y-[6px] ${getStatusClass(
                "posture"
              )}`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <h2 className="text-2xl font-black text-white flex items-center">
                    <Server className="w-6 h-6 text-blue-400 mr-3" />
                    Posture Engine
                  </h2>
                  {getStatusIcon("posture")}
                </div>

                {apiState.posture.loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  </div>
                ) : apiState.posture.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                    <p>{apiState.posture.error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Status:
                      </span>
                      <span className="text-emerald-400 font-black tracking-wide">
                        {apiState.posture.data?.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Service:
                      </span>
                      <span className="text-white font-medium">{apiState.posture.data?.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Version:
                      </span>
                      <span className="text-white font-medium">{apiState.posture.data?.version}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-24">
                        Queue:
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-md font-bold text-xs">
                        {apiState.posture.data?.queue_size} tasks in queue
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* System Status Summary */}
      <section className="py-12 relative z-10 mb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Overall System Status */}
            {apiState.interview.loading || apiState.posture.loading ? (
              <p className="text-lg font-bold text-gray-400 animate-pulse">Running live diagnostics...</p>
            ) : apiState.interview.error || apiState.posture.error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-10 text-center backdrop-blur-[18px]">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-2">
                  Partial Degradation Detected
                </p>
                <p className="text-red-400">
                  Please check individual services for details
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-10 text-center backdrop-blur-[18px] relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4 relative z-10" />
                <p className="text-2xl font-black text-white mb-2 relative z-10">
                  All Systems Operational
                </p>
                <p className="text-emerald-400 font-medium relative z-10">
                  Machine learning clusters are online and receiving traffic.
                </p>
              </div>
            )}

            {/* Last Updated */}
            <p className="text-sm text-gray-500 mt-8">
              Auto-syncs every 30s • Last probe: {new Date().toLocaleTimeString()}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
