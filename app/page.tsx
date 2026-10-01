"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>,
    bg: "#ede9fe", color: "#7c3aed", title: "Smart Transactions",
    desc: "Log income and expenses in seconds. Categorize, filter, search, and export to CSV or PDF.",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    bg: "#d1fae5", color: "#059669", title: "Live Analytics",
    desc: "Trend charts, monthly comparisons, spend breakdowns. Know exactly where your money goes.",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    bg: "#fef3c7", color: "#d97706", title: "Budget Control",
    desc: "Set category budgets, get alerts before you overspend, and track savings month by month.",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    bg: "#dbeafe", color: "#2563eb", title: "Multi-Account",
    desc: "Link bank accounts, cash wallets, and credit cards. Balances update automatically.",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    bg: "#fce7f3", color: "#db2777", title: "Subscriptions",
    desc: "Track recurring bills automatically. Never miss a renewal or get caught off-guard.",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    bg: "#ffedd5", color: "#ea580c", title: "Savings Goals",
    desc: "Set financial targets and watch your progress grow. Retire early, travel more, stress less.",
  },
];

const TESTIMONIALS = [
  { text: "Finally a finance app that doesn't feel like a spreadsheet. The UI is stunning.", author: "Priya S.", role: "Startup Founder", initials: "P", grad: "linear-gradient(135deg,#7c3aed,#4f46e5)" },
  { text: "Moved from a paid app to SG-Finance — way better analytics, completely free.", author: "Rahul M.", role: "Software Engineer", initials: "R", grad: "linear-gradient(135deg,#059669,#0d9488)" },
  { text: "Budget alerts saved me from overspending three times this month alone.", author: "Anika T.", role: "Product Manager", initials: "A", grad: "linear-gradient(135deg,#db2777,#e11d48)" },
];

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const getCookieToken = () => {
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      const val = match ? decodeURIComponent(match[1]).trim() : null;
      return val && val !== "null" && val !== "undefined" && val !== "" ? val : null;
    };
    const localToken = localStorage.getItem("token");
    const validLocal = localToken && localToken !== "null" && localToken !== "undefined" && localToken.trim() !== "" ? localToken.trim() : null;
    const token = getCookieToken() || validLocal;
    if (!token) { setCheckingAuth(false); return; }
    fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.ok) {
          if (!getCookieToken()) document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
          router.replace("/home/dashboard");
        } else {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#09090f" }}>
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ────── NAVBAR ────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs tracking-tight text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>SG</div>
          <span className="font-bold text-white text-[15px] tracking-tight">SG<span style={{ color: "#a78bfa" }}>-Finance</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium hidden sm:inline" style={{ color: "#9ca3af" }}>Sign in</Link>
          <Link href="/auth/register"
            className="inline-flex items-center gap-1.5 h-9 px-4 text-white text-sm font-semibold rounded-xl transition"
            style={{ background: "#7c3aed" }}
          >
            Get started
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </header>

      {/* ────── HERO ────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{ background: "#09090f" }}
      >
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        {/* violet glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)", filter: "blur(1px)" }} />
        {/* emerald glow bottom left */}
        <div className="absolute bottom-20 left-10 w-80 h-80 pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%)" }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#9ca3af" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free forever · No credit card required
          </div>

          {/* headline */}
          <h1 className="font-black tracking-tight leading-tight mb-6 text-white"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", lineHeight: 1.05 }}>
            Your financial
            <br />
            <span style={{ background: "linear-gradient(90deg, #c084fc, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              command center
            </span>
            <span className="text-white">.</span>
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "#9ca3af" }}>
            Track every rupee, manage budgets, hit savings goals —
            all in one beautifully crafted workspace.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 text-white font-bold text-sm rounded-xl transition-all"
              style={{ background: "#7c3aed", boxShadow: "0 8px 30px rgba(124,58,237,0.35)" }}>
              Start for free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-semibold text-sm rounded-xl transition-all border"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "#d1d5db" }}>
              Sign in to workspace
            </Link>
          </div>

          {/* trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "#6b7280" }}>
            {["₹0 hidden fees", "256-bit encrypted", "Dark mode built-in", "Export PDF & CSV"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ────── FEATURES ────── */}
      <section className="py-24" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7c3aed" }}>Features</p>
            <h2 className="font-black tracking-tight text-gray-900 mb-4" style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)" }}>
              Everything in one workspace
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-base">
              From daily transactions to long-term goals — SG-Finance has every financial tool you need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg border border-gray-100 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: f.bg, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── TESTIMONIALS ────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7c3aed" }}>Testimonials</p>
            <h2 className="font-black tracking-tight text-gray-900" style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)" }}>
              Loved by users
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="rounded-2xl p-6 border border-gray-100" style={{ background: "#f8fafc" }}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm"
                    style={{ background: t.grad }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── CTA BANNER ────── */}
      <section className="py-24" style={{ background: "#09090f" }}>
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-40 rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)", filter: "blur(2px)" }} />
          </div>
          <p className="relative text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>Get started today</p>
          <h2 className="relative font-black tracking-tight text-white mb-5" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
            Take control of<br />your finances.
          </h2>
          <p className="relative mb-10 max-w-sm mx-auto text-base" style={{ color: "#9ca3af" }}>
            Join thousands who manage their money smarter with SG-Finance. Free, forever.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 text-white font-bold text-sm rounded-xl"
              style={{ background: "#7c3aed", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}>
              Create free account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-semibold text-sm rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "#d1d5db", background: "rgba(255,255,255,0.04)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer style={{ background: "#060609", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] tracking-tight text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>SG</div>
            <span className="text-sm font-bold text-white">SG-Finance</span>
          </div>
          <p className="text-xs text-center" style={{ color: "#6b7280" }}>
            © {new Date().getFullYear()} SG-Finance · Built for smart money decisions.
          </p>
          <div className="flex items-center gap-5 text-xs" style={{ color: "#6b7280" }}>
            <Link href="/auth/register" className="hover:text-white transition">Register</Link>
            <Link href="/auth/login" className="hover:text-white transition">Login</Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
