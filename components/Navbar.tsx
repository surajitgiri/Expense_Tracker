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
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; SameSite=Lax;"
    router.push("/auth/login")
  }

  const links = [
    {
      href: "/home/dashboard", label: "Dashboard",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      href: "/home/transactions", label: "Transactions",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
    },
    {
      href: "/home/subscriptions", label: "Subscriptions",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    },
    {
      href: "/home/goals", label: "Savings Goals",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    {
      href: "/home/budget", label: "Budget",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    },
    {
      href: "/home/analytics", label: "Analytics",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    {
      href: "/home/categories", label: "Categories",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* 1. Left: Brand Logo */}
        <Link
          href="/home/dashboard"
          className="flex items-center gap-2.5 shrink-0 select-none group"
        >
          <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-xs border border-gray-200/80 dark:border-gray-800 bg-[#0C144C] group-hover:scale-105 transition-transform flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/logo.svg"
              alt="SG-Finance Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 dark:text-white whitespace-nowrap leading-tight">
              SG<span className="text-amber-500">-FINANCE</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none">
              Since 2020
            </span>
          </div>
        </Link>

        {/* 2. Center: Desktop Nav Links with icons */}
        <nav className="hidden xl:flex items-center gap-0.5 bg-gray-100/70 dark:bg-gray-800/60 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Intermediate (lg to xl) fallback nav */}
        <nav className="hidden lg:flex xl:hidden items-center gap-0.5">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.icon}
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

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(false);
                          window.dispatchEvent(new CustomEvent("openFeatureTour"));
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 rounded-xl transition cursor-pointer text-left"
                      >
                        <span>✨</span>
                        <span>Feature Tour</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(false);
                          window.dispatchEvent(new CustomEvent("openFeatureTour", { detail: { startAtCurrency: true } }));
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition cursor-pointer text-left"
                      >
                        <span>🌐</span>
                        <span>Currency Setup</span>
                      </button>
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

          {/* Mobile Tour & Currency Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.dispatchEvent(new CustomEvent("openFeatureTour"));
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 transition"
            >
              <span>✨</span>
              <span>Tour</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.dispatchEvent(new CustomEvent("openFeatureTour", { detail: { startAtCurrency: true } }));
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 transition"
            >
              <span>🌐</span>
              <span>Currency</span>
            </button>
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