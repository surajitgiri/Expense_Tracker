import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sg-finance.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/login", "/auth/register"],
        disallow: [
          "/home/",
          "/home/*",
          "/api/",
          "/api/*",
          "/auth/forgot-password",
          "/auth/reset-password",
          "/auth/verify-email",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/auth/login", "/auth/register"],
        disallow: [
          "/home/",
          "/home/*",
          "/api/",
          "/api/*",
          "/auth/forgot-password",
          "/auth/reset-password",
          "/auth/verify-email",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
