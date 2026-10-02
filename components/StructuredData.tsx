import React from "react";

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sg-finance.app";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SG-Finance",
    alternateName: ["SG Finance", "SG-Finance Expense Tracker", "SG-Finance Financial Command Center"],
    url: baseUrl,
    description:
      "Track every rupee, manage category budgets, monitor recurring bills, and hit your financial savings goals.",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SG-Finance",
    url: baseUrl,
    logo: `${baseUrl}/icon`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@sg-finance.app",
    },
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SG-Finance",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser, iOS, Android, Windows, macOS, Linux",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description:
      "Smart personal finance and expense tracker workspace. Log income and expenses, monitor spending trends with interactive charts, manage category budgets, and export financial reports.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Real-time Expense and Income Logging",
      "Category Budget Planning with Threshold Alerts",
      "Interactive Spend Analytics and Monthly Trend Comparisons",
      "Subscription & Recurring Bill Tracker",
      "Savings Goal Milestone Progress",
      "Multi-Currency Workspace (INR ₹, USD $, EUR €, GBP £)",
      "Instant One-Click PDF and CSV Data Export",
      "Bank-Grade 256-Bit Data Encryption and Dark Mode Support",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is SG-Finance completely free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, SG-Finance is 100% free with no hidden charges, subscription lock-outs, or credit card requirements. You get full access to transaction tracking, category budgeting, live analytics, and export tools.",
        },
      },
      {
        "@type": "Question",
        name: "How does SG-Finance help me stay on budget?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SG-Finance enables you to establish custom monthly budgets for individual categories (such as Groceries, Utilities, Dining, and Entertainment). Visual progress meters show your real-time spend so you avoid overspending.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my financial reports to CSV or PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can export your entire transaction history, filtered date ranges, or categorical statements to CSV spreadsheets and professionally styled PDF reports anytime with one click.",
        },
      },
      {
        "@type": "Question",
        name: "Is my personal financial data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All data transmissions are encrypted using standard 256-bit TLS/SSL protocols. We strictly enforce password hashing and secure token-based authentication to safeguard your information.",
        },
      },
      {
        "@type": "Question",
        name: "Does SG-Finance support multiple currencies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, SG-Finance supports INR (₹), USD ($), EUR (€), GBP (£), and other major international currencies, allowing you to track finances in your preferred currency denomination.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
