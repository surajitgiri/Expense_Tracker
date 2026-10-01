import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SG-Finance — Your Financial Command Center",
    template: "%s | SG-Finance",
  },
  description:
    "Track every rupee, manage budgets, hit your savings goals. SG-Finance is the smart finance workspace for individuals and startups.",
  keywords: ["expense tracker", "budget", "finance", "savings", "money management", "fintech"],
  authors: [{ name: "SG-Finance" }],
  creator: "SG-Finance",
  metadataBase: new URL("https://sg-finance.app"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sg-finance.app",
    title: "SG-Finance — Your Financial Command Center",
    description:
      "Track every rupee, manage budgets, hit your savings goals. SG-Finance is the smart finance workspace for individuals and startups.",
    siteName: "SG-Finance",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SG-Finance – Smart Money Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SG-Finance — Your Financial Command Center",
    description: "Track every rupee, manage budgets, hit your savings goals.",
    images: ["/og-image.png"],
    creator: "@sgfinance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
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
