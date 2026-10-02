"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectCheck() {
  const router = useRouter();

  useEffect(() => {
    try {
      const getCookieToken = () => {
        const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        const val = match ? decodeURIComponent(match[1]).trim() : null;
        return val && val !== "null" && val !== "undefined" && val !== "" ? val : null;
      };

      const localToken = localStorage.getItem("token");
      const validLocal =
        localToken &&
        localToken !== "null" &&
        localToken !== "undefined" &&
        localToken.trim() !== ""
          ? localToken.trim()
          : null;

      const token = getCookieToken() || validLocal;

      if (!token) return;

      fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            if (!getCookieToken()) {
              document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
            }
            router.replace("/home/dashboard");
          } else {
            localStorage.removeItem("token");
            document.cookie =
              "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
          }
        })
        .catch(() => {});
    } catch {
      // Ignore client execution errors
    }
  }, [router]);

  return null;
}
