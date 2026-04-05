"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react"
import Link from "next/link";

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">

                    {/* Email icon */}
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Check your email
                    </h2>

                    <p className="text-gray-500 text-sm mb-1">
                        We sent a verification link to
                    </p>

                    {/* Show the email they registered with */}
                    <p className="text-indigo-600 font-medium text-sm mb-6">
                        {email}
                    </p>

                    <p className="text-gray-400 text-xs mb-6">
                        Click the link in the email to verify your account.
                        The link expires in <span className="font-medium">1 hour.</span>
                    </p>

                    <button
                        onClick={() => router.push("/auth/login")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition active:scale-95 text-sm"
                    >
                        Go to Login
                    </button>

                    <p className="text-gray-400 text-xs mt-4">
                        Did not receive the email? Check your spam folder.
                    </p>
                </div>
            </div>
        )
    }

    // ── REGISTER FORM ───────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create account</h2>

                {error && (
                    <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        {error}
                    </p>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <input
                            type="text"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition active:scale-95"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <div className="text-center mt-4 text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link className="hover:underline text-indigo-500" href="/auth/login">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
