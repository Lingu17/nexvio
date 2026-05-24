import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type ThemeMode = "dark" | "light" | "system";
type AccentColor = "violet" | "cyan" | "emerald" | "amber";
type OAuthProvider = "google" | "github";

export type InterviewRecord = {
  id: string;
  role: string;
  type: "Behavioral" | "Technical" | "HR" | "System Design";
  date: string;
  score: number;
  confidence: number;
  posture: number;
  fillerWords: number;
  status: "Completed" | "Needs Review" | "Scheduled";
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type AppUser = {
  id?: string;
  name: string;
  email: string;
  title: string;
  companyFocus: string;
  avatar: string;
  authenticated: boolean;
};

export type PDFReport = {
  id: string;
  interviewId: string;
  role: string;
  date: string;
  score: number;
  pdfUrl: string;
};

export type AppSettings = {
  difficulty: Difficulty;
  voice: string;
  language: string;
  domain: string;
  camera: string;
  cameraQuality: string;
  microphone: string;
  speaker: string;
  theme: ThemeMode;
  accent: AccentColor;
  transcriptAutoSave: boolean;
  analyticsOptIn: boolean;
  eyeContactAlerts: boolean;
  postureWarnings: boolean;
  weeklyDigest: boolean;
  profilePicture: string;
  pdfReports?: PDFReport[];
};

type SystemStatus = {
  webcam: "Ready" | "Blocked";
  microphone: "Ready" | "Not detected";
  latency: number;
  browser: "Optimized" | "Limited";
};

type AppState = {
  user: AppUser;
  settings: AppSettings;
  interviews: InterviewRecord[];
  notifications: NotificationItem[];
  systemStatus: SystemStatus;
  authLoading: boolean;
  authError: string;
  isSupabaseEnabled: boolean;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  addNotification: (title: string, body: string) => void;
  signIn: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (name: string, email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  addInterview: (record: InterviewRecord) => Promise<void>;
};

const STORAGE_KEY = "nexvio-app-state";

const defaultUser: AppUser = {
  name: "Guest Candidate",
  email: "",
  title: "Aspiring Frontend Engineer",
  companyFocus: "Product companies",
  avatar: "GV",
  authenticated: false,
};

const defaultSettings: AppSettings = {
  difficulty: "Intermediate",
  voice: "Ava - Natural",
  language: "English",
  domain: "Frontend Engineering",
  camera: "Default Camera",
  cameraQuality: "1080p",
  microphone: "Default USB Mic",
  speaker: "Default Speaker",
  theme: "dark",
  accent: "violet",
  transcriptAutoSave: true,
  analyticsOptIn: true,
  eyeContactAlerts: true,
  postureWarnings: true,
  weeklyDigest: true,
  profilePicture: "GV",
  pdfReports: [],
};

const fallbackInterviews: InterviewRecord[] = [
  {
    id: "int-001",
    role: "Frontend Developer",
    type: "Technical",
    date: "May 20, 2026",
    score: 91,
    confidence: 89,
    posture: 92,
    fillerWords: 4,
    status: "Completed",
    summary: "Strong debugging story with clear impact and confident delivery.",
    strengths: ["Clear structure", "Good eye contact", "Strong product thinking"],
    weaknesses: ["Pace slightly rushed", "Business impact could come earlier"],
  },
  {
    id: "int-002",
    role: "SDE Intern",
    type: "Behavioral",
    date: "May 18, 2026",
    score: 84,
    confidence: 82,
    posture: 86,
    fillerWords: 8,
    status: "Needs Review",
    summary: "Good examples, but a few answers drifted before reaching the point.",
    strengths: ["Friendly tone", "Good STAR framing"],
    weaknesses: ["Rambling opening", "More concise answers needed"],
  },
];

const defaultNotifications: NotificationItem[] = [
  {
    id: "note-001",
    title: "Weekly trend improved",
    body: "Confidence score is up 7% compared with last week.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "note-002",
    title: "Transcript saved",
    body: "Your React performance mock interview was auto-saved.",
    time: "1 hour ago",
    unread: true,
  },
];

const defaultSystemStatus: SystemStatus = {
  webcam: "Ready",
  microphone: "Ready",
  latency: 86,
  browser: "Optimized",
};

const MockAppContext = createContext<AppState | null>(null);

type PersistedState = {
  user: AppUser;
  settings: AppSettings;
  interviews: InterviewRecord[];
  notifications: NotificationItem[];
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  title: string | null;
  company_focus: string | null;
  avatar: string | null;
  settings: AppSettings | null;
};

type InterviewRow = {
  id: string;
  user_id: string;
  role_applied: string;
  company_name: string | null;
  interview_type: string;
  status: string;
  interview_date: string;
  completed_at: string | null;
  duration: number | null;
  overall_rating: number;
  communication_score: number;
  technical_score: number;
  behavioral_score: number;
  confidence: number;
  body_language_score: number;
  posture: string;
  filler_words: number;
  summary: string;
  strengths: string[] | null;
  weaknesses: string[] | null;
};

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function persistState(state: PersistedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mapAuthUser(user: User): AppUser {
  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : user.email?.split("@")[0] || "Candidate";

  return {
    id: user.id,
    name: fullName,
    email: user.email ?? "",
    title:
      typeof user.user_metadata.title === "string"
        ? user.user_metadata.title
        : defaultUser.title,
    companyFocus:
      typeof user.user_metadata.company_focus === "string"
        ? user.user_metadata.company_focus
        : defaultUser.companyFocus,
    avatar: fullName
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2),
    authenticated: true,
  };
}

function mapInterviewRow(row: InterviewRow): InterviewRecord {
  let mappedStatus: InterviewRecord["status"] = "Completed";
  if (row.status?.toLowerCase() === "scheduled") mappedStatus = "Scheduled";
  else if (row.status?.toLowerCase() === "needs review") mappedStatus = "Needs Review";

  let mappedType: InterviewRecord["type"] = "Technical";
  if (row.interview_type?.includes("Behavioral")) mappedType = "Behavioral";
  else if (row.interview_type?.includes("HR")) mappedType = "HR";
  else if (row.interview_type?.includes("System")) mappedType = "System Design";

  return {
    id: row.id,
    role: row.role_applied || "",
    type: mappedType,
    date: new Date(row.interview_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    score: row.overall_rating || 0,
    confidence: row.confidence || 0,
    posture: row.body_language_score || 0,
    fillerWords: row.filler_words || 0,
    status: mappedStatus,
    summary: row.summary || "",
    strengths: Array.isArray(row.strengths) ? row.strengths : [],
    weaknesses: Array.isArray(row.weaknesses) ? row.weaknesses : [],
  };
}

async function ensureProfileRow(user: AppUser, settings: AppSettings) {
  if (!supabase || !user.id) return;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.name,
      email: user.email,
      title: user.title,
      company_focus: user.companyFocus,
      avatar: user.avatar,
      settings,
    },
    { onConflict: "id" }
  );
}

export function MockAppProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersistedState();
  const [user, setUser] = useState<AppUser>(persisted?.user ?? defaultUser);
  const [settings, setSettings] = useState<AppSettings>(persisted?.settings ?? defaultSettings);
  const [interviews, setInterviews] = useState<InterviewRecord[]>(
    persisted?.interviews ?? fallbackInterviews
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    persisted?.notifications ?? defaultNotifications
  );
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    persistState({ user, settings, interviews, notifications });
  }, [interviews, notifications, settings, user]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.accent = settings.accent || 'violet';
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        // System
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    }
  }, [settings.accent, settings.theme]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    const client = supabase;

    let mounted = true;

    const syncSession = async (session: Session | null) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(defaultUser);
        setInterviews([]);
        setAuthLoading(false);
        return;
      }

      const nextUser = mapAuthUser(session.user);
      setUser(nextUser);

      const [{ data: profile }, { data: rows }] = await Promise.all([
        client.from("profiles").select("*").eq("id", session.user.id).maybeSingle<ProfileRow>(),
        client
          .from("interviews")
          .select("*")
          .eq("user_id", session.user.id)
          .order("interview_date", { ascending: false })
          .returns<InterviewRow[]>(),
      ]);

      if (profile) {
        setUser((current) => ({
          ...current,
          name: profile.full_name || current.name,
          email: profile.email || current.email,
          title: profile.title || current.title,
          companyFocus: profile.company_focus || current.companyFocus,
          avatar: profile.avatar || current.avatar,
        }));
        if (profile.settings) {
          setSettings((current) => ({ ...current, ...profile.settings }));
        }
      } else {
        await ensureProfileRow(nextUser, settings);
      }

      setInterviews((rows ?? []).map(mapInterviewRow));
      setAuthLoading(false);
    };

    void client.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAuthError(error.message);
      }
      void syncSession(data.session);
    });

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session) => {
        void syncSession(session);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    }
    
    // Set global CSS variables for accent color
    const accents: Record<string, { primary: string; secondary: string }> = {
      violet: { primary: "#8b5cf6", secondary: "#06b6d4" },
      cyan: { primary: "#06b6d4", secondary: "#3b82f6" },
      emerald: { primary: "#10b981", secondary: "#14b8a6" },
      amber: { primary: "#f59e0b", secondary: "#f43f5e" },
    };
    
    const color = accents[settings.accent as string] || accents.violet;
    root.style.setProperty("--accent-primary", color.primary);
    root.style.setProperty("--accent-secondary", color.secondary);
  }, [settings.theme, settings.accent]);

  const value = useMemo<AppState>(
    () => ({
      user,
      settings,
      interviews,
      notifications,
      systemStatus: defaultSystemStatus,
      authLoading,
      authError,
      isSupabaseEnabled: isSupabaseConfigured,
      updateUser: async (updates) => {
        const nextUser = { ...user, ...updates };
        setUser(nextUser);
        if (supabase && nextUser.id) {
          setAuthError("");
          await ensureProfileRow(nextUser, settings);
        }
      },
      updateSettings: async (updates) => {
        const nextSettings = { ...settings, ...updates };
        setSettings(nextSettings);
        if (supabase && user.id) {
          setAuthError("");
          await ensureProfileRow(user, nextSettings);
        }
      },
      markNotificationRead: (id) =>
        setNotifications((current) =>
          current.map((item) => (item.id === id ? { ...item, unread: false } : item))
        ),
      addNotification: (title, body) => {
        const newItem = {
          id: `notif-${Math.random().toString(36).substring(2, 9)}`,
          title,
          body,
          time: "Just now",
          unread: true,
        };
        setNotifications((current) => [newItem, ...current]);
      },
      signIn: async (email) => {
        if (!supabase) {
          setUser((current) => ({ ...current, email, authenticated: true }));
          return;
        }
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        setAuthError("");
      },
      signInWithPassword: async (email, password) => {
        if (!supabase) {
          setUser((current) => ({ ...current, email, authenticated: true }));
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        setAuthError("");
      },
      signUpWithPassword: async (name, email, password) => {
        if (!supabase) {
          setUser({
            ...defaultUser,
            name,
            email,
            authenticated: true,
            avatar: name
              .split(" ")
              .map((part) => part.charAt(0).toUpperCase())
              .join("")
              .slice(0, 2),
          });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name,
              title: defaultUser.title,
              company_focus: defaultUser.companyFocus,
            },
          },
        });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        setAuthError("");
      },
      signInWithOAuth: async (provider) => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        setAuthError("");
      },
      signOut: async () => {
        if (!supabase) {
          setUser(defaultUser);
          return;
        }
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        setAuthError("");
        setUser(defaultUser);
        setInterviews([]);
      },
      uploadAvatar: async (file: File) => {
        if (!supabase) throw new Error("Supabase is not configured.");
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        
        await supabase.from("profiles").update({ avatar: data.publicUrl }).eq("id", user.id);
        setUser((current) => ({ ...current, avatar: data.publicUrl }));
        return data.publicUrl;
      },
      addInterview: async (record) => {
        setInterviews((current) => [record, ...current.filter((item) => item.id !== record.id)]);

        if (!supabase || !user.id) {
          return;
        }

        const isoDate = new Date(record.date).toString() === "Invalid Date"
          ? new Date().toISOString()
          : new Date(record.date).toISOString();

        const { error } = await supabase.from("interviews").upsert(
          {
            id: record.id,
            user_id: user.id,
            role_applied: record.role,
            interview_type: record.type,
            interview_date: isoDate,
            overall_rating: record.score,
            confidence: record.confidence,
            body_language_score: record.posture,
            posture: record.posture >= 80 ? "Good" : "Slouching",
            filler_words: record.fillerWords,
            status: record.status.toLowerCase(),
            summary: record.summary,
            strengths: record.strengths,
            weaknesses: record.weaknesses,
          },
          { onConflict: "id" }
        );

        if (error) {
          setAuthError(error.message);
        }
      },
    }),
    [authError, authLoading, interviews, notifications, settings, user]
  );

  return <MockAppContext.Provider value={value}>{children}</MockAppContext.Provider>;
}

export function useMockApp() {
  const context = useContext(MockAppContext);
  if (!context) {
    throw new Error("useMockApp must be used within MockAppProvider");
  }
  return context;
}

export function getAccentClasses(accent: AccentColor) {
  const accents = {
    violet: "from-violet-500 to-fuchsia-500",
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };

  return accents[accent];
}
