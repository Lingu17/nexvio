import { BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Our Story | Nexvio" }];
}

export default function Story() {
    return (
        <div className="mx-auto max-w-[1440px] px-4 py-32 sm:px-6 lg:px-8 text-center relative overflow-hidden min-h-screen bg-[#0A0A14] flex flex-col justify-center items-center">
            <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>
            <BookOpen className="w-24 h-24 text-blue-400 mb-8 relative z-10" />
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 relative z-10">Our Story</h1>
            <p className="text-gray-300 text-2xl max-w-3xl mb-12 relative z-10 leading-relaxed font-medium">
                Started with a vision to make interview preparation smarter, more accessible, and powered by AI for everyone.
            </p>
            <Link to="/" className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/20 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <ArrowLeft className="w-5 h-5" />
                Back Home
            </Link>
        </div>
    );
}