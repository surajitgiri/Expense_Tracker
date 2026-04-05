"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import React, { useState, Suspense } from "react"

function ResetPasswordForm() {          //ResetPasswordPage

  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""  // ✅ read query param correctly

  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    
      <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-6 space-y-5 text-black">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your new password below</p>
        </div>

        {/* Invalid token */}
        {!token && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-lg text-center">
            Invalid or missing token
          </p>
        )}

        {/* Alerts */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-100 px-4 py-2 rounded-lg">
            Password changed successfully ✅
          </p>
        )}

        {/* Form */}
        {!success && token && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Redirect */}
        {success && (
          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-blue-600 hover:underline text-sm font-medium">
              Go to Login
            </Link>
          </div>
        )}

      </div>
    
  )
}


export default function ResetPasswordPage(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
       <Suspense fallback={
        <div className="text-sm text-gray-400">Loading...</div>
       }>
        <ResetPasswordForm/>
       </Suspense>
    </div>
  )
}