import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your SG-Finance account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
