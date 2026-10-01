"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react"
import Link from "next/link";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); // ← ADD THIS

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            })

            if (res.ok) {
                setSuccess(true) // ← SHOW SUCCESS instead of router.push
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed")
            }
        } catch (error) {
            setError("Something went wrong, please try again")
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // ── SUCCESS SCREEN ──────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100 dark:border-gray-700">

                    {/* Email icon */}
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Check your email
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                        We sent a verification link to
                    </p>

                    {/* Show the email they registered with */}
                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-6">
                        {email}
                    </p>

                    <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
                        Click the link in the email to verify your account.
                        The link expires in <span className="font-medium text-gray-700 dark:text-gray-300">1 hour.</span>
                    </p>

                    <button
                        onClick={() => router.push("/auth/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition active:scale-95 text-sm shadow-xs cursor-pointer"
                    >
                        Go to Login
                    </button>

                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
                        Did not receive the email? Check your spam folder.
                    </p>
                </div>
            </div>
        )
    }

    // ── REGISTER FORM ───────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 py-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 space-y-6">
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Create an account
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get started with Expense Tracker today
                    </p>
                </div>

                {error && (
                    <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Google Sign-Up Button */}
                <GoogleAuthButton mode="signup" onError={setError} />

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
                    <span className="bg-white dark:bg-gray-800 px-3 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold absolute">
                        or continue with email
                    </span>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition active:scale-95 shadow-xs text-sm"
                    >
                        {loading ? "Creating account..." : "Register with Email"}
                    </button>
                </form>

                <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" href="/auth/login">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
}
