"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="cursor-pointer text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
    >
      Logout
    </button>
  );
}