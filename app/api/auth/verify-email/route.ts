import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { hashToken } from "@/lib/token";

export async function GET(req: NextRequest){
    try {
        const {searchParams} = new URL(req.url)
        const token = searchParams.get('token')

        if(!token){
            return NextResponse.json(
                {error: "Token is missing"},
                {status: 400}
            )
        }

        const hashedToken = hashToken(token);

        const user = await prisma.user.findFirst({
            where: {
                verifyToken: hashedToken
            },
        })

        if(!user){
            return NextResponse.json({error: 'Invalid token'} , {status: 400})
        }

        if(!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()){
            return NextResponse.json({error: 'Token has expired. Please register again'},{status: 400})
        }

        await prisma.user.update({
            where: {id: user.id},
            data:{
                isVerified:true,
                verifyToken: null,
                verifyTokenExpiry: null,
            }
        })

            return NextResponse.json(
                { message: 'Email verified successfully' },
                { status: 200 }
                )
    } catch (error) {
         console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
    }
