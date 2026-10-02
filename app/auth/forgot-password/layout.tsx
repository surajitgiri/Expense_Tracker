import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Forgot Password — Recover Your Account",
  description: "Reset your SG-Finance password securely via email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
