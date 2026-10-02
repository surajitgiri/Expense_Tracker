export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#0C144C] flex items-center justify-center p-0.5 border border-gray-200/50 dark:border-gray-800">
            <img src="/logo.svg" alt="SG-Finance" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            SG<span className="text-amber-500">-FINANCE</span>
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
