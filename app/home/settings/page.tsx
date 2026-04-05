"use client"

import { useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
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
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "danger">("profile")

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        if (res.ok) {
          setUser(data)
          setName(data.name)
          setEmail(data.email)
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
        setUser((prev) => prev ? { ...prev, name: data.name, email: data.email } : prev)
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
    { key: "profile",  label: "Profile" },
    { key: "password", label: "Password" },
    { key: "danger",   label: "Danger Zone" },
  ] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Avatar Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
          {user?.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Member since {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === tab.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Edit Profile</h2>

          {profileError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-2 mb-4">{profileSuccess}</p>
          )}

          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your name"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={profileUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
            >
              {profileUpdating ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Password */}
      {activeTab === "password" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Change Password</h2>

          {passwordError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-2 mb-4">{passwordSuccess}</p>
          )}

          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
            >
              {passwordUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Danger Zone */}
      {activeTab === "danger" && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-400 mb-6">
            Deleting your account will permanently remove all your transactions, budgets, and categories. This action cannot be undone.
          </p>

          {deleteError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">{deleteError}</p>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-300 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-4 font-medium">
                Are you sure you want to delete your account? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-gray-200 text-gray-500 hover:bg-white text-sm font-medium px-4 py-2 rounded-lg transition"
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