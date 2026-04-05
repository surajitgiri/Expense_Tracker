import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { hashToken } from "@/lib/token";
import bcrypt from 'bcrypt'

export async function POST(req: NextRequest){
    try {
        const{token , password} = await req.json();

        if(!token || !password){
            return NextResponse.json({error: "password and token are required"},{status: 400})
        }

        if(password.length < 6){
            return NextResponse.json({error: "password must contain at least 6 character"},{status: 400})
        }

        const hashedToken = hashToken(token);

        const user = await prisma.user.findFirst({
            where:{
                resetToken: hashedToken
            }
        })

        if(!user){
            return NextResponse.json({error: "Invalid token"}, {status:400})
        }

        if(!user.resetTokenExpiry || user.resetTokenExpiry < new Date()){
            return NextResponse.json({error: "Token has Expired. please request a new one."}, {status:400})
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        await prisma.user.update(({
            where: {id: user.id},
            data:{
                password :hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        }))

        return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
    } catch (error) {
        console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
    }
}