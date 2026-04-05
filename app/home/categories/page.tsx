"use client"

import { useEffect, useState } from "react"

type Category = {
  id: string
  name: string
  color: string
  icon: string
}

const PRESET_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
]

const PRESET_ICONS = ["🍔", "🏠", "🚗", "✈️", "💊", "🎮", "👗", "📦", "💼", "🎓", "💡", "🛒"]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<Category | null>(null)

  const [form, setForm] = useState({ name: "", color: PRESET_COLORS[0], icon: "📦" })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchCategories = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      if (res.ok) setCategories(data)
      else setError(data.error)
    } catch {
      setError("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: "", color: PRESET_COLORS[0], icon: "📦" })
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setForm({ name: cat.name, color: cat.color, icon: cat.icon })
    setFormError("")
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setSubmitting(true)

    try {
      const isEdit = !!editTarget
      const res = await fetch("/api/categories", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editTarget.id, ...form } : form),
      })

      const data = await res.json()

      if (res.ok) {
        if (isEdit) {
          setCategories((prev) => prev.map((c) => (c.id === data.id ? data : c)))
        } else {
          setCategories((prev) => [...prev, data])
        }
        setShowModal(false)
      } else {
        setFormError(data.error)
      }
    } catch {
      setFormError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
      } else {
        setError(data.error)
      }
    } catch {
      setError("Failed to delete category")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">Categories</h1>

        <button
          onClick={openAdd}
          className=" rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 "
        >
          + Add Category
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Categories Grid */}
      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          No categories yet. Add one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: cat.color + "22" }}
              >
                {cat.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-700">{cat.name}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-xs text-gray-400">{cat.color}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 self-start">
                <button
                  onClick={() => openEdit(cat)}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  Edit
                </button>

                {deleteId === cat.id ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="text-xs text-gray-400 transition hover:text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-800 sm:text-lg">
                {editTarget ? "Edit Category" : "Add Category"}
              </h2>

              {formError && (
                <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-500">
                  {formError}
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-black">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g. Food, Rent, Travel"
                    required
                  />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">Color</label>

                  <div className="grid grid-cols-4 gap-2 xs:grid-cols-5 sm:grid-cols-6">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className="h-9 w-9 rounded-full border-2 transition"
                        style={{
                          backgroundColor: c,
                          borderColor: form.color === c ? "#6366f1" : "transparent",
                          outline: form.color === c ? "2px solid #6366f1" : "none",
                          outlineOffset: "2px",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">Icon</label>

                  <div className="grid grid-cols-4 gap-2 xs:grid-cols-5 sm:grid-cols-6">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setForm({ ...form, icon })}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition ${
                          form.icon === icon
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: form.color + "22" }}
                  >
                    {form.icon}
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {form.name || "Category name"}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: form.color }}
                      />
                      <span className="text-xs text-gray-400">{form.color}</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-600 transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : editTarget ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}