"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react"
import {signIn} from "next-auth/react"
import Link from "next/link";

export default function LoginPage(){
    const router = useRouter();
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const [error , setError] = useState("");
    const [loading , setLoading] = useState(false);

    const handleLogin = async(e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(false);

        try {
            const res = await signIn("credentials",{
                email,
                password,
                redirect: false,
            })

            if(res?.error){
                setError(res.error)
            }
            else{
                router.push("/home/dashboard")
            }
        } catch (error) {
            setError("Something went wrong , please try again")
        }finally {
            setLoading(false);
        }
    }
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6">

    <h2 className="text-2xl font-semibold text-center text-gray-800">
      Login
    </h2>

    {error && (
      <p className="text-red-500 bg-red-100 px-3 py-2 rounded-md text-sm text-center">
        {error}
      </p>
    )}

    <form onSubmit={handleLogin} className="space-y-4">
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
      >
        Login
      </button>
    </form>
    <div className="text-center items-center mb-0">
     <Link href='/auth/forgot-password' className=" text-blue-400 hover:text-blue-500 hover:underline">Forgot Password?</Link>
     </div>
    <div className="text-center items-center text-black">Do not have a account ? <Link className="hover:underline hover:text-blue-500 text-blue-400" href="/auth/register">Create one</Link></div>

  </div>
</div>
        
    );
}