"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
        setCooldown(60);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send reset link. Please try again.");
      }
    } catch {
      setError("Unable to connect to the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] pointer-events-none rounded-full blur-3xl opacity-40 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, #4f46e5 0%, #0c144c 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-0 right-10 w-72 h-72 pointer-events-none rounded-full blur-2xl opacity-20 dark:opacity-10"
        style={{ background: "#f59e0b" }}
      />

      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/60 p-6 sm:p-9 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <Link href="/" className="group flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#0C144C] border border-gray-200/80 dark:border-gray-700 flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo.svg" alt="SG-Finance Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center mt-2.5">
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white block leading-tight">
                SG<span className="text-amber-500">-FINANCE</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-medium">
                Since 2020
              </span>
            </div>
          </Link>
        </div>

        {/* ── SUCCESS STATE: Email Sent ── */}
        {success ? (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Mail sent icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shadow-inner">
              <svg
                className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Check your email
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md break-all">
                  {email}
                </span>
                , we have sent instructions to reset your password.
              </p>
            </div>

            {/* Helper notice */}
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-3.5 text-left text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Helpful Tip:
              </p>
              <p className="leading-relaxed text-amber-700 dark:text-amber-400">
                The reset link expires in 30 minutes. If you do not see the email, please check your spam or promotions folder.
              </p>
            </div>

            {/* Resend Action */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={cooldown > 0 || loading}
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs flex items-center justify-center gap-2 ${
                  cooldown > 0 || loading
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                    : "bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white cursor-pointer"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Resending...</span>
                  </>
                ) : cooldown > 0 ? (
                  `Resend link in ${cooldown}s`
                ) : (
                  "Resend Reset Email"
                )}
              </button>

              <Link
                href="/auth/login"
                className="w-full py-2.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition text-center"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* ── INITIAL FORM STATE ── */
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-2 text-indigo-600 dark:text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Forgot password?
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                No worries! Enter your account email and we will send you instructions to reset your password.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl animate-in fade-in duration-200">
                <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition shadow-sm flex items-center justify-center gap-2 ${
                  loading || cooldown > 0
                    ? "bg-indigo-400 dark:bg-indigo-800 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] cursor-pointer"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            {/* Back to sign in */}
            <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}