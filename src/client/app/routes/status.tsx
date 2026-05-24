import { Activity, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "System Status | Nexvio" }];
}

export default function Status() {
    const services = [
        "AI Interview Engine",
        "Voice Detection",
        "Camera Detection",
        "Resume Analyzer",
        "Dashboard Services"
    ];

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-32 sm:px-6 lg:px-8 text-center relative overflow-hidden min-h-screen bg-[#0A0A14] flex flex-col justify-center items-center">
            <div className="absolute top-[30%] right-[30%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>
            <Activity className="w-20 h-20 text-emerald-400 mb-8 relative z-10 animate-pulse" />
            <h1 className="text-5xl font-black text-white mb-6 relative z-10">System Status</h1>
            <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 mb-12 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-emerald-300 mb-6 flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6" /> All systems are operational
                </h2>
                <div className="space-y-4">
                    {services.map(service => (
                        <div key={service} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <span className="text-gray-300 font-medium">{service}</span>
                            <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs px-3 py-1 bg-emerald-500/20 rounded-full">Active</span>
                        </div>
                    ))}
                </div>
            </div>
            <Link to="/" className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/20 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <ArrowLeft className="w-5 h-5" />
                Back Home
            </Link>
        </div>
    );
}