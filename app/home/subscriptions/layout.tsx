import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Subscriptions",
  description:
    "Track recurring bills, streaming subscriptions, software licenses, and upcoming renewal deadlines with SG-Finance.",
  openGraph: {
    title: "Subscriptions | SG-Finance",
    description: "Track recurring bills, streaming subscriptions, software licenses, and renewal dates.",
  },
  twitter: {
    title: "Subscriptions | SG-Finance",
    description: "Track recurring bills, streaming subscriptions, software licenses, and renewal dates.",
  },
  alternates: {
    canonical: "/home/subscriptions",
  },
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Subscriptions"
        description="Track recurring bills, streaming subscriptions, software licenses, and upcoming renewal deadlines."
      />
      {children}
    </>
  );
}
