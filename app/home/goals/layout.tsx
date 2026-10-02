import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Savings Goals",
  description:
    "Set financial savings goals, track target milestone percentages, and monitor your journey toward financial freedom.",
  openGraph: {
    title: "Savings Goals | SG-Finance",
    description: "Set financial savings goals, track target milestone percentages, and monitor your savings progress.",
  },
  twitter: {
    title: "Savings Goals | SG-Finance",
    description: "Set financial savings goals, track target milestone percentages, and monitor your savings progress.",
  },
  alternates: {
    canonical: "/home/goals",
  },
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Savings Goals"
        description="Set financial savings goals, track target milestone percentages, and monitor your savings progress."
      />
      {children}
    </>
  );
}
