import { Rocket, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Careers | Nexvio" }];
}

export default function Careers() {
    return (
        <div className="mx-auto max-w-[1440px] px-4 py-32 sm:px-6 lg:px-8 text-center relative overflow-hidden min-h-screen bg-[#0A0A14] flex flex-col justify-center items-center">
            <div className="absolute top-[30%] right-[30%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>
            <Rocket className="w-24 h-24 text-emerald-400 mb-8 relative z-10" />
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 relative z-10">Join Our Team</h1>
            <p className="text-gray-300 text-xl max-w-2xl mb-10 relative z-10 leading-relaxed">
                We’re building the future of AI-powered career preparation.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold mb-12 relative z-10 text-lg">
                Hiring Soon 🚀
            </div>
            <Link to="/" className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/20 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <ArrowLeft className="w-5 h-5" />
                Back Home
            </Link>
        </div>
    );
}