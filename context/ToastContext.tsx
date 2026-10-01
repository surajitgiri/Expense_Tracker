"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"

export type ToastType = "success" | "error" | "info" | "warning"

export type Toast = {
  id: string
  message: string
  type: ToastType
  description?: string
  undoAction?: () => void
  duration?: number
}

type ToastContextType = {
  toast: (opts: Omit<Toast, "id">) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => "",
  dismiss: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-emerald-500">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-red-500">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-amber-500">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-blue-500">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
}

const BAR_COLORS: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
}

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  const duration = t.duration ?? 4000
  const [visible, setVisible] = React.useState(false)
  const [leaving, setLeaving] = React.useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const dismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => onDismiss(t.id), 300)
  }, [t.id, onDismiss])

  React.useEffect(() => {
    // Mount animation
    requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(dismiss, duration)
    return () => clearTimeout(timerRef.current)
  }, [dismiss, duration])

  const pauseTimer = () => clearTimeout(timerRef.current)
  const resumeTimer = () => { timerRef.current = setTimeout(dismiss, 1500) }

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      className={`relative flex items-start gap-3 w-full max-w-sm bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden
        transition-all duration-300 ease-out
        ${visible && !leaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${BAR_COLORS[t.type]}`} />

      {/* Content */}
      <div className="flex items-start gap-3 pl-4 pr-3 py-3.5 flex-1 min-w-0">
        <div className="mt-0.5 shrink-0">{ICONS[t.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{t.message}</p>
          {t.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{t.description}</p>
          )}
          {t.undoAction && (
            <button
              onClick={() => { t.undoAction!(); dismiss() }}
              className="mt-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Undo
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer mt-0.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-[2px] ${BAR_COLORS[t.type]} opacity-30`}
        style={{ animation: `shrink ${duration}ms linear forwards` }}
      />
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]) // max 5
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast viewport — bottom-right on desktop, bottom-center on mobile */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-2.5 items-end w-full max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem t={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
