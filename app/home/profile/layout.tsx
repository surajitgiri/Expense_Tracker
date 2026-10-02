import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Manage your personal SG-Finance user profile, account security, and display preferences.",
  openGraph: {
    title: "Profile | SG-Finance",
    description: "Manage your personal SG-Finance user profile, account security, and display preferences.",
  },
  twitter: {
    title: "Profile | SG-Finance",
    description: "Manage your personal SG-Finance user profile, account security, and display preferences.",
  },
  alternates: {
    canonical: "/home/profile",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Profile"
        description="Manage your personal SG-Finance user profile, account security, and display preferences."
      />
      {children}
    </>
  );
}
