import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Budget Planning",
  description:
    "Set monthly spending limits for categories, track real-time utilization progress, and receive overspend alerts with SG-Finance.",
  openGraph: {
    title: "Budget Planning | SG-Finance",
    description: "Set monthly spending limits for categories, track real-time utilization progress, and receive overspend alerts.",
  },
  twitter: {
    title: "Budget Planning | SG-Finance",
    description: "Set monthly spending limits for categories, track real-time utilization progress, and receive overspend alerts.",
  },
  alternates: {
    canonical: "/home/budget",
  },
};

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Budget Planning"
        description="Set monthly spending limits for categories, track real-time utilization progress, and receive overspend alerts."
      />
      {children}
    </>
  );
}
