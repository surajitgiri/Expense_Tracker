"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import NotificationBell from "./Notification"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [showLogin, setShowLogin] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false)
      }
    }
    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        if (res.ok) {
          setName(data.name || "")
          setEmail(data.email || "")
          setShowLogin(false)
        }
      } catch {
        console.log("Failed to fetch user")
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    setOpenDropdown(false)
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    router.push("/auth/login")
  }

  const links = [
    { href: "/home/dashboard", label: "Dashboard" },
    { href: "/home/transactions", label: "Transactions" },
    { href: "/home/subscriptions", label: "Subscriptions" },
    { href: "/home/goals", label: "Savings Goals" },
    { href: "/home/budget", label: "Budget" },
    { href: "/home/analytics", label: "Analytics" },
    { href: "/home/categories", label: "Categories" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* 1. Left: Brand Logo (No wrap, sleek gradient mark) */}
        <Link
          href="/home/dashboard"
          className="flex items-center gap-2.5 shrink-0 select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            ET
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
            Expense<span className="text-blue-600 dark:text-blue-400">Tracker</span>
          </span>
        </Link>

        {/* 2. Center: Desktop Nav Links (Clean Segmented Pill design, no multi-line wrapping) */}
        <nav className="hidden xl:flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800/60 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Intermediate (lg to xl) fallback nav with compact text if screen is between 1024px and 1280px */}
        <nav className="hidden lg:flex xl:hidden items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* 3. Right: Quick-Add + Theme + Notifications + User Avatar */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Quick-Add Button (Sleek single-line pill button) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd"))}
            title="Quick Add Transaction (Ctrl + K)"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>New</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button (Standard w-9 h-9) */}
          <ThemeToggle />

          {/* Notification Bell (Standard w-9 h-9) */}
          {!showLogin && <NotificationBell />}

          {/* User Account / Avatar Dropdown */}
          <div className="flex items-center">
            {showLogin ? (
              <Link
                href="/auth/login"
                className="h-9 px-4 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Login
              </Link>
            ) : (
              <div ref={dropdownRef} className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenDropdown((prev) => !prev)
                  }}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all"
                  title="Account Menu"
                >
                  {name ? name.slice(0, 1).toUpperCase() : "U"}
                </button>

                {/* Dropdown Menu */}
                {openDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    
                    {/* User info header */}
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {name || "User"}
                      </p>
                      {email && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {email}
                        </p>
                      )}
                    </div>

                    {/* Menu links */}
                    <div className="p-1 space-y-0.5">
                      <Link
                        onClick={() => setOpenDropdown(false)}
                        href="/home/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                      >
                        <span>👤</span>
                        <span>My Profile</span>
                      </Link>

                      <Link
                        onClick={() => setOpenDropdown(false)}
                        href="/home/settings"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-700/60 my-1" />

                    {/* Integrated Logout Item */}
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle (Visible only on < lg) */}
          <button
            type="button"
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <div className="flex flex-col gap-1.5 w-4.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-4 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
          
          {/* Quick-Add Mobile trigger */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              window.dispatchEvent(new CustomEvent("openQuickAdd"))
            }}
            className="flex items-center justify-between px-3.5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold mb-2 cursor-pointer border border-blue-200/50 dark:border-blue-800/50"
          >
            <span>⚡ Quick Add Transaction</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono">
              Ctrl+K
            </span>
          </button>

          {/* Links list */}
          <div className="grid grid-cols-2 gap-1.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                  pathname === link.href
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Profile & Logout */}
          {!showLogin && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {name ? name.slice(0, 1).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{name}</p>
                    <p className="text-[10px] text-gray-400">{email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg transition"
                >
                  Log Out
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </header>
  )
}