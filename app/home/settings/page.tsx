"use client"

import { useEffect, useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"
import { useTheme, Theme } from "@/context/ThemeContext"

type User = {
  id: string
  name: string
  email: string
  theme?: string
  createdAt: string
  _count: {
    transactions: number
    budgets: number
    categories: number
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "password" | "currency" | "danger">("profile")

  // Profile form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordUpdating, setPasswordUpdating] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const { currency, setCurrency, currencies } = useCurrency()
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        if (res.ok) {
          setUser(data)
          setName(data.name || "")
          setEmail(data.email || "")
          if (data.theme && (data.theme === "light" || data.theme === "dark" || data.theme === "system")) {
            setTheme(data.theme as Theme)
          }
        }
      } catch {
        console.error("Failed to fetch user")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess("")
    setProfileUpdating(true)

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, name: data.name, email: data.email } : prev))
        setProfileSuccess("Profile updated successfully")
      } else {
        setProfileError(data.error)
      }
    } catch {
      setProfileError("Something went wrong")
    } finally {
      setProfileUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }

    setPasswordUpdating(true)

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordSuccess("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordError(data.error)
      }
    } catch {
      setPasswordError("Something went wrong")
    } finally {
      setPasswordUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleteError("")
    setDeleting(true)

    try {
      const res = await fetch("/api/user", { method: "DELETE" })
      if (res.ok) {
        window.location.href = "/auth/login"
      } else {
        const data = await res.json()
        setDeleteError(data.error)
      }
    } catch {
      setDeleteError("Failed to delete account")
    } finally {
      setDeleting(false)
    }
  }

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "appearance", label: "Appearance" },
    { key: "password", label: "Password" },
    { key: "currency", label: "Currency" },
    { key: "danger", label: "Danger Zone" },
  ] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 dark:text-gray-500 text-sm animate-pulse">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account and app preferences</p>
      </div>

      {/* Avatar Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs p-4 sm:p-5 mb-5 flex items-center gap-3.5 sm:gap-4 transition-colors">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 shadow-md">
          {user?.name ? user.name.slice(0, 1).toUpperCase() : "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white truncate">{user?.name || "User"}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            Member since{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1 mb-5 border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 sm:flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Edit Profile</h2>

          {profileError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2.5 mb-4">
              {profileError}
            </p>
          )}
          {profileSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-2.5 mb-4">
              {profileSuccess}
            </p>
          )}

          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={profileUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {profileUpdating ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Appearance (Dark / Light Theme Toggle) */}
      {activeTab === "appearance" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">Theme & Appearance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose how Expense Tracker looks to you. Your preference is saved across devices and stored in your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Light Option */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-3 ${
                theme === "light"
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">☀️</span>
                {theme === "light" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">Light Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bright, clean and vibrant</p>
              </div>
            </button>

            {/* Dark Option */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-3 ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🌙</span>
                {theme === "dark" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Easy on eyes in low light</p>
              </div>
            </button>

            {/* System Option */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-3 ${
                theme === "system"
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">💻</span>
                {theme === "system" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">System Sync</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Currently: <span className="capitalize font-medium text-blue-500">{resolvedTheme}</span>
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Password */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Change Password</h2>

          {passwordError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2.5 mb-4">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-2.5 mb-4">
              {passwordSuccess}
            </p>
          )}

          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {passwordUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Currency */}
      {activeTab === "currency" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Currency</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c)}
                className={`border rounded-xl p-3 text-left transition cursor-pointer ${
                  currency.code === c.code
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <p className="text-lg font-bold text-gray-800 dark:text-white">{c.symbol}</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.code}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{c.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Danger Zone */}
      {activeTab === "danger" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm p-6">
          <h2 className="text-base font-semibold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Deleting your account will permanently remove all your transactions, budgets, subscriptions, and goals.
            This action cannot be undone.
          </p>

          {deleteError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2 mb-4">
              {deleteError}
            </p>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-300 dark:border-red-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-sm font-medium px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 font-medium">
                Are you sure you want to delete your account? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-60 cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 text-sm font-medium px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}