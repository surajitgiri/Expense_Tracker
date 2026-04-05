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
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
        setCooldown(30);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send email");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-6 space-y-5">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-100 px-4 py-2 rounded-lg">
            Reset link sent to your email 📩
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-4 text-black">

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={cooldown > 0 || loading}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
              cooldown > 0 || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
          >
            {loading
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Send Reset Link"}
          </button>
        </form>

        {/* Resend inline */}
        {success && (
          <div className="text-center text-sm text-gray-500 mb-0">
            Didn’t receive the email?{" "}
            <button
              onClick={handleResetPassword}
              disabled={cooldown > 0}
              className={`font-medium ${
                cooldown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:underline cursor-pointer"
              }`}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend"}
            </button>
          </div>
        )}

        <div className="text-center items-center">
            <Link href='/auth/login' className="hover:underline text-blue-500 hover:text-blue-600 cursor-pointer">back to Login</Link>
        </div>

      </div>
    </div>
  );
}