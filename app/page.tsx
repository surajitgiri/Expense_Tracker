"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">

      <div className="max-w-4xl w-full text-center">

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          💰 Expense Tracker
        </h1>

        <p className="text-gray-600 text-lg mb-8">
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
            className="border border-gray-400 text-black font-semibold bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg text-sm font-medium transition"
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