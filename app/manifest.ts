import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SG-Finance — Smart Money & Expense Tracker",
    short_name: "SG-Finance",
    description:
      "Track every rupee, manage category budgets, track recurring bills, and achieve your financial savings goals.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090f",
    theme_color: "#0C144C",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
