import { Cookie, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Cookie Policy | Nexvio" }];
}

export default function Cookies() {
    return (
        <div className="mx-auto max-w-[1440px] px-4 py-32 sm:px-6 lg:px-8 text-center relative overflow-hidden min-h-screen bg-[#0A0A14] flex flex-col justify-center items-center">
            <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <Cookie className="w-20 h-20 text-amber-400 mb-8 relative z-10 animate-bounce" />
            <h1 className="text-5xl font-black text-white mb-6 relative z-10">Cookie Policy</h1>
            <p className="text-gray-400 text-lg max-w-2xl mb-12 relative z-10 leading-relaxed">
                This page is currently under development. <br /><br />
                We’re working hard to bring complete information and transparency for our users. <br /><br />
                Thank you for your patience ❤️
            </p>
            <Link to="/" className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/20 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <ArrowLeft className="w-5 h-5" />
                Back Home
            </Link>
        </div>
    );
}