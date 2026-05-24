import type { ReactNode } from "react";

export default function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.34em] text-cyan-300/80">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-400 sm:text-lg">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
