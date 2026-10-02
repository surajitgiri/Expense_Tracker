import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Financial command center overview: net balance, income vs expenses, recent transactions, and quick insights.",
  openGraph: {
    title: "Dashboard | SG-Finance",
    description: "Financial command center overview: net balance, income vs expenses, and real-time cash flow.",
  },
  twitter: {
    title: "Dashboard | SG-Finance",
    description: "Financial command center overview: net balance, income vs expenses, and real-time cash flow.",
  },
  alternates: {
    canonical: "/home/dashboard",
  },
};

export default function DashboardSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Dashboard"
        description="Financial command center overview: net balance, income vs expenses, and real-time cash flow."
      />
      {children}
    </>
  );
}
