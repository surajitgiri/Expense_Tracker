"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
    >
      Logout
    </button>
  );
}