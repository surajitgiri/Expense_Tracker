import nodemailer from "nodemailer"
import path from "path"
import fs from "fs"

const cleanEmailPass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "")
  .replace(/^["']|["']$/g, "")
  .replace(/\s+/g, "")

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: cleanEmailPass,
  },
  // Force IPv4 to prevent IPv6 network unreachable / timeout issues on AWS EC2
  family: 4,
} as nodemailer.TransportOptions)

// Verify SMTP connection on startup so errors are visible immediately in server logs
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection verification failed:", error.message)
  } else {
    console.log("✅ SMTP Server is ready to send emails")
  }
})

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"

/**
 * Resolves the cropped logo emblem PNG on disk for inline CID attachment in emails.
 */
function getLogoAttachment(): { filename: string; path: string; cid: string } | null {
  const possiblePaths = [
    path.join(__dirname, "../assets/logo-icon.png"),
    path.join(__dirname, "../../src/assets/logo-icon.png"),
    path.join(process.cwd(), "src/assets/logo-icon.png"),
    path.join(process.cwd(), "backend/src/assets/logo-icon.png"),
    path.join(process.cwd(), "../public/logo-icon.png"),
    path.join(process.cwd(), "public/logo-icon.png"),
    // Fallback to logo.png if logo-icon.png is not found
    path.join(__dirname, "../assets/logo.png"),
    path.join(process.cwd(), "src/assets/logo.png"),
  ]

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return {
          filename: "logo-icon.png",
          path: p,
          cid: "sgFinanceLogo",
        }
      }
    } catch {}
  }
  return null
}

/**
 * Shared Executive Email Header with Full Unclipped Logo Emblem
 */
function buildEmailHeaderHtml(hasLogo: boolean): string {
  return `
    <div style="background-color: #0C144C; padding: 26px 20px; text-align: center; border-bottom: 3px solid #F4A515;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto; text-align: center; border-collapse: collapse;">
        <tr>
          ${
            hasLogo
              ? `
          <td style="vertical-align: middle; padding-right: 14px;">
            <img src="cid:sgFinanceLogo" alt="SG-Finance Logo" width="48" height="48" style="display: block; width: 48px; height: 48px; border: 0; outline: none; margin: 0; border-radius: 6px;" />
          </td>
          `
              : ""
          }
          <td style="vertical-align: middle; text-align: left;">
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.1; display: block;">
              SG<span style="color: #F4A515;">-FINANCE</span>
            </span>
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.8px; color: #94A3B8; display: block; margin-top: 3px;">
              Since 2020 • Financial Workspace
            </span>
          </td>
        </tr>
      </table>
    </div>
  `
}

/**
 * Shared Professional Email Footer
 */
function buildEmailFooterHtml(): string {
  const year = new Date().getFullYear()
  return `
    <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 22px 24px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8; line-height: 1.6;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748B;">
        © ${year} SG-Finance. All rights reserved.
      </p>
      <p style="margin: 0 0 8px 0;">
        Automated Financial Intelligence & Expense Management.
      </p>
      <p style="margin: 0; font-size: 11px; color: #CBD5E1;">
        This is an automated notification. Please do not reply directly to this email.
      </p>
    </div>
  `
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`
  const logo = getLogoAttachment()
  const attachments = logo ? [logo] : []

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email - SG-Finance</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 32px 12px; color: #1E293B;">
        <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Brand Header with Logo -->
          ${buildEmailHeaderHtml(Boolean(logo))}

          <!-- Main Content -->
          <div style="padding: 36px 28px;">
            
            <!-- Category Badge / Icon -->
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background: #ECFDF5; border: 1px solid #A7F3D0; width: 60px; height: 60px; border-radius: 18px; line-height: 60px; font-size: 28px;">
                ✉️
              </div>
            </div>

            <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; text-align: center; color: #0F172A; letter-spacing: -0.5px;">
              Verify Your Email Address
            </h1>

            <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6; text-align: center;">
              Welcome to <b>SG-Finance</b>! We are excited to have you. Please confirm your email address by clicking the button below to activate your account and start managing your finances.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${verifyUrl}" target="_blank" style="background: #16A34A; color: #FFFFFF; font-size: 15px; font-weight: 700; padding: 15px 36px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.28); letter-spacing: 0.2px;">
                Verify Email Address →
              </a>
            </div>

            <!-- Expiration Warning Card -->
            <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 16px; margin: 28px 0 20px 0; font-size: 13px; color: #92400E; line-height: 1.5; text-align: left;">
              <p style="margin: 0 0 4px 0; font-weight: 700;">
                ⏱️ Important Security Notice:
              </p>
              <p style="margin: 0;">
                This link will expire in <b>1 hour</b>. If you did not create an account with SG-Finance, you can safely disregard this email.
              </p>
            </div>

            <!-- Direct Link Fallback -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #64748B; word-break: break-all;">
              <p style="margin: 0 0 6px 0; font-weight: 600;">Button not working? Copy and paste this URL into your browser:</p>
              <a href="${verifyUrl}" style="color: #4F46E5; text-decoration: underline;">${verifyUrl}</a>
            </div>

          </div>

          <!-- Professional Footer -->
          ${buildEmailFooterHtml()}

        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"SG-Finance" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address - SG-Finance",
    html,
    attachments,
  })
}

export async function sendForgotPassWordEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`
  const logo = getLogoAttachment()
  const attachments = logo ? [logo] : []

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your Password - SG-Finance</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 32px 12px; color: #1E293B;">
        <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Brand Header with Logo -->
          ${buildEmailHeaderHtml(Boolean(logo))}

          <!-- Main Content -->
          <div style="padding: 36px 28px;">
            
            <!-- Category Badge / Icon -->
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background: #EEF2FF; border: 1px solid #C7D2FE; width: 60px; height: 60px; border-radius: 18px; line-height: 60px; font-size: 28px;">
                🔐
              </div>
            </div>

            <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; text-align: center; color: #0F172A; letter-spacing: -0.5px;">
              Reset Your Password
            </h1>

            <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6; text-align: center;">
              We received a request to reset the password for your <b>SG-Finance</b> account. Click the button below to choose a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" target="_blank" style="background: #4F46E5; color: #FFFFFF; font-size: 15px; font-weight: 700; padding: 15px 36px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.28); letter-spacing: 0.2px;">
                Reset Password →
              </a>
            </div>

            <!-- Expiration Warning Card -->
            <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 16px; margin: 28px 0 20px 0; font-size: 13px; color: #92400E; line-height: 1.5; text-align: left;">
              <p style="margin: 0 0 4px 0; font-weight: 700;">
                ⏱️ Time-Sensitive Security Notice:
              </p>
              <p style="margin: 0;">
                This link expires in <b>30 minutes</b>. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account secure.
              </p>
            </div>

            <!-- Direct Link Fallback -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #64748B; word-break: break-all;">
              <p style="margin: 0 0 6px 0; font-weight: 600;">Button not working? Copy and paste this URL into your browser:</p>
              <a href="${resetUrl}" style="color: #4F46E5; text-decoration: underline;">${resetUrl}</a>
            </div>

          </div>

          <!-- Professional Footer -->
          ${buildEmailFooterHtml()}

        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"SG-Finance" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your Password - SG-Finance",
    html,
    attachments,
  })
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
}

export function getCurrencySymbol(codeOrSymbol?: string): string {
  if (!codeOrSymbol) return "₹"
  const trimmed = codeOrSymbol.trim()
  const upper = trimmed.toUpperCase()
  if (CURRENCY_SYMBOLS[upper]) return CURRENCY_SYMBOLS[upper]
  return trimmed
}

export interface MonthlyDigestData {
  monthName: string
  year: number
  totalEarned: number
  totalSpent: number
  netSavings: number
  currencySymbol?: string
  currencyCode?: string
  biggestCategory: {
    name: string
    amount: number
    percentage: number
  } | null
  budget: {
    hasBudget: boolean
    limit: number
    totalSpent: number
    isUnder: boolean
    difference: number
    percentage: number
  }
}

export async function sendMonthlyDigestEmail(
  email: string,
  name: string,
  digest: MonthlyDigestData,
  pdfAttachment?: { filename: string; content: Buffer }
): Promise<void> {
  const symbol = getCurrencySymbol(digest.currencySymbol || digest.currencyCode || "INR")
  const formattedEarned = `${symbol}${digest.totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formattedSpent = `${symbol}${digest.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formattedSavings = `${symbol}${Math.abs(digest.netSavings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const savingsPrefix = digest.netSavings >= 0 ? "+" : "-"

  const dashboardUrl = `${getFrontendUrl()}/home/dashboard`
  const logo = getLogoAttachment()
  const attachments: any[] = logo ? [logo] : []

  if (pdfAttachment) {
    attachments.push({
      filename: pdfAttachment.filename,
      content: pdfAttachment.content,
      contentType: "application/pdf",
    })
  }

  const budgetStatusHtml = digest.budget.hasBudget
    ? `
      <div style="background: ${digest.budget.isUnder ? "#ECFDF5" : "#FEF2F2"}; border: 1px solid ${digest.budget.isUnder ? "#A7F3D0" : "#FECACA"}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: ${digest.budget.isUnder ? "#065F46" : "#991B1B"};">
            ${digest.budget.isUnder ? "✅ Under Budget" : "⚠️ Over Budget"}
          </span>
          <span style="font-size: 13px; font-weight: 600; color: ${digest.budget.isUnder ? "#047857" : "#B91C1C"};">
            ${digest.budget.percentage.toFixed(0)}% of limit used
          </span>
        </div>
        <p style="margin: 0; font-size: 13px; color: ${digest.budget.isUnder ? "#065F46" : "#7F1D1D"}; line-height: 1.4;">
          ${
            digest.budget.isUnder
              ? `Great job! You stayed under your planned budget by <b>${symbol}${digest.budget.difference.toFixed(2)}</b>.`
              : `You spent <b>${symbol}${digest.budget.difference.toFixed(2)}</b> more than your planned monthly budget of ${symbol}${digest.budget.limit.toFixed(2)}.`
          }
        </p>
      </div>
    `
    : `
      <div style="background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #6B7280;">No monthly budget limit was set for ${digest.monthName}. You can configure budgets on your dashboard.</p>
      </div>
    `

  const topCategoryHtml = digest.biggestCategory
    ? `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">
          Biggest Spending Category
        </p>
        <div style="display: flex; align-items: baseline; justify-content: space-between;">
          <span style="font-size: 18px; font-weight: 700; color: #1E293B;">
            🏷️ ${digest.biggestCategory.name}
          </span>
          <span style="font-size: 15px; font-weight: 700; color: #DC2626;">
            ${symbol}${digest.biggestCategory.amount.toFixed(2)}
            <span style="font-size: 12px; font-weight: 500; color: #64748B;"> (${digest.biggestCategory.percentage.toFixed(1)}% of expenses)</span>
          </span>
        </div>
      </div>
    `
    : `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #64748B;">No expenses recorded in ${digest.monthName}.</p>
      </div>
    `

  const pdfNoticeHtml = pdfAttachment
    ? `
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; text-align: left;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 38px; vertical-align: middle;">
              <div style="background: #DCFCE7; width: 34px; height: 34px; border-radius: 8px; text-align: center; line-height: 34px; font-size: 18px;">
                📎
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 10px;">
              <span style="font-size: 13px; font-weight: 700; color: #166534; display: block;">
                PDF Statement Attached
              </span>
              <span style="font-size: 12px; color: #15803D; display: block; margin-top: 1px;">
                Your official transaction report for <b>${digest.monthName} ${digest.year}</b> has been generated and attached to this email.
              </span>
            </td>
          </tr>
        </table>
      </div>
    `
    : ""

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Financial Digest - SG-Finance</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 24px 12px; color: #1E293B;">
        <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Brand Header with Logo -->
          ${buildEmailHeaderHtml(Boolean(logo))}

          <!-- Report Subtitle Bar -->
          <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); padding: 24px 20px; text-align: center; color: white;">
            <div style="display: inline-block; background: rgba(244, 165, 21, 0.2); border: 1px solid rgba(244, 165, 21, 0.4); padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; color: #FCD34D;">
              📊 Monthly Performance Report
            </div>
            <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
              ${digest.monthName} ${digest.year} Financial Snapshot
            </h1>
            <p style="margin: 0; font-size: 13px; color: #C7D2FE;">
              Hi ${name || "there"}, here is how your money moved this past month.
            </p>
          </div>

          <!-- Body Container -->
          <div style="padding: 24px;">

            <!-- Metrics Grid -->
            <div style="margin-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 8px;">
                <tr>
                  <td width="33%" style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 10px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #166534; display: block; margin-bottom: 4px;">Earned</span>
                    <span style="font-size: 16px; font-weight: 800; color: #15803D; word-break: break-all;">${formattedEarned}</span>
                  </td>
                  <td width="33%" style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px 10px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #991B1B; display: block; margin-bottom: 4px;">Spent</span>
                    <span style="font-size: 16px; font-weight: 800; color: #DC2626; word-break: break-all;">${formattedSpent}</span>
                  </td>
                  <td width="33%" style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 14px 10px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #3730A3; display: block; margin-bottom: 4px;">Net Cash</span>
                    <span style="font-size: 16px; font-weight: 800; color: ${digest.netSavings >= 0 ? "#4338CA" : "#DC2626"}; word-break: break-all;">
                      ${savingsPrefix}${formattedSavings}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- PDF Attachment Notice -->
            ${pdfNoticeHtml}

            <!-- Top Category -->
            ${topCategoryHtml}

            <!-- Budget Status -->
            ${budgetStatusHtml}

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
              <a href="${dashboardUrl}" style="background: #4F46E5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">
                Open SG-Finance Dashboard →
              </a>
            </div>

          </div>

          <!-- Footer -->
          ${buildEmailFooterHtml()}

        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"SG-Finance" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📊 Your Financial Digest: ${digest.monthName} ${digest.year} - SG-Finance`,
    html,
    attachments,
  })
}
