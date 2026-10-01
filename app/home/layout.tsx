import Navbar from "@/components/Navbar";
import QuickAddModal from "@/components/QuickAddModal";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
    children,
}:{
    children: React.ReactNode
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value?.trim();

    if (!token || token === "null" || token === "undefined") {
        redirect("/auth/login");
    }

    return (
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">

        {/* Quick Add Modal (Ctrl+K / Cmd+K Global Listener) */}
        <QuickAddModal />

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="flex-1 p-3.5 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>

        {/* Footer — appears on every app page */}
        <Footer />

      </div>
    )
}