"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface GoogleAuthButtonProps {
  mode: "signin" | "signup"
  onError?: (err: string) => void
}

declare global {
  interface Window {
    google?: any
  }
}

export default function GoogleAuthButton({ mode, onError }: GoogleAuthButtonProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)     // Google SDK loaded & initialized
  const [missingConfig, setMissingConfig] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  // Stable callback — won't cause re-initialization on re-renders
  const handleCredentialResponse = useCallback(async (response: any) => {
    if (!response?.credential) {
      onError?.("No credentials received from Google.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()
      if (!res.ok) {
        onError?.(data.error || "Google authentication failed")
      } else {
        localStorage.setItem("token", data.token)
        document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Lax`
        router.replace("/home/dashboard")
      }
    } catch {
      onError?.("Something went wrong with Google authentication. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [onError, router])

  // Initialize Google SDK once
  const initGoogle = useCallback(() => {
    if (initializedRef.current || !window.google?.accounts?.id) return
    initializedRef.current = true
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      setReady(true)
    } catch (e) {
      console.error("Google SDK init error:", e)
    }
  }, [clientId, handleCredentialResponse])

  useEffect(() => {
    if (!clientId.trim()) {
      setMissingConfig(true)
      return
    }

    // If SDK already loaded (navigated back to this page)
    if (window.google?.accounts?.id) {
      initGoogle()
      return
    }

    // Load script once — reuse if already in DOM
    const existing = document.getElementById("google-gsi-client")
    if (existing) {
      // Script tag exists but may not have fired onload yet; poll briefly
      const poll = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(poll)
          initGoogle()
        }
      }, 100)
      return () => clearInterval(poll)
    }

    const script = document.createElement("script")
    script.id = "google-gsi-client"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => initGoogle()
    script.onerror = () => console.error("Failed to load Google GSI script")
    document.body.appendChild(script)
  }, [clientId, initGoogle])

  // Click handler — triggers the Google One Tap / popup flow
  const handleClick = () => {
    if (loading) return
    if (missingConfig) {
      onError?.("Google Sign-In is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.")
      return
    }
    if (!ready || !window.google?.accounts?.id) {
      onError?.("Google Sign-In is still loading. Please try again in a moment.")
      return
    }
    window.google.accounts.id.prompt((notification: any) => {
      // If One Tap is suppressed (e.g. user dismissed it), fall back to renderButton flow
      if (notification?.isNotDisplayed() || notification?.isSkippedMoment()) {
        // Re-render the official button as popup fallback
        if (containerRef.current) {
          containerRef.current.innerHTML = ""
          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: mode === "signup" ? "signup_with" : "continue_with",
            shape: "rectangular",
            logo_alignment: "center",
            width: Math.min(containerRef.current.offsetWidth || 400, 400),
          })
        }
      }
    })
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">

      {/* Always-visible custom Google button — never disappears */}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={mode === "signup" ? "Sign up with Google" : "Continue with Google"}
        className="w-full h-11 flex items-center justify-center gap-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            {/* Official Google G */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</span>
            {/* Loading indicator when SDK not ready yet */}
            {!ready && !missingConfig && (
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin ml-auto shrink-0" />
            )}
          </>
        )}
      </button>

      {/* Hidden container for Google's renderButton (used as popup fallback) */}
      <div ref={containerRef} className="hidden" aria-hidden />
    </div>
  )
}
