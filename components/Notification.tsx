"use client"

import { useEffect, useState, useRef } from "react"

type Notification = {
  id: string
  message: string
  isRead: boolean
  createdAt?: string
}

export default function NotificationBell() {
  const [data, setData] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      const json = await res.json()
      if (res.ok) setData(json)
    } catch {
      console.log("Failed to fetch notifications")
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
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
      if (res.ok) {
        setData((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch {
      console.log("Failed to mark as read")
    } finally {
      setMarking(false)
    }
  }

  const markOneRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setData((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
      }
    } catch {
      console.log("Failed to mark as read")
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
        className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
          open
            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {/* Bell SVG */}
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden z-40 transition-opacity"
          onPointerDown={() => setOpen(false)}
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-x-3 top-[4.25rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-88 max-w-sm sm:max-w-none mx-auto sm:mx-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/80">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mark all read button */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={marking}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50 transition cursor-pointer"
                >
                  {marking ? "Marking..." : "Mark all read"}
                </button>
              )}

              {/* Close button on mobile */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sm:hidden p-1.5 -mr-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700 transition cursor-pointer"
                aria-label="Close notifications"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60 overscroll-contain">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                {/* Empty bell illustration */}
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center mb-3 text-gray-400 dark:text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications</p>
              </div>
            ) : (
              data.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOneRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    !n.isRead
                      ? "bg-blue-50/70 dark:bg-blue-950/35 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 cursor-pointer"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  }`}
                >
                  {/* Dot indicator */}
                  <div className="mt-1.5 shrink-0">
                    {!n.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm leading-snug break-words ${!n.isRead ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-300"}`}>
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    )}
                  </div>

                  {/* Unread label */}
                  {!n.isRead && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">
                      New
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {data.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-2.5 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}