import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Analytics & Reports",
  description:
    "Visual financial analytics: monthly spending trends, income vs expense breakdowns, category distributions, and downloadable statements.",
  openGraph: {
    title: "Analytics & Reports | SG-Finance",
    description: "Visual financial analytics: monthly spending trends, category distributions, and downloadable statements.",
  },
  twitter: {
    title: "Analytics & Reports | SG-Finance",
    description: "Visual financial analytics: monthly spending trends, category distributions, and downloadable statements.",
  },
  alternates: {
    canonical: "/home/analytics",
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Analytics & Reports"
        description="Visual financial analytics: monthly spending trends, income vs expense breakdowns, category distributions, and downloadable statements."
      />
      {children}
    </>
  );
}
