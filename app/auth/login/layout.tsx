import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Sign In — Access Your Finance Dashboard",
  description:
    "Sign in to your SG-Finance account to track expenses, manage budgets, monitor investments and subscriptions, and analyze your financial health.",
  alternates: {
    canonical: "/auth/login",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
