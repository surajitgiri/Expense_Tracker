import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { generateToken , hashToken } from "@/lib/token";
import { sendForgotPassWordEmail } from "@/lib/mail";

export async function POST(req: NextRequest){
    try {
        const {email} = await req.json();

        if(!email){return NextResponse.json({error:"Email is required"},{status: 400})}

        const user = await prisma.user.findUnique({
            where:{email}
        })

        if(!user){
            return NextResponse.json({message: 'If this email exists, a reset link has been sent'},{status:200})
        }

        const rawToken = generateToken();
        const hashedToken = hashToken(rawToken)

        await prisma.user.update({
            where:{email},
            data:{
                resetToken: hashedToken,
                resetTokenExpiry: new Date(Date.now() + 30*60*1000),
            }
        })

        await sendForgotPassWordEmail(email, rawToken)

        return NextResponse.json(
      { message: 'If this email exists, a reset link has been sent.' },
      { status: 200 }
    )

    } catch (error) {
        console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
    }
}