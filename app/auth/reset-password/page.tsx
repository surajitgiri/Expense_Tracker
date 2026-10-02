"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute password strength (0 to 3)
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new link.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* ── SUCCESS STATE ── */}
      {success ? (
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shadow-inner">
            <svg
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Password Reset Complete!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Your password has been updated securely. You can now sign in with your new credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
          >
            Sign In to Workspace →
          </button>
        </div>
      ) : (
        /* ── RESET FORM ── */
        <div className="space-y-5">
          <div className="text-center space-y-1.5">
            <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-2 text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Set New Password
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Please enter your new password below to regain full access to your account.
            </p>
          </div>

          {/* Missing Token Warning */}
          {!token && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <p className="font-semibold">⚠️ Reset Token Missing</p>
              <p className="leading-relaxed">
                This page requires a valid security token provided in your password reset email.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-block font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Request a new reset link →
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl animate-in fade-in duration-200">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {token && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50/70 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1.5 h-1">
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 1 ? (strength === 1 ? "bg-red-500" : strength === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-gray-200 dark:bg-gray-700"}`} />
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 2 ? (strength === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-gray-200 dark:bg-gray-700"}`} />
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 3 ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Strength:{" "}
                      <span className="font-semibold">
                        {strength === 1 ? "Weak" : strength === 2 ? "Medium" : "Strong"}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50/70 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition shadow-sm flex items-center justify-center gap-2 ${
                  loading || !token
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
                    <span>Saving New Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}

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
  );
}

export default function ResetPasswordPage() {
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
        style={{ background: "#4f46e5" }}
      />

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-10 text-center shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading reset form...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}