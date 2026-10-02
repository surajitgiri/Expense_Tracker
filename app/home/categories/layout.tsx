import type { Metadata } from "next";
import React from "react";
import PageMetadata from "@/components/PageMetadata";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Organize and customize income and expense categories with personalized color badges and icon indicators in SG-Finance.",
  openGraph: {
    title: "Categories | SG-Finance",
    description: "Organize and customize income and expense categories with personalized color badges and icon indicators.",
  },
  twitter: {
    title: "Categories | SG-Finance",
    description: "Organize and customize income and expense categories with personalized color badges and icon indicators.",
  },
  alternates: {
    canonical: "/home/categories",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageMetadata
        title="Categories"
        description="Organize and customize income and expense categories with personalized color badges and icon indicators."
      />
      {children}
    </>
  );
}
