"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendForgotPassWordEmail = sendForgotPassWordEmail;
exports.sendMonthlyDigestEmail = sendMonthlyDigestEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const getFrontendUrl = () => process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
async function sendVerificationEmail(email, token) {
    const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email address",
        html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email. This link expires in <b>1 hour</b>.</p>
      <a href="${verifyUrl}" style="
        background:#4F46E5;
        color:white;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
        display:inline-block;
      ">Verify Email</a>
      <p>If you didn't create an account, ignore this email.</p>
    `,
    });
}
async function sendForgotPassWordEmail(email, token) {
    const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${token}`;
    await transporter.sendMail({
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Password",
        html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password. This link expires in <b>30 minutes</b>.</p>
      <a href="${resetUrl}" style="
        background:#4F46E5;
        color:white;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
        display:inline-block;
      ">Reset Password</a>
      <p>If you didn't request this, ignore this email. Your password will remain unchanged.</p>
    `,
    });
}
async function sendMonthlyDigestEmail(email, name, digest) {
    const symbol = digest.currencySymbol || "$";
    const formattedEarned = `${symbol}${digest.totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedSpent = `${symbol}${digest.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedSavings = `${symbol}${Math.abs(digest.netSavings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const savingsPrefix = digest.netSavings >= 0 ? "+" : "-";
    const dashboardUrl = `${getFrontendUrl()}/home/dashboard`;
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
          ${digest.budget.isUnder
            ? `Great job! You stayed under your planned budget by <b>${symbol}${digest.budget.difference.toFixed(2)}</b>.`
            : `You spent <b>${symbol}${digest.budget.difference.toFixed(2)}</b> more than your planned monthly budget of ${symbol}${digest.budget.limit.toFixed(2)}.`}
        </p>
      </div>
    `
        : `
      <div style="background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #6B7280;">No monthly budget limit was set for ${digest.monthName}. You can configure budgets on your dashboard.</p>
      </div>
    `;
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
    `;
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Financial Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 24px 12px; color: #1E293B;">
        <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); padding: 32px 24px; text-align: center; color: white;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
              📊 Financial Report
            </div>
            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
              ${digest.monthName} ${digest.year} Digest
            </h1>
            <p style="margin: 0; font-size: 14px; color: #E0E7FF;">
              Hi ${name || "there"}, here is your monthly financial performance snapshot.
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
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #3730A3; display: block; margin-bottom: 4px;">Net</span>
                    <span style="font-size: 16px; font-weight: 800; color: ${digest.netSavings >= 0 ? "#4338CA" : "#DC2626"}; word-break: break-all;">
                      ${savingsPrefix}${formattedSavings}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Top Category -->
            ${topCategoryHtml}

            <!-- Budget Status -->
            ${budgetStatusHtml}

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
              <a href="${dashboardUrl}" style="background: #4F46E5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                Open Expense Tracker Dashboard →
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 24px; text-align: center; font-size: 12px; color: #94A3B8;">
            <p style="margin: 0 0 4px 0;">This automated digest was scheduled for the 1st of the month by Expense Tracker.</p>
            <p style="margin: 0;">Manage your notification and account preferences in your settings.</p>
          </div>

        </div>
      </body>
    </html>
  `;
    await transporter.sendMail({
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📊 Your Financial Digest: ${digest.monthName} ${digest.year}`,
        html,
    });
}
