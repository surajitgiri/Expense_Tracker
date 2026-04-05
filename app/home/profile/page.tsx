"use client"

import { useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  createdAt: string
  _count: {
    transactions: number
    budgets: number
    categories: number
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Edit profile form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [updating, setUpdating] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        if (res.ok) {
          setUser(data)
          setName(data.name)
          setEmail(data.email)
        } else {
          setError(data.error)
        }
      } catch {
        setError("Failed to fetch user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setUpdating(true)

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser((prev) => prev ? { ...prev, name: data.name, email: data.email } : prev)
        setSuccess("Profile updated successfully")
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setError(data.error)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/user", { method: "DELETE" })
      if (res.ok) {
        window.location.href = "/auth/login"
      } else {
        const data = await res.json()
        setError(data.error)
      }
    } catch {
      setError("Failed to delete account")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/**Header */}
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account details</p>
        </div>

        {/**Alerts */}
        {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
            </p>
        )}
        {success && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                {success}
            </p>
        )}

        {/**Profile Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-5">

                {/**Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                    {user?.name?.slice(0,1).toUpperCase()}
                </div>

                <div>
                    <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Member since{" "}
                        {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-us",{
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })
                        : "-"}
                    
                    </p>
                </div>
            </div>
             
             {/**Stats */}
             <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                    { label: "Transactions", value: user?._count.transactions},
                    { label: "Budgets" , value: user?._count.budgets},
                    { label: "Categories" , value: user?._count.categories},
                ].map((item) => (
                    <div
                    key={item.label}
                    className="bg-gray-50 hover:bg-gray-100 transition rounded-xl p-4"
                    >
                        <p className="text-xl font-bold text-indigo-600">
                            {item.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                    </div>
                ))}
             </div>
        </div>

                {/** Edit Profile */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                        Edit Profile
                    </h2>

                    <form onSubmit={handleUpdate} className="space-y-4 text-gray-600">
                        <div>
                            <label className="text-sm text-black">Name</label>
                            <input 
                            type="text" 
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                            className="w-full mt-1 border border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                            Change Password <span className="text-gray-400">(optional)</span>
                            </p>

                            <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current password"
                            className="w-full mb-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        
                         <button
                            type="submit"
                            disabled={updating}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
                        >
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">
                    Danger Zone
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                    Deleting your account will permanently remove all data.
                    </p>

                    {!showDeleteConfirm?(
                        <button
                         onClick={() => setShowDeleteConfirm(true)}
                         className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                         >
                            Delete Account
                        </button>
                    ): (
                        <div className="flex items-center gap-3">
                            <button
                             onClick={handleDelete}
                             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Confirm Delete
                            </button>
                            <button
                            onClick={()=> setShowDeleteConfirm(false)}
                            className="text-sm text-gray-600 font-semibold hover:text-black hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
    </div>
  )
}