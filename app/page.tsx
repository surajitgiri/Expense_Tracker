"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-6">

      <div className="max-w-4xl w-full text-center">

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          💰 Expense Tracker
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
          Track your income, manage expenses, and stay in control of your finances — all in one place.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Get Started
          </Link>

          <Link
            href="/auth/login"
            className="border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Login
          </Link>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 text-left">

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Analytics</h3>
            <p className="text-sm text-gray-500">
              Visualize your spending with charts and insights.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">💸 Transactions</h3>
            <p className="text-sm text-gray-500">
              Add, edit, and manage your daily income & expenses.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">🎯 Budgeting</h3>
            <p className="text-sm text-gray-500">
              Set budgets and track your financial goals easily.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}