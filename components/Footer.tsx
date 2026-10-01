export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] tracking-tight text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            SG
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            SG<span className="text-violet-600 dark:text-violet-400">-Finance</span>
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          © {year} SG-Finance · Your smart financial workspace.
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="cursor-default hover:text-gray-600 dark:hover:text-gray-300 transition">Privacy</span>
          <span className="cursor-default hover:text-gray-600 dark:hover:text-gray-300 transition">Terms</span>
          <span className="cursor-default hover:text-gray-600 dark:hover:text-gray-300 transition">Support</span>
        </div>
      </div>
    </footer>
  )
}
