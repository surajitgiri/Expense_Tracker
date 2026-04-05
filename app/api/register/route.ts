import {prisma} from "../../../lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import { generateToken , hashToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request){
    try {
        const{email, password, name} = await req.json();

        if(!email || !password || !name){
            return NextResponse.json({error: "Missing fields"}, {status: 400})
        }

        const existingUser = await prisma.user.findUnique({
            where:{email},
        });

        if(existingUser){
            return NextResponse.json({error: "User already exists"}, {status:400})
        }

        const hashedpass = await bcrypt.hash(password,10);

      const newUser =  await prisma.user.create({
            data: {
                email,
                password: hashedpass,
                name
            },
        })

        const rawToken = generateToken()
        const hashedToken = hashToken(rawToken)

        await prisma.user.update({
            where: {id: newUser.id},
            data:{
                verifyToken: hashedToken,
                verifyTokenExpiry: new Date(Date.now() + 60 * 60 * 1000)
            },
        })

        await sendVerificationEmail(newUser.email , rawToken)
        
        return NextResponse.json({ message: 'Registration successful! Please check your email to verify.' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({error:"Somthing went wrong"} , {status:500})
    }
}