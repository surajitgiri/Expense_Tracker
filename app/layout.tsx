import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sg-finance.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SG-Finance — Smart Expense Tracker & Financial Command Center",
    template: "%s | SG-Finance",
  },
  description:
    "Free smart personal finance & expense tracker. Track daily transactions, manage category budgets, track recurring bills, and hit your financial savings goals.",
  applicationName: "SG-Finance",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.svg",
  },
  keywords: [
    "expense tracker",
    "budget planner",
    "personal finance",
    "money management",
    "monthly expense tracker",
    "category budget",
    "subscription manager",
    "savings goal tracker",
    "finance command center",
    "free money tracker",
    "financial analytics",
    "pdf financial statement export",
  ],
  authors: [{ name: "SG-Finance Team", url: baseUrl }],
  creator: "SG-Finance",
  publisher: "SG-Finance",
  category: "finance",
  classification: "Finance, Expense Tracker, Personal Finance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "SG-Finance",
    title: "SG-Finance — Smart Expense Tracker & Financial Command Center",
    description:
      "Take full control of your finances. Track income, monitor spending trends, manage category budgets, and reach savings goals with real-time financial analytics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SG-Finance — Smart Expense Tracker & Financial Command Center",
    description:
      "Take full control of your finances. Track income, monitor spending trends, manage category budgets, and reach savings goals with real-time financial analytics.",
    creator: "@sgfinance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "DK3bQ04qjowDecW7n1Oh8ck2Clh49KcsykNdj--x8lQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <StructuredData />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (stored === 'system' && prefersDark) || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Accessible skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <CurrencyProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
