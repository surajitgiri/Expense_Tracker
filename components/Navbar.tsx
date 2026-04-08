"use client"

import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import NotificationBell from "./Notification";

export default function NavbarPage() {

  const [name, setName] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open , setOpen] = useState(false);

  const pathname = usePathname();

  const linkClass = (path: string) =>
    `transition font-semibold ${pathname === path
      ? "text-blue-600 underline underline-offset-4"
      : "text-gray-600 hover:text-blue-600"
    }`;

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target as Node)){
          setOpen(false);
        }
      }

      document.addEventListener("pointerdown" , handleClickOutside);

      return () => {
        document.removeEventListener("pointerdown" , handleClickOutside)
      }
    },[])

  const links = [
    { href: "/home/dashboard",    label: "Dashboard" },
    { href: "/home/transactions", label: "Transactions" },
    { href: "/home/budget",       label: "Budget" },
    { href: "/home/analytics",    label: "Analytics" },
    { href: "/home/categories",   label: "Categories" },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        if (res.ok) {
          setName(data.name)
          setShowLogin(false)
        }
      } catch {
        console.log("Failed to fetch user")
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white px-2 py-1 rounded-lg font-bold">
            ET
          </div>
          <h1 className="text-lg font-semibold text-gray-800">
            Expense Tracker
          </h1>
        </div>

        {/* Center: Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {links.map(link => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: User + Logout + Hamburger */}
        <div className="flex items-center gap-3">

            {!showLogin && <NotificationBell/>}
          {/* Desktop only — login or avatar */}
          <div className="hidden md:flex items-center gap-3">
            {showLogin ? (
              <Link href="/auth/login" className="px-4 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                Login
              </Link>
            ) : (
              <>
                {/* Avatar with dropdown */}
                <div ref={dropdownRef} className="relative group inline-block">
                  <button
                  onClick={(e)=>{e.stopPropagation() 
                    setOpen(!open)}}
                    className="w-9 cursor-pointer h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold"
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </button>

                  {/**Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-300 rounded-xl shadow-lg py-2  z-50 ">
                    <Link onClick={()=>setOpen(false)} href="/home/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      👤 Profile
                    </Link>
                    <Link onClick={()=>setOpen(false)} href="/home/settings" className="block px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
                      ⚙️ Settings
                    </Link>
                  </div>
                  )}
                </div>

                <LogoutButton />
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

        </div>
      </div>

      {/* Mobile menu — dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-1">

          {/* Nav links */}
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Login or user section */}
          {showLogin ? (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium text-center hover:bg-blue-600"
              >
                Login
              </Link>
            ) : (
              <div className="flex flex-col gap-2">

                {/* 👤 Profile */}
                <Link
                  href="/home/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </Link>

                {/* ⚙️ Settings (Highlighted Button ⭐) */}
                <Link
                  href="/home/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <span>⚙️ Settings</span>
                  <span className="text-gray-400">›</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1" />

                {/* Logout */}
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>

              </div>
            )}
          
        </div>
      )}
    </div>
  )
}