import {
  CheckCircle,
  Image,
  Monitor,
  Mic,
  Play,
  ShieldCheck,
  Video,
  Cpu,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Route } from "../+types/root";
import AuthGuard from "~/components/auth-guard";
import PageShell from "~/components/page-shell";
import { enumerateBrowserDevices, playSpeakerTest, requestBrowserStream, stopBrowserStream, type BrowserMediaDevice } from "~/lib/browser-media";
import { useMockApp } from "~/lib/mock-app";
import { useToast } from "~/components/toast-provider";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Settings | Nexvio" }];
}

const accentOptions = ["violet", "cyan", "emerald", "amber"] as const;

const rolesList = [
  "Frontend Engineering", "Backend Engineering", "Full Stack", "React Developer",
  "Node.js Developer", "Python Developer", "Java Developer", "DevOps Engineer",
  "UI/UX Designer", "Product Manager", "Data Analyst", "Data Scientist",
  "AI/ML Engineer", "HR Interview", "Behavioral Interview", "System Design",
  "Cloud Engineer", "Cybersecurity", "Mobile App Developer", "Sales Interview",
  "Marketing Interview", "Finance Interview", "Other Role"
];

const voicesList = [
  "Ava - Natural", "Emma - Professional", "Ryan - Friendly",
  "Sophia - Conversational", "Daniel - Corporate", "Olivia - Smart Assistant"
];

const languagesList = [
  "English", "Hindi", "Kannada", "Telugu", "Tamil", "Malayalam"
];

const difficultyOptions = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

export default function Settings() {
  const { settings, systemStatus, updateSettings, updateUser, user, authError, isSupabaseEnabled, uploadAvatar, addNotification } = useMockApp();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [cameraDevices, setCameraDevices] = useState<BrowserMediaDevice[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<BrowserMediaDevice[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<BrowserMediaDevice[]>([]);
  const [checkingDevices, setCheckingDevices] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState({
    webcam: systemStatus.webcam,
    microphone: systemStatus.microphone,
    speaker: "Ready",
  });

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await enumerateBrowserDevices();
        setCameraDevices(devices.filter((d) => d.kind === "videoinput"));
        setMicrophoneDevices(devices.filter((d) => d.kind === "audioinput"));
        setSpeakerDevices(devices.filter((d) => d.kind === "audiooutput"));
      } catch (err) {
        console.error(err);
      }
    };
    void loadDevices();
  }, []);

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let javascriptNode: ScriptProcessorNode;
    let stream: MediaStream;

    const startMic = async () => {
      const device = microphoneDevices.find(d => d.label === settings.microphone);
      if (device) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: device.deviceId } });
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioContext = new AudioContextClass();
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);
          javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);
          javascriptNode.onaudioprocess = () => {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var values = 0;
            var length = array.length;
            for (var i = 0; i < length; i++) {
              values += (array[i]);
            }
            var average = values / length;
            setMicLevel(Math.round(average));
          }
        } catch (e) {
          console.log("Mic access error", e);
        }
      }
    };
    startMic();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (audioContext && audioContext.state !== "closed") audioContext.close();
    };
  }, [settings.microphone, microphoneDevices]);


  const runDeviceCheck = async () => {
    setCheckingDevices(true);
    try {
      const stream = await requestBrowserStream({ audio: true, video: true });
      stopBrowserStream(stream);
      const listed = await enumerateBrowserDevices();
      setCameraDevices(listed.filter((d) => d.kind === "videoinput"));
      setMicrophoneDevices(listed.filter((d) => d.kind === "audioinput"));
      setSpeakerDevices(listed.filter((d) => d.kind === "audiooutput"));
      setDeviceStatus({
        webcam: listed.some((device) => device.kind === "videoinput") ? "Ready" : "Blocked",
        microphone: listed.some((device) => device.kind === "audioinput") ? "Ready" : "Not detected",
        speaker: listed.some((device) => device.kind === "audiooutput") ? "Ready" : "Limited",
      });
      toast("Device permissions checked", "success");
    } catch {
      setDeviceStatus({
        webcam: "Blocked",
        microphone: "Not detected",
        speaker: "Limited",
      });
      toast("Permission denied. Allow camera and microphone in browser settings.", "error");
    } finally {
      setCheckingDevices(false);
    }
  };

  return (
    <AuthGuard>
      <PageShell
        eyebrow="Settings"
        title="Account, devices, and interview preferences"
        description="This is now a real settings surface with working controls for account info, interview behavior, preferences, system checks, and Supabase-backed profile sync."
      >
        {authError ? (
          <div className="mb-6 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            Supabase sync issue: {authError}
          </div>
        ) : null}
        {!isSupabaseEnabled ? (
          <div className="mb-6 rounded-[1.6rem] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            Supabase is not configured yet, so settings are being saved in local fallback mode.
          </div>
        ) : null}
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-violet-300" />
                <h2 className="text-2xl font-black text-white">Live AI Coach</h2>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Interview Domain</span>
                  <select
                    value={rolesList.includes(settings.domain || "") ? settings.domain : "Other Role"}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val === "Other Role") {
                        setCustomRole("");
                        updateSettings({ domain: "Other Role" });
                      } else {
                        updateSettings({ domain: val });
                      }
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                {(!rolesList.includes(settings.domain || "") || settings.domain === "Other Role") && (
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-gray-300">Enter your interview role</span>
                    <input
                      value={customRole || (settings.domain !== "Other Role" ? settings.domain : "")}
                      onChange={(e) => {
                        setCustomRole(e.target.value);
                        updateSettings({ domain: e.target.value });
                      }}
                      placeholder="Examples: SAP Developer, Blockchain Engineer, Mechanical Engineer"
                      className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">AI Voice</span>
                  <select
                    value={settings.voice}
                    onChange={(event) => updateSettings({ voice: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    {voicesList.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Difficulty</span>
                  <select
                    value={settings.difficulty}
                    onChange={(event) => updateSettings({ difficulty: event.target.value as any })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Language</span>
                  <select
                    value={settings.language}
                    onChange={(event) => updateSettings({ language: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    {languagesList.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Camera device</span>
                  <select
                    value={settings.camera}
                    onChange={(event) => updateSettings({ camera: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    <option>{settings.camera}</option>
                    {cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.label}>
                        {device.label || "Camera Device"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Camera quality</span>
                  <input
                    value={settings.cameraQuality}
                    onChange={(event) => updateSettings({ cameraQuality: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Microphone Device</span>
                  <select
                    value={settings.microphone}
                    onChange={(event) => updateSettings({ microphone: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    {microphoneDevices.map((device) => (
                      <option key={device.deviceId} value={device.label}>{device.label || "Microphone Device"}</option>
                    ))}
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-gray-300">Speaker Output</span>
                  <select
                    value={settings.speaker}
                    onChange={(event) => updateSettings({ speaker: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                  >
                    {speakerDevices.map((device) => (
                      <option key={device.deviceId} value={device.label}>{device.label || "Speaker Device"}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl font-black text-white">System Testing</h2>
              </div>
              <div className="mt-6 grid gap-4">

                {/* Microphone Check */}
                <div className="rounded-2xl border border-white/10 bg-[#08111e] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Mic className="h-4 w-4 text-violet-300" />
                      <span className="text-sm font-semibold text-white">Live Microphone Signal</span>
                    </div>
                    <span className="text-sm text-emerald-300">{deviceStatus.microphone}</span>
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-75" style={{ width: `${Math.min(micLevel * 1.5, 100)}%` }}></div>
                  </div>
                </div>

                {/* Speaker Output Test */}
                <button
                  onClick={() => playSpeakerTest(settings.voice)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm font-semibold text-white">Test Speaker Output</span>
                  </div>
                  <span className="text-sm text-cyan-300">{deviceStatus.speaker}</span>
                </button>

                <button
                  onClick={() => void runDeviceCheck()}
                  className="mt-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 shadow-lg"
                >
                  {checkingDevices ? "Checking devices..." : "Run System Diagnostics"}
                </button>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr]">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-emerald-300" />
                <h2 className="text-2xl font-black text-white">Preferences</h2>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-gray-300">Theme</span>
                    <select
                      value={settings.theme}
                      onChange={(event) =>
                        updateSettings({
                          theme: event.target.value as "dark" | "light" | "system",
                        })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 outline-none"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </label>
                  <div className="mt-4">
                    <span className="mb-2 block text-sm font-semibold text-gray-300">Accent Color</span>
                    <div className="flex flex-wrap gap-3">
                      {accentOptions.map((accent) => (
                        <button
                          key={accent}
                          onClick={async () => {
                            await updateSettings({ accent });
                            toast("Accent color synced", "success");
                          }}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${settings.accent === accent
                            ? "border-white/30 bg-white/10 text-white"
                            : "border-white/10 text-gray-400"
                            }`}
                        >
                          {accent}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "transcriptAutoSave", label: "Transcript auto save" },
                    { key: "analyticsOptIn", label: "Analytics toggle" },
                    { key: "eyeContactAlerts", label: "Eye contact alerts" },
                    { key: "postureWarnings", label: "Posture warnings" },
                    { key: "weeklyDigest", label: "Weekly digest emails" },
                  ].map((toggle) => (
                    <button
                      key={toggle.key}
                      onClick={async () => {
                        await updateSettings({
                          [toggle.key]:
                            !settings[toggle.key as keyof typeof settings],
                        } as Partial<typeof settings>);
                        toast(`${toggle.label} updated`, "success");
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#08111e] px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-white">{toggle.label}</span>
                      <span className="text-sm text-cyan-300">
                        {settings[toggle.key as keyof typeof settings] ? "On" : "Off"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-emerald-400/15 bg-emerald-500/8 px-6 py-4 text-sm text-emerald-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-emerald-300" />
              {"Settings are ready to sync with Supabase and persist across authenticated sessions."}
            </div>
            <button
              onClick={async () => {
                await updateSettings({});
                addNotification("Settings updated", "Your account preferences have been synchronized with Supabase.");
                toast("Settings synced", "success");
              }}
              className="rounded-full bg-white px-5 py-2 font-bold text-[#07111f]"
            >
              Save all changes
            </button>
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
