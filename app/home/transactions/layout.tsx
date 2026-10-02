import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Manage all income and expense transactions. Filter by date, search descriptions, categorize, and export to CSV or PDF.",
  openGraph: {
    title: "Transactions | SG-Finance",
    description: "Manage, filter, search, and export all your income and expense transactions.",
  },
  twitter: {
    title: "Transactions | SG-Finance",
    description: "Manage, filter, search, and export all your income and expense transactions.",
  },
  alternates: {
    canonical: "/home/transactions",
  },
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Transactions"
        description="Manage all income and expense transactions. Filter by date, search descriptions, categorize, and export to CSV or PDF."
      />
      {children}
    </>
  );
}
