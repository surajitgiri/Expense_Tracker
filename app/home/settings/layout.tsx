import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Configure currency display, appearance themes, notifications, and application settings in SG-Finance.",
  openGraph: {
    title: "Settings | SG-Finance",
    description: "Configure currency display, appearance themes, notifications, and application settings.",
  },
  twitter: {
    title: "Settings | SG-Finance",
    description: "Configure currency display, appearance themes, notifications, and application settings.",
  },
  alternates: {
    canonical: "/home/settings",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Settings"
        description="Configure currency display, appearance themes, notifications, and application settings."
      />
      {children}
    </>
  );
}
