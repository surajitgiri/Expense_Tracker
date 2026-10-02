"use client";

import Link from "next/link";
import React, { useState } from "react";
import AuthRedirectCheck from "@/components/AuthRedirectCheck";

interface Feature {
  icon: React.ReactNode;
  bg: string;
  color: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
    bg: "#ede9fe",
    color: "#7c3aed",
    title: "Smart Transaction Tracking",
    desc: "Record income and expenses in seconds with custom categories, tags, timestamps, and one-click PDF & CSV exports.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    bg: "#d1fae5",
    color: "#059669",
    title: "Live Spend Analytics",
    desc: "Interactive monthly trend charts, category breakdowns, and cash-flow comparisons that reveal exactly where every rupee goes.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    bg: "#fef3c7",
    color: "#d97706",
    title: "Category Budget Planner",
    desc: "Establish spending limits by category with real-time visual progress bars and overspend alerts before you break the bank.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    bg: "#dbeafe",
    color: "#2563eb",
    title: "Multi-Account & Multi-Currency",
    desc: "Manage cash, bank accounts, and credit cards across INR, USD, EUR, and GBP with seamless automatic balance recalculations.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    bg: "#fce7f3",
    color: "#db2777",
    title: "Recurring Subscriptions",
    desc: "Organize recurring software licenses, utilities, and memberships so you avoid unwanted renewals and surprise charges.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bg: "#ffedd5",
    color: "#ea580c",
    title: "Savings Goals & Milestones",
    desc: "Define target amounts for emergency funds, vacations, or equipment, tracking percentage progress toward financial freedom.",
  },
];

const FAQS = [
  {
    q: "Is SG-Finance completely free to use?",
    a: "Yes, SG-Finance is 100% free with no hidden charges, subscription lock-outs, or credit card requirements. You get full access to transaction tracking, category budgeting, live analytics, and export tools.",
  },
  {
    q: "How does SG-Finance help me stay on budget?",
    a: "SG-Finance enables you to establish custom monthly budgets for individual categories (such as Groceries, Utilities, Dining, and Entertainment). Visual progress meters show your real-time spend so you avoid overspending.",
  },
  {
    q: "Can I export my financial reports to CSV or PDF?",
    a: "Yes, you can export your entire transaction history, filtered date ranges, or categorical statements to CSV spreadsheets and professionally styled PDF reports anytime with one click.",
  },
  {
    q: "Is my personal financial data secure?",
    a: "Yes. All data transmissions are encrypted using standard 256-bit TLS/SSL protocols. We strictly enforce password hashing and secure token-based authentication to safeguard your information.",
  },
  {
    q: "Does SG-Finance support multiple currencies?",
    a: "Yes, SG-Finance supports INR (₹), USD ($), EUR (€), GBP (£), and other major international currencies, allowing you to track finances in your preferred currency denomination.",
  },
];

const TESTIMONIALS = [
  {
    text: "Finally a finance app that doesn't feel like a spreadsheet. The UI is stunning and budgeting is effortless.",
    author: "Priya S.",
    role: "Startup Founder",
    initials: "P",
    grad: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  },
  {
    text: "Moved from a paid app to SG-Finance — way better analytics, zero monthly fees, and clean PDF exports.",
    author: "Rahul M.",
    role: "Software Engineer",
    initials: "R",
    grad: "linear-gradient(135deg,#059669,#0d9488)",
  },
  {
    text: "Budget alerts saved me from overspending three times this month alone. A must-have tool.",
    author: "Anika T.",
    role: "Product Manager",
    initials: "A",
    grad: "linear-gradient(135deg,#db2777,#e11d48)",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "subscriptions">("overview");

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>
      {/* Background client auth redirect check (non-blocking for SSR / crawlers) */}
      <AuthRedirectCheck />

      {/* ────── HEADER & NAVIGATION ────── */}
      <header
        role="banner"
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: "rgba(9,9,15,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 select-none group">
          <div
            className="w-9 h-9 rounded-xl overflow-hidden bg-[#0C144C] border border-white/10 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform shrink-0"
            aria-hidden="true"
          >
            <img src="/logo.svg" alt="SG-Finance Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-[15px] tracking-tight leading-tight">
              SG<span className="text-amber-400">-FINANCE</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium leading-none">Since 2020</span>
          </div>
        </Link>

        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#preview" className="hover:text-white transition-colors">Workspace</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium hidden sm:inline transition-colors hover:text-white"
            style={{ color: "#9ca3af" }}
            title="Sign in to your SG-Finance account"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 h-9 px-4 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-900/40 hover:opacity-95"
            style={{ background: "#7c3aed" }}
            title="Create a free SG-Finance account"
          >
            Get started
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ────── MAIN CONTENT ────── */}
      <main id="main-content" className="flex-1">

        {/* ────── HERO SECTION ────── */}
        <section
          aria-label="Hero Section"
          className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-24 pb-16"
          style={{ background: "#09090f" }}
        >
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
            aria-hidden="true"
          />
          {/* Violet ambient glow */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          {/* Emerald ambient glow */}
          <div
            className="absolute bottom-20 left-10 w-80 h-80 pointer-events-none rounded-full"
            style={{ background: "radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)" }}
            aria-hidden="true"
          />

          <div className="relative max-w-5xl mx-auto px-6 text-center">
            {/* Value Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#9ca3af",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              Free forever · No credit card required · Instant Setup
            </div>

            {/* Main H1 - High Impact SEO Headline */}
            <h1
              className="font-black tracking-tight leading-tight mb-6 text-white"
              style={{ fontSize: "clamp(2.5rem, 6.5vw, 4.8rem)", lineHeight: 1.08 }}
            >
              Smart Expense Tracker &amp;
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #c084fc, #a78bfa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Financial Command Center
              </span>
              <span className="text-white">.</span>
            </h1>

            {/* Keyword-Rich Subheading */}
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "#9ca3af" }}>
              Take full control of your personal finances. Track every transaction, set category budgets,
              monitor recurring subscriptions, and achieve your savings goals in one beautifully unified workspace.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 text-white font-bold text-sm rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: "#7c3aed", boxShadow: "0 8px 30px rgba(124,58,237,0.38)" }}
                title="Create free personal finance account"
              >
                Start for free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-semibold text-sm rounded-xl transition-all border hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "#d1d5db" }}
                title="Sign in to your finance dashboard"
              >
                Sign in to workspace
              </Link>
            </div>

            {/* Trust and Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "#9ca3af" }}>
              {[
                "₹0 hidden fees",
                "256-bit bank encryption",
                "Dark & light mode",
                "One-click PDF & CSV export",
                "Multi-currency support",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ────── INTERACTIVE WORKSPACE PREVIEW ────── */}
        <section id="preview" aria-labelledby="preview-heading" className="py-20 bg-gray-900 border-t border-b border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 inline-block">
                Interactive Workspace
              </span>
              <h2 id="preview-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                Experience the Power of Intelligent Money Management
              </h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                Clean, instant, and frictionless. Designed to give you an immediate bird's-eye view of your financial health.
              </p>
            </div>

            {/* Tab selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 rounded-xl bg-gray-800/80 border border-gray-700/60" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    activeTab === "overview"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Dashboard Overview
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "budget"}
                  onClick={() => setActiveTab("budget")}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    activeTab === "budget"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Budget Control
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "subscriptions"}
                  onClick={() => setActiveTab("subscriptions")}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    activeTab === "subscriptions"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Subscriptions &amp; Goals
                </button>
              </div>
            </div>

            {/* Tab content mockups */}
            <div className="rounded-2xl p-6 sm:p-8 bg-gray-950/70 border border-gray-800 shadow-2xl">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Balance</span>
                      <div className="text-2xl font-bold text-white mt-1">₹1,48,250.00</div>
                      <span className="text-xs text-emerald-400 font-medium">↑ +14.2% from last month</span>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Monthly Income</span>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">₹85,000.00</div>
                      <span className="text-xs text-gray-400 font-medium">2 Active Income Sources</span>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Expenses</span>
                      <div className="text-2xl font-bold text-rose-400 mt-1">₹34,120.00</div>
                      <span className="text-xs text-emerald-400 font-medium">Under monthly budget by ₹10,880</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Recent Transactions Logged</div>
                      <div className="text-xs text-gray-400">Categorized automatically with fast search</div>
                    </div>
                    <Link
                      href="/auth/register"
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline"
                    >
                      Explore live demo &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "budget" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-200 mb-1">
                      <span>Dining &amp; Food</span>
                      <span>₹7,200 / ₹10,000 (72%)</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "72%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-200 mb-1">
                      <span>Groceries &amp; Utilities</span>
                      <span>₹12,400 / ₹15,000 (82%)</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-200 mb-1">
                      <span>Entertainment &amp; Travel</span>
                      <span>₹3,500 / ₹8,000 (43%)</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full" style={{ width: "43%" }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "subscriptions" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-sm">Netflix &amp; Spotify</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-300">Renews in 4 days</span>
                    </div>
                    <div className="text-lg font-bold text-gray-200">₹949 / month</div>
                    <span className="text-xs text-gray-400">Direct debit scheduled</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-sm">Emergency Fund Goal</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300">80% Achieved</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-400">₹2,40,000 / ₹3,00,000</div>
                    <span className="text-xs text-gray-400">₹60,000 remaining to milestone</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ────── FEATURES SECTION ────── */}
        <section id="features" aria-labelledby="features-heading" className="py-24" style={{ background: "#f8fafc" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest mb-3 inline-block" style={{ color: "#7c3aed" }}>
                Feature Suite
              </span>
              <h2
                id="features-heading"
                className="font-black tracking-tight text-gray-900 mb-4"
                style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)" }}
              >
                Complete Financial Tools in One Workspace
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-base">
                Eliminate scattered spreadsheets and complex accounting software. SG-Finance gives you every
                essential budgeting tool with modern speed and visual clarity.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className="bg-white rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: f.bg, color: f.color }}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ────── TESTIMONIALS SECTION ────── */}
        <section id="testimonials" aria-labelledby="testimonials-heading" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest mb-3 inline-block" style={{ color: "#7c3aed" }}>
                User Reviews
              </span>
              <h2
                id="testimonials-heading"
                className="font-black tracking-tight text-gray-900"
                style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)" }}
              >
                Loved by Individuals and Founders
              </h2>
              <p className="text-gray-500 text-sm mt-2">See how everyday users stay financially organized with SG-Finance.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <article
                  key={t.author}
                  className="rounded-2xl p-6 border border-gray-100 flex flex-col justify-between"
                  style={{ background: "#f8fafc" }}
                >
                  <div>
                    <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars rating">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="text-sm text-gray-700 mb-6 leading-relaxed italic">
                      "{t.text}"
                    </blockquote>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                    <div
                      className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm"
                      style={{ background: t.grad }}
                      aria-hidden="true"
                    >
                      {t.initials}
                    </div>
                    <div>
                      <cite className="not-italic text-sm font-semibold text-gray-900 block">{t.author}</cite>
                      <span className="text-xs text-gray-500">{t.role}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ────── FAQ SECTION (RICH SNIPPETS MATCHING SCHEMA) ────── */}
        <section id="faq" aria-labelledby="faq-heading" className="py-24 bg-gray-50 border-t border-gray-200/60">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2 inline-block">
                Frequently Asked Questions
              </span>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">
                Everything You Need to Know
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Got questions about our expense tracker, budgeting features, security, or data export? We have you covered.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-gray-900 font-bold text-base hover:text-violet-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ────── CTA BANNER ────── */}
        <section aria-labelledby="cta-heading" className="py-24 relative overflow-hidden" style={{ background: "#09090f" }}>
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div
                className="w-96 h-48 rounded-full"
                style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)" }}
              />
            </div>
            <span className="relative text-xs font-bold uppercase tracking-widest mb-4 inline-block" style={{ color: "#a78bfa" }}>
              Get Started Today
            </span>
            <h2
              id="cta-heading"
              className="relative font-black tracking-tight text-white mb-5"
              style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
            >
              Take Control of<br />Your Finances Today.
            </h2>
            <p className="relative mb-10 max-w-md mx-auto text-base text-gray-400">
              Join thousands of smart savers who manage their money effortlessly with SG-Finance. Free, private, and always available.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 text-white font-bold text-sm rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: "#7c3aed", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}
                title="Create a free SG-Finance account"
              >
                Create free account
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-semibold text-sm rounded-xl border transition-all hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#d1d5db", background: "rgba(255,255,255,0.04)" }}
                title="Sign in to your account"
              >
                Sign in to workspace
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ────── FOOTER ────── */}
      <footer role="contentinfo" style={{ background: "#060609", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg overflow-hidden bg-[#0C144C] border border-white/10 flex items-center justify-center p-0.5"
              aria-hidden="true"
            >
              <img src="/logo.svg" alt="SG-Finance Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              SG<span className="text-amber-400">-FINANCE</span>
            </span>
          </div>

          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} SG-Finance · Built for smart personal money management.
          </p>

          <nav aria-label="Footer Links" className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
