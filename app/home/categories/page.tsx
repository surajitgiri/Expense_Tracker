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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showModal])

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
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Categories</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Organize and personalize your transaction categories</p>
        </div>

        <button
          onClick={openAdd}
          className="self-start sm:self-auto flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-indigo-700 shadow-sm cursor-pointer"
        >
          <span className="font-bold text-base leading-none">+</span>
          <span>Add Category</span>
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-500">
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
              className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 sm:p-4 shadow-xs hover:border-gray-200 dark:hover:border-gray-600 transition"
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: cat.color + "22" }}
              >
                {cat.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{cat.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-xs text-gray-400 dark:text-gray-500 font-mono">{cat.color}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  Edit
                </button>

                {deleteId === cat.id ? (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs text-gray-400 hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="text-xs text-gray-400 transition hover:text-red-500 cursor-pointer"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="text-xl">🏷️</span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {editTarget ? "Edit Category" : "Add Category"}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                    Customize your expense categories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  ESC to close
                </kbd>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1.5 sm:p-1 rounded-lg transition cursor-pointer"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Food, Rent, Travel"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className="h-8 w-8 rounded-full border-2 transition mx-auto hover:scale-110"
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
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition mx-auto cursor-pointer ${
                        form.icon === icon
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 p-3 border border-gray-100 dark:border-gray-800">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm"
                  style={{ backgroundColor: form.color + "22" }}
                >
                  {form.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {form.name || "Category Preview"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: form.color }}
                    />
                    <span className="text-[10px] text-gray-400">{form.color}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-60 cursor-pointer text-center"
                >
                  {submitting ? "Saving..." : editTarget ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}