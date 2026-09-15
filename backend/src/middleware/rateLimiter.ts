import rateLimit from "express-rate-limit"

// Protects login & registration against brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 failed attempts per window per IP
  skipSuccessfulRequests: true, // Successful logins/registrations do not count
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many failed attempts from this IP. Please try again after 15 minutes.",
  },
})
