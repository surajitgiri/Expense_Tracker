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
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = data.filter((n) => !n.isRead).length

  const markAllRead = async () => {
    setMarking(true)
    try {
     const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})   // ← send empty object, not nothing
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
    body: JSON.stringify({ id})  // ← send the id
})
      if(res.ok){
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
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          open
            ? "bg-indigo-50 text-indigo-600"
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        {/* Bell SVG */}
        <svg
          className="w-5 h-5"
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
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-600 font-medium px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Mark all read button */}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={marking}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium disabled:opacity-50 transition"
              >
                {marking ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                {/* Empty bell illustration */}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              data.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOneRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    !n.isRead
                      ? "bg-indigo-50/60 hover:bg-indigo-50 cursor-pointer"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Dot indicator */}
                  <div className="mt-1.5 flex-shrink-0">
                    {!n.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    )}
                  </div>

                  {/* Unread label */}
                  {!n.isRead && (
                    <span className="text-[10px] text-indigo-500 font-medium flex-shrink-0 mt-0.5">
                      New
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {data.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 text-center">
              <p className="text-xs text-gray-400">
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