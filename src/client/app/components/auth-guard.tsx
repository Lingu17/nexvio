import type { ReactNode } from "react";
import { Lock, LoaderCircle } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router";
import { useMockApp } from "~/lib/mock-app";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, authLoading } = useMockApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-20 text-center backdrop-blur-2xl">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-cyan-300" />
        <p className="mt-4 text-sm font-semibold text-white">Loading your Nexvio workspace...</p>
      </div>
    );
  }

  if (!user.authenticated) {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-20 text-center backdrop-blur-2xl">
        <Lock className="mx-auto h-8 w-8 text-cyan-300" />
        <p className="mt-4 text-lg font-bold text-white">Please sign in to continue.</p>
        <p className="mt-2 text-sm text-gray-400">Protected product routes are available after authentication.</p>
        <Link
          to="/signup"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white"
        >
          Create account
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
