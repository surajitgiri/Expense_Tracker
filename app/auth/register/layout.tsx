import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Free Account — Start Managing Your Finances",
  description:
    "Join SG-Finance for free. Set up your personal finance workspace, track your daily expenses, create category budgets, and hit your savings goals.",
  alternates: {
    canonical: "/auth/register",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
