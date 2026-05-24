import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { useState } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import AppSidebar from "./components/app-sidebar";
import AppTopbar from "./components/app-topbar";
import { MockAppProvider } from "./lib/mock-app";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { ToastProvider } from "./components/toast-provider";

export default function App() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const appRoutePrefixes = [
    "/dashboard",
    "/live-interview",
    "/analysis",
    "/resume-analyzer",
    "/settings",
    "/reports",
    "/history",
    "/notifications",
    "/billing",
    "/ai-coach",
  ];
  const isAppRoute = appRoutePrefixes.some((prefix) => location.pathname.startsWith(prefix));

  return (
    <ToastProvider>
      <MockAppProvider>
        {isAppRoute ? (
          <div className="flex h-screen bg-[#07111f] text-gray-50 overflow-hidden">
          <AppSidebar
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((current) => !current)}
          />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <AppTopbar onMenuToggle={() => setIsSidebarCollapsed((current) => !current)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-grow pt-24">
            <Outlet />
          </main>
          <Footer />
        </div>
      )}
      </MockAppProvider>
    </ToastProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
