"use client"

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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

        if (!token) {
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
            setCheckingAuth(false);
            return;
        }

        fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.ok) {
                    if (!getCookieToken()) {
                        document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
                    }
                    router.replace("/home/dashboard");
                } else {
                    localStorage.removeItem("token");
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
                    setCheckingAuth(false);
                }
            })
            .catch(() => {
                setCheckingAuth(false);
            });
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid credentials");
            } else {
                localStorage.setItem("token", data.token);
                // 30 days session
                document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
                router.push("/home/dashboard");
            }
        } catch {
            setError("Something went wrong, please try again");
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

            {/* ── Left panel: Branding (hidden on mobile) ── */}
            <div
                className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: "#09090f" }}
            >
                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

                {/* Violet glow orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 65%)", filter: "blur(2px)" }} />

                {/* Emerald accent — bottom left */}
                <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)" }} />

                {/* Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm tracking-tight text-white"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                        SG
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">SG-Finance</span>
                </div>

                {/* Hero copy */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="font-black leading-tight tracking-tight text-white" style={{ fontSize: "2.75rem", lineHeight: 1.05 }}>
                            Your financial
                            <br />
                            <span style={{ background: "linear-gradient(90deg, #c084fc, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                command center
                            </span>
                            <span className="text-white">.</span>
                        </h1>
                        <p className="mt-4 text-base leading-relaxed" style={{ color: "#9ca3af" }}>
                            Track every rupee, manage budgets, and hit your savings goals — all in one workspace.
                        </p>
                    </div>

                    {/* Feature checklist */}
                    <div className="space-y-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {[
                            "Multi-account balance tracking",
                            "Smart budget alerts & goals",
                            "PDF & CSV export",
                            "256-bit encrypted · Always free",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(5,150,105,0.15)" }}>
                                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm" style={{ color: "#d1d5db" }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs" style={{ color: "#6b7280" }}>
                    © {new Date().getFullYear()} SG-Finance · Privacy · Terms
                </p>
            </div>

            {/* ── Right panel: Form ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                        F
                    </div>
                    <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                        SG-Finance
                    </span>
                </div>

                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Welcome back
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sign in to your workspace
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <GoogleAuthButton mode="signin" onError={setError} />

                    <div className="relative flex items-center">
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                        <span className="mx-3 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">or</span>
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 dark:placeholder-gray-500 transition"
                                placeholder="you@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 dark:placeholder-gray-500 transition"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-[0.99]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : "Sign in to workspace"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        New to SG-Finance?{" "}
                        <Link className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" href="/auth/register">
                            Create a free account
                        </Link>
                    </p>
                </div>

                {/* Mobile footer */}
                <p className="mt-12 text-xs text-gray-400 dark:text-gray-600 lg:hidden">
                    © {new Date().getFullYear()} SG-Finance · Privacy · Terms
                </p>
            </div>
        </div>
    );
}
