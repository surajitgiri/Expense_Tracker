import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SG-Finance — Smart Expense Tracker & Financial Command Center";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "#09090f",
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Header / Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 900,
                color: "#ffffff",
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)",
              }}
            >
              SG
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
                SG<span style={{ color: "#a78bfa" }}>-Finance</span>
              </span>
              <span style={{ fontSize: 13, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase" }}>
                Financial Command Center
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 9999,
              background: "rgba(124, 58, 237, 0.12)",
              border: "1px solid rgba(167, 139, 250, 0.3)",
              fontSize: 14,
              fontWeight: 600,
              color: "#c084fc",
            }}
          >
            <span>Free Forever</span>
            <span>•</span>
            <span>No Credit Card</span>
          </div>
        </div>

        {/* Center Headline & Tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            Take Full Control of Your Money.
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#9ca3af",
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            Track daily expenses, manage category budgets, monitor recurring bills, and hit your financial savings goals in real-time.
          </div>
        </div>

        {/* Bottom Feature Badges & URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {["Smart Expense Logging", "Budget Alerts", "Live Analytics", "Subscriptions", "PDF & CSV Export"].map(
              (badge) => (
                <div
                  key={badge}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: 13,
                    color: "#d1d5db",
                    fontWeight: 500,
                  }}
                >
                  {badge}
                </div>
              )
            )}
          </div>

          <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
            sg-finance.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
