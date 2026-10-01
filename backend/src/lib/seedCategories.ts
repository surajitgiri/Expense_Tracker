import { prisma } from "./prisma"

// 12 well-rounded default categories covering everyday life
const DEFAULT_CATEGORIES = [
  // ── Expenses ──
  { name: "Food & Dining",     icon: "🍽️",  color: "#ef4444" },
  { name: "Transport",         icon: "🚗",  color: "#f97316" },
  { name: "Shopping",          icon: "🛍️",  color: "#a855f7" },
  { name: "Entertainment",     icon: "🎬",  color: "#ec4899" },
  { name: "Health & Medical",  icon: "🏥",  color: "#14b8a6" },
  { name: "Bills & Utilities", icon: "⚡",  color: "#eab308" },
  { name: "Education",         icon: "📚",  color: "#6366f1" },
  { name: "Travel",            icon: "✈️",  color: "#0ea5e9" },
  { name: "Groceries",         icon: "🛒",  color: "#22c55e" },
  { name: "Personal Care",     icon: "💆",  color: "#f43f5e" },
  // ── Income ──
  { name: "Salary",            icon: "💼",  color: "#10b981" },
  { name: "Freelance",         icon: "💻",  color: "#3b82f6" },
]

/**
 * Seeds default categories for a newly created user.
 * Safe to call — does nothing if user already has categories.
 */
export async function seedDefaultCategories(userId: string): Promise<void> {
  // Guard: don't overwrite if they already have categories (e.g. duplicate call)
  const existing = await prisma.category.count({ where: { userId } })
  if (existing > 0) return

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId,
    })),
    skipDuplicates: true,
  })
}
