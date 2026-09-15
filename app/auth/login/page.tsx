"use client"

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const hasCookie = document.cookie.includes("token=");
        if (token || hasCookie) {
            if (token && !hasCookie) {
                document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
            }
            router.replace("/home/dashboard");
        } else {
            setCheckingAuth(false);
        }
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
        } catch (err) {
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

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6 border border-gray-100 dark:border-gray-700">

    <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
      Login
    </h2>

    {error && (
      <p className="text-red-500 bg-red-100 px-3 py-2 rounded-md text-sm text-center">
        {error}
      </p>
    )}

    <form onSubmit={handleLogin} className="space-y-4">
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
      >
        Login
      </button>
    </form>
    <div className="text-center items-center mb-0">
     <Link href='/auth/forgot-password' className=" text-blue-400 hover:text-blue-500 hover:underline">Forgot Password?</Link>
     </div>
    <div className="text-center items-center text-black">Do not have a account ? <Link className="hover:underline hover:text-blue-500 text-blue-400" href="/auth/register">Create one</Link></div>

  </div>
</div>
        
    );
}