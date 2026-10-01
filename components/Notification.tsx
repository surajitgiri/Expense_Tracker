"use client"

import { useEffect, useState, useRef, useCallback } from "react"

type NotificationType = "success" | "warning" | "info" | "error"

type Notification = {
  id: string
  message: string
  type: NotificationType | string
  isRead: boolean
  createdAt?: string
}

// ─── Type config: icon + colors ────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; dot: string; bg: string; border: string }> = {
  success: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-600 dark:text-emerald-400">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    ),
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-l-emerald-500",
  },
  warning: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500 dark:text-amber-400">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-l-amber-500",
  },
  error: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500 dark:text-red-400">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    ),
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-l-red-500",
  },
  info: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500 dark:text-blue-400">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-l-blue-500",
  },
}

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.info
}

// ─── Relative time ──────────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── BellIcon ───────────────────────────────────────────────────────────────
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [data, setData] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const json = await res.json()
      if (res.ok) setData(json)
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 60s to keep fresh
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handle = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handle)
    return () => document.removeEventListener("pointerdown", handle)
  }, [])

  // Close on ESC
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [])

  const unreadCount = data.filter((n) => !n.isRead).length

  const markAllRead = async () => {
    setMarking(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (res.ok) setData((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {} finally {
      setMarking(false)
    }
  }

  const markOneRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setData((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {}
  }

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Bell Button ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          open
            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }`}
      >
        <BellIcon className="w-[18px] h-[18px]" />

        {/* Animated unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Mobile Backdrop ──────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm sm:hidden z-40"
          onPointerDown={() => setOpen(false)}
        />
      )}

      {/* ── Panel ───────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="fixed inset-x-3 top-[4.5rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+8px)] w-auto sm:w-[380px] z-50
            bg-white dark:bg-gray-900
            border border-gray-200/80 dark:border-gray-700/70
            rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150"
        >

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
                <BellIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Notifications</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={marking}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {marking ? "Marking…" : "Mark all read"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sm:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[60vh] sm:max-h-[340px] overflow-y-auto overscroll-contain">
            {data.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {data.map((n) => {
                  const cfg = getConfig(n.type)
                  return (
                    <li
                      key={n.id}
                      onClick={() => !n.isRead && markOneRead(n.id)}
                      className={`group flex items-start gap-3.5 px-4 py-3.5 transition-colors border-l-[3px] ${
                        !n.isRead
                          ? `${cfg.bg} ${cfg.border} cursor-pointer hover:brightness-95 dark:hover:brightness-110`
                          : "border-l-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      {/* Type icon */}
                      <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                        !n.isRead ? "bg-white/70 dark:bg-gray-900/50 shadow-xs" : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        {getConfig(n.type).icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug break-words ${
                          !n.isRead
                            ? "text-gray-900 dark:text-gray-100 font-medium"
                            : "text-gray-500 dark:text-gray-400 font-normal"
                        }`}>
                          {n.message}
                        </p>
                        {n.createdAt && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
                            {relativeTime(n.createdAt)}
                          </p>
                        )}
                      </div>

                      {/* Unread pulse dot */}
                      {!n.isRead && (
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {data.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex items-center justify-between">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {data.length} total · {unreadCount} unread
              </p>
              <button
                type="button"
                onClick={fetchNotifications}
                className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Refresh
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}