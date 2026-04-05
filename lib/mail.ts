import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export async function sendVerificationEmail(email: string , token: string){
    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

    await transporter.sendMail({
        from: `"Expense Tracker <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
        <h2>Verify your email</h2>
      <p>Click the link below to verify your email. This link expires in <b>1 hour</b>.</p>
      <a href="${verifyUrl}" style="
        background:#4F46E5;
        color:white;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
      ">Verify Email</a>
      <p>If you didn't create an account, ignore this email.</p>
        `,
    })
}

export async function sendForgotPassWordEmail(email: string , token:string){
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Password",
        html: `
          <h2>Reset your password</h2>
      <p>Click the link below to reset your password. 
         This link expires in <b>30 minutes</b>.</p>
      <a href="${resetUrl}" style="
        background:#4F46E5;
        color:white;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
      ">Reset Password</a>
      <p>If you didn't request this, ignore this email.
         Your password will remain unchanged.</p>
        `,
    })
}