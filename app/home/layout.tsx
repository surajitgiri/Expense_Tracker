

import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
    children,
}:{
    children: React.ReactNode
}) {

    const session = await getServerSession();
    if(!session){
        redirect("/auth/login");
    }


    return (
         <div className="min-h-screen bg-gray-100">

  {/* Navbar */}
      <Navbar/>

  {/* Page Content */}
  <div className="p-6">
    {children}
  </div>

</div>
    )
}