import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { supabase } from "~/lib/supabase";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Nexvio | Contact" }];
}

type FormField = "name" | "email" | "subject" | "message";

type FormDataState = Record<FormField, string>;
type TouchedState = Record<FormField, boolean>;

const INITIAL_FORM: FormDataState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const INITIAL_TOUCHED: TouchedState = {
  name: false,
  email: false,
  subject: false,
  message: false,
};

const fieldBaseClass =
  "w-full rounded-2xl border px-5 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300";

function validateField(field: FormField, value: string) {
  const trimmed = value.trim();

  if (field === "name") {
    if (!trimmed) return "Name is required";
    if (trimmed.length < 2) return "Use at least 2 characters";
  }

  if (field === "email") {
    if (!trimmed) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email";
  }

  if (field === "subject") {
    if (!trimmed) return "Subject is required";
    if (trimmed.length < 4) return "Add a bit more detail";
  }

  if (field === "message") {
    if (!trimmed) return "Message is required";
    if (trimmed.length < 20) return "Please add at least 20 characters";
  }

  return "";
}

function validateForm(values: FormDataState) {
  return {
    name: validateField("name", values.name),
    email: validateField("email", values.email),
    subject: validateField("subject", values.subject),
    message: validateField("message", values.message),
  };
}

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<FormField, string>>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState<TouchedState>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingPhase, setSendingPhase] = useState("Preparing request");
  const [showToast, setShowToast] = useState(false);

  const messageLength = formData.message.trim().length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.id as FormField;
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.id as FormField;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
    }));
  };

  const closeToast = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setShowToast(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextTouched: TouchedState = {
      name: true,
      email: true,
      subject: true,
      message: true,
    };

    const nextErrors = validateForm(formData);

    setTouched(nextTouched);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setSendingPhase("Sending to Web3Forms");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "83aeabae-971a-43b0-9dd4-219ba8c0b9c9",
          from_name: "Nexvio Contact Form",
          replyto: formData.email,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();
      console.log("Web3Forms response:", data);

      if (data.success) {
        setFormData(INITIAL_FORM);
        setTouched(INITIAL_TOUCHED);
        setErrors({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setShowToast(true);

        if (toastTimerRef.current) {
          window.clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = window.setTimeout(() => {
          setShowToast(false);
        }, 4000);
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      containerRef.current.style.setProperty("--x", `${e.clientX}px`);
      containerRef.current.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const renderFieldHint = (field: FormField, hint: string) => {
    if (errors[field]) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-300">
          <AlertCircle className="h-3.5 w-3.5" />
          {errors[field]}
        </span>
      );
    }

    return <span className="text-xs text-gray-500">{hint}</span>;
  };

  const getInputClassName = (field: FormField) => {
    const hasError = Boolean(errors[field]);

    return `${fieldBaseClass} ${hasError
      ? "border-red-500/50 bg-red-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(239,68,68,0.18)] focus:border-red-400 focus:bg-red-500/10 focus:ring-red-500/30"
      : "border-white/12 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_60px_rgba(8,15,30,0.2)] focus:border-cyan-400/60 focus:bg-white/10 focus:ring-cyan-400/20"
      } backdrop-blur-xl focus:ring-4`;
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#0A0A14] font-sans text-gray-50 selection:bg-cyan-400/20"
    >
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-colors duration-300"
        style={{
          background:
            "radial-gradient(600px circle at var(--x, 50vw) var(--y, 50vh), rgba(56,189,248,0.12), transparent 40%)",
        }}
      />
      <div className="pointer-events-none fixed right-[-10%] top-[10%] z-0 h-[50%] w-[50%] rounded-full bg-cyan-500/10 blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-10%] z-0 h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[150px]" />

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20 pt-32 text-center">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span>We&apos;re Here to Help</span>
            </div>
            <h1 className="mb-6 text-5xl font-black leading-none tracking-tighter text-white lg:text-7xl">
              Get in{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-gray-400 md:text-lg">
              Have questions about the AI interview workflow, analytics engine, or
              platform setup? Send a message and we&apos;ll reach out with a real
              answer, not a canned reply.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mb-24 py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <h2 className="mb-8 text-3xl font-black text-white md:text-4xl">
                Direct Connect
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    label: "Email Support",
                    value: "lingrajmalipatil1@gmail.com",
                    href: "mailto:lingrajmalipatil1@gmail.com",
                    color: "text-cyan-300",
                    bg: "bg-cyan-400/15",
                  },
                  {
                    icon: Phone,
                    label: "Phone & WhatsApp",
                    value: "+91 9901052539",
                    href: "tel:+919901052539",
                    color: "text-blue-300",
                    bg: "bg-blue-400/15",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group flex items-start space-x-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-[18px] transition-all duration-300 ease-out hover:-translate-y-[6px] hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]"
                  >
                    <div
                      className={`h-12 w-12 flex-shrink-0 rounded-xl border border-white/8 ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                    >
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold tracking-wide text-white">
                        {item.label}
                      </h3>
                      <a
                        href={item.href}
                        className="leading-relaxed text-gray-400 transition-colors hover:text-white"
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}

                <div className="group flex items-start space-x-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-[18px] transition-all duration-300 ease-out hover:-translate-y-[6px] hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]">
                  <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-white/8 bg-emerald-400/15 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Sparkles className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold tracking-wide text-white">Social & Response</h3>
                    <p className="leading-relaxed text-gray-400 text-sm">
                      Find us on <a href="https://twitter.com" className="text-cyan-300 hover:underline">Twitter</a> and <a href="https://linkedin.com" className="text-blue-300 hover:underline">LinkedIn</a>.<br />
                      <span className="text-emerald-300 font-semibold mt-1 inline-block">We usually reply within 24 hours.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_0_50px_rgba(56,189,248,0.12)] backdrop-blur-[22px] transition-all duration-300 ease-out hover:-translate-y-[6px] md:p-12"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px]" />
              <div className="relative z-10 mb-8 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white">Send a Message</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Clear validation, instant feedback, and a smoother send flow.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    Response Target
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cyan-300">
                    Under 24 hours
                  </p>
                </div>
              </div>

              <form className="relative z-10 space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-gray-300"
                    >
                      <span>Name</span>
                      {renderFieldHint("name", "Required")}
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.name)}
                      className={getInputClassName("name")}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-gray-300"
                    >
                      <span>Email</span>
                      {renderFieldHint("email", "Required")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.email)}
                      className={getInputClassName("email")}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-gray-300"
                  >
                    <span>Subject</span>
                    {renderFieldHint("subject", "What do you need help with?")}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.subject)}
                    className={getInputClassName("subject")}
                    placeholder="Mock interview setup, analytics, feedback..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-gray-300"
                  >
                    <span>Message</span>
                    {renderFieldHint("message", "Tell us enough to help quickly")}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.message)}
                    className={`${getInputClassName("message")} resize-none`}
                    placeholder="Share what you're trying to build or what's blocking you..."
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      The more context you give, the better the reply.
                    </span>
                    <span
                      className={
                        messageLength >= 20 ? "text-emerald-300" : "text-gray-500"
                      }
                    >
                      {messageLength}/20 minimum
                    </span>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isSubmitting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-4 backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Sending your message
                            </p>
                            <p className="text-xs text-cyan-200/80">{sendingPhase}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                          live
                        </span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.15,
                            ease: "linear",
                          }}
                          className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,189,248,0.35)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="fixed bottom-8 right-8 z-50 flex max-w-sm items-center gap-4 rounded-2xl border border-emerald-400/30 bg-[#07111f]/90 p-4 shadow-[0_0_40px_rgba(52,211,153,0.18)] backdrop-blur-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="flex-1 pr-2">
              <p className="font-bold text-white">Message sent successfully ✅</p>
              <p className="text-sm font-medium text-emerald-300">
                We&apos;ll get back to you within 24 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={closeToast}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
