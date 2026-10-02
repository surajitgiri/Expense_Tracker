"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCurrency, CURRENCIES, Currency } from "@/context/CurrencyContext";

const CURRENCY_METADATA: Record<string, { flag: string; region: string; sample: string }> = {
  INR: { flag: "🇮🇳", region: "India", sample: "₹ 50,000.00" },
  USD: { flag: "🇺🇸", region: "United States", sample: "$ 2,500.00" },
  EUR: { flag: "🇪🇺", region: "Eurozone", sample: "€ 2,200.00" },
  GBP: { flag: "🇬🇧", region: "United Kingdom", sample: "£ 1,950.00" },
  JPY: { flag: "🇯🇵", region: "Japan", sample: "¥ 320,000" },
  AUD: { flag: "🇦🇺", region: "Australia", sample: "A$ 3,400.00" },
  CAD: { flag: "🇨🇦", region: "Canada", sample: "C$ 3,100.00" },
};

interface TourStep {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  routeHref?: string;
  routeLabel?: string;
  iconBg: string;
  iconColor: string;
  gradient: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    tag: "WELCOME TO SG-FINANCE",
    title: "Your Financial Command Center",
    subtitle: "Master your wealth with complete clarity",
    description:
      "SG-Finance gives you full control over where every unit of money goes. Track daily expenses, stay disciplined with category budgets, and reach your savings goals faster with real-time sync.",
    bullets: [
      "100% Free with bank-grade 256-bit encryption",
      "Real-time sync across desktop, tablet, and mobile",
      "Dynamic dark and light mode aesthetics",
    ],
    iconBg: "rgba(124, 58, 237, 0.15)",
    iconColor: "#a78bfa",
    gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    tag: "CORE FEATURE #1",
    title: "Smart Transactions & PDF Statements",
    subtitle: "Effortless logging & executive exports",
    description:
      "Record every transaction with precise category tags, notes, dates, and accounts. Filter by date ranges and export high-resolution, branded PDF statements formatted in your chosen currency.",
    bullets: [
      "Instant search & custom category-based filtering",
      "Download executive PDF statements & CSV exports",
      "Automatic linking to your cash and bank accounts",
    ],
    routeHref: "/home/transactions",
    routeLabel: "Go to Transactions",
    iconBg: "rgba(5, 150, 105, 0.15)",
    iconColor: "#34d399",
    gradient: "linear-gradient(135deg, #059669, #0d9488)",
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    tag: "CORE FEATURE #2",
    title: "Category Budgets & Alerts",
    subtitle: "Stay disciplined before you overspend",
    description:
      "Set personalized monthly spending caps for individual categories like Groceries, Dining, Rent, and Leisure. Visual progress bars keep you on track and alert you when approaching limits.",
    bullets: [
      "Visual real-time spending progress meters",
      "Automatic overspend threshold warning badges",
      "Category-specific limits for disciplined savings",
    ],
    routeHref: "/home/budget",
    routeLabel: "Go to Budget",
    iconBg: "rgba(217, 119, 6, 0.15)",
    iconColor: "#fbbf24",
    gradient: "linear-gradient(135deg, #d97706, #b45309)",
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    tag: "CORE FEATURE #3",
    title: "Live Spend Analytics",
    subtitle: "Visual breakdown of your financial health",
    description:
      "Turn raw numbers into actionable financial clarity. Explore monthly cash-flow trend charts, category proportion pie breakdowns, and compare current month savings with previous benchmarks.",
    bullets: [
      "Monthly income vs expense ratio breakdown",
      "Category distribution percentage charts",
      "Identify unnecessary leaks in your monthly spend",
    ],
    routeHref: "/home/analytics",
    routeLabel: "Go to Analytics",
    iconBg: "rgba(37, 99, 235, 0.15)",
    iconColor: "#60a5fa",
    gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    tag: "CORE FEATURE #4",
    title: "Subscriptions & Recurring Bills",
    subtitle: "Never get surprised by an auto-renewal",
    description:
      "Manage all your recurring software licenses, streaming subscriptions (Netflix, Spotify), utility bills, and gym memberships with auto-calculated upcoming billing dates.",
    bullets: [
      "Track monthly, quarterly, and annual renewals",
      "Total monthly recurring commitment at a glance",
      "Avoid unexpected credit card auto-debits",
    ],
    routeHref: "/home/subscriptions",
    routeLabel: "Go to Subscriptions",
    iconBg: "rgba(219, 39, 119, 0.15)",
    iconColor: "#f472b6",
    gradient: "linear-gradient(135deg, #db2777, #be185d)",
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    tag: "CORE FEATURE #5",
    title: "Savings Goals & Quick Add (Ctrl + K)",
    subtitle: "Reach financial freedom milestone by milestone",
    description:
      "Set milestones for emergency funds, travel, or big investments. Plus, anywhere inside the app, press Ctrl + K (Cmd + K on Mac) to log any transaction in under 5 seconds.",
    bullets: [
      "Visual milestone progress percentage bars",
      "Quick Add hotkey: Ctrl + K (Cmd + K on Mac)",
      "You are fully prepared to build lasting financial discipline!",
    ],
    routeHref: "/home/goals",
    routeLabel: "Go to Savings Goals",
    iconBg: "rgba(234, 88, 12, 0.15)",
    iconColor: "#fb923c",
    gradient: "linear-gradient(135deg, #ea580c, #c2410c)",
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function OnboardingTour() {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<"currency" | "tour">("currency");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  // Sync selectedCurrency whenever global currency initializes
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  // Check if user is new (has not chosen currency or has not seen tour)
  useEffect(() => {
    try {
      const currencyChosen = localStorage.getItem("sg_finance_currency_chosen");
      const tourSeen = localStorage.getItem("sg_finance_tour_seen");

      if (!currencyChosen) {
        // Brand new user: First prompt to choose currency, then feature tour
        const timer = setTimeout(() => {
          setPhase("currency");
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      } else if (!tourSeen) {
        // User already picked currency but hasn't completed tour
        const timer = setTimeout(() => {
          setPhase("tour");
          setCurrentStep(0);
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Listen to custom event to reopen tour or currency selection from Navbar/Settings
  useEffect(() => {
    const handleOpenTour = (e?: Event) => {
      const customEvent = e as CustomEvent<{ startAtCurrency?: boolean }>;
      if (customEvent?.detail?.startAtCurrency) {
        setPhase("currency");
      } else {
        setPhase("tour");
        setCurrentStep(0);
      }
      setIsOpen(true);
    };

    window.addEventListener("openFeatureTour", handleOpenTour);
    return () => window.removeEventListener("openFeatureTour", handleOpenTour);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem("sg_finance_currency_chosen", "true");
      localStorage.setItem("sg_finance_tour_seen", "true");
    } catch {}
  }, []);

  // Handle confirming currency selection and transitioning to the tour
  const handleConfirmCurrency = async () => {
    setIsSavingCurrency(true);
    try {
      await setCurrency(selectedCurrency);
      localStorage.setItem("sg_finance_currency_chosen", "true");
      setPhase("tour");
      setCurrentStep(0);
    } catch (err) {
      console.error("Error setting currency:", err);
      // Still allow proceeding to tour
      setPhase("tour");
      setCurrentStep(0);
    } finally {
      setIsSavingCurrency(false);
    }
  };

  const handleNextTour = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      closeTour();
    }
  };

  const handlePrevTour = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      // Step 0 back goes back to currency selection
      setPhase("currency");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (phase === "tour") {
        if (e.key === "ArrowRight") {
          handleNextTour();
        } else if (e.key === "ArrowLeft") {
          handlePrevTour();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, phase, currentStep, closeTour]);

  if (!isOpen) return null;

  // Calculate top progress percentage
  const totalTourSteps = TOUR_STEPS.length;
  const progressPercent =
    phase === "currency"
      ? 14
      : 14 + Math.round(((currentStep + 1) / totalTourSteps) * 86);

  const step = TOUR_STEPS[currentStep];
  const isLastTourStep = currentStep === totalTourSteps - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    >
      {/* Backdrop */}
      <div
        onClick={closeTour}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl shadow-violet-950/25 overflow-hidden z-10 transition-all duration-300 animate-in zoom-in-95 flex flex-col max-h-[92vh]"
        style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}
      >
        {/* Top Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            {phase === "currency" ? (
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                STEP 1 OF 2 • CHOOSE CURRENCY
              </span>
            ) : (
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40">
                {step.tag}
              </span>
            )}

            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {phase === "currency" ? "Setup" : `Tour ${currentStep + 1} of ${totalTourSteps}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {phase === "tour" && (
              <button
                type="button"
                onClick={() => setPhase("currency")}
                className="text-[11px] font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition mr-1"
                title="Change Primary Currency"
              >
                Change Currency ({selectedCurrency.symbol})
              </button>
            )}

            <button
              type="button"
              onClick={closeTour}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Skip (Esc)"
              aria-label="Close Modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHASE 1: CURRENCY SELECTION                              */}
        {/* ======================================================== */}
        {phase === "currency" ? (
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-2">
            {/* Header with SG-Finance Logo */}
            <div className="flex items-center gap-3.5 mb-3.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#0C144C] border border-blue-900/50 shadow-md flex items-center justify-center p-2 shrink-0">
                <img src="/logo.svg" alt="SG-Finance" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 id="onboarding-modal-title" className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Choose Your Primary Currency
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Select your default currency. Transactions, budgets & reports will automatically format accordingly.
                </p>
              </div>
            </div>

            {/* Currency Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {currencies.map((c) => {
                const meta = CURRENCY_METADATA[c.code] || { flag: "🌐", region: c.name, sample: `${c.symbol} 1,000` };
                const isSelected = selectedCurrency.code === c.code;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCurrency(c)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/80 dark:ring-blue-500/60"
                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shadow-xs shrink-0 transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-blue-500/20"
                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {c.symbol}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {c.code}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {meta.flag} {meta.region}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[140px] sm:max-w-[160px]">
                          {c.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right pl-2 shrink-0">
                      <span className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                        Preview
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                        {meta.sample}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Notice */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
              <span className="text-base shrink-0">💡</span>
              <span>
                Don't worry — you can freely switch currencies or adjust exchange formats anytime in <strong>Settings → Currency</strong>.
              </span>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PHASE 2: FEATURE TOUR SLIDES                             */
          /* ======================================================== */
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-2">
            {/* Feature Hero Header */}
            <div className="flex items-start gap-4 mb-3.5 pt-1">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white"
                style={{ background: step.gradient }}
              >
                {step.icon}
              </div>

              <div className="flex-1">
                <h3 id="onboarding-modal-title" className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3.5">
              {step.description}
            </p>

            {/* Feature Takeaway Bullets */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2 mb-3">
              {step.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Optional Quick Link to jump to section */}
            {step.routeHref && (
              <div className="mb-1 text-right">
                <Link
                  href={step.routeHref}
                  onClick={closeTour}
                  className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>{step.routeLabel || "Explore this section"}</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="px-5 sm:px-6 py-3.5 bg-gray-50/90 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shrink-0">
          {phase === "currency" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Selected:
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {selectedCurrency.code} ({selectedCurrency.symbol})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeTour}
                  className="h-10 px-3.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                  Skip
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCurrency}
                  disabled={isSavingCurrency}
                  className="h-10 px-5 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-600/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 active:scale-95"
                >
                  <span>{isSavingCurrency ? "Saving..." : "Save & Start Feature Tour"}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step indicator dots */}
              <div className="flex items-center gap-1.5" aria-label="Step indicator">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentStep(i)}
                    className={`transition-all rounded-full ${
                      i === currentStep
                        ? "w-6 h-2 bg-violet-600 dark:bg-violet-500"
                        : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
                    }`}
                    title={`Go to step ${i + 1}`}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevTour}
                  className="h-10 px-3.5 sm:px-4 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  {currentStep === 0 ? "← Currency" : "Back"}
                </button>

                <button
                  type="button"
                  onClick={handleNextTour}
                  className="h-10 px-4 sm:px-5 text-xs font-bold text-white rounded-xl shadow-md shadow-violet-900/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{isLastTourStep ? "Launch Dashboard 🚀" : "Next Feature"}</span>
                  {!isLastTourStep && <span>&rarr;</span>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

