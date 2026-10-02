"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Status = "loading" | "success" | "expired" | "invalid";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("No verification token found in the link.");
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok) {
          setStatus("success");
          setMessage("Your email address has been verified successfully!");
        } else {
          if (data.error?.toLowerCase().includes("expired")) {
            setStatus("expired");
            setMessage("This verification link has expired (links are valid for 1 hour).");
          } else {
            setStatus("invalid");
            setMessage(data.error || "This verification link is invalid or already used.");
          }
        }
      } catch {
        if (!isMounted) return;
        setStatus("invalid");
        setMessage("Unable to verify link. Please check your internet connection.");
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown timer for automatic redirect on success
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.push("/auth/login?verified=true");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, router]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/60 p-6 sm:p-10 relative z-10 text-center transition-all">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-7">
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

      {/* ── 1. LOADING STATE ── */}
      {status === "loading" && (
        <div className="space-y-6 py-4 animate-in fade-in duration-300">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950" />
            <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 border-r-amber-500 animate-spin" />
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Verifying your email...
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Please wait a moment while we validate your security credentials.
            </p>
          </div>
        </div>
      )}

      {/* ── 2. SUCCESS STATE ── */}
      {status === "success" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
              Email Verified!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message} Your SG-Finance workspace is unlocked and ready to use.
            </p>
          </div>

          {/* Progress redirect bar */}
          <div className="space-y-2 py-2">
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((4 - countdown) / 3) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Redirecting to sign in in {countdown} {countdown === 1 ? "second" : "seconds"}...
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/auth/login?verified=true")}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
          >
            Continue to Sign In →
          </button>
        </div>
      )}

      {/* ── 3. EXPIRED STATE ── */}
      {status === "expired" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shadow-inner">
            <svg
              className="w-8 h-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Link Expired
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message} Security tokens are time-sensitive to safeguard your personal financial data.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
            >
              Register Again
            </button>
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* ── 4. INVALID STATE ── */}
      {status === "invalid" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shadow-inner">
            <svg
              className="w-8 h-8 text-rose-600 dark:text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Invalid Link
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message} Please ensure you opened the entire link from your verification email.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold text-sm transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
            >
              Create an Account
            </button>
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
        style={{ background: "#10b981" }}
      />

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-10 text-center shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading verification details...</p>
          </div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}