import {prisma} from "../../../lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import bcrypt from "bcrypt"

export async function GET(){
    try {

         const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

     const user = await prisma.user.findUnique({
        where:{id: session.user.id},
        select: {
            id: true,
            name: true,
            email: true,
            _count: {
                select:{
                    transaction: true,
                    budgets: true,
                    categories: true,
                },
            },
        },
     })

     if(!user){return NextResponse.json({error:"User not found"}, {status: 404})}

     return NextResponse.json(user);
    } catch (error) {
        console.error("GET /user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}


export async function PATCH(req: Request){
    try {
        const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

     const {name , email , currentPassword , newPassword} = await req.json();

     const user = await prisma.user.findUnique({
        where: {id: session.user.id},
     })

     if(!user){
        return NextResponse.json({error: "User not found"},{status:404})
     }

     if(newPassword){
        if(!currentPassword){
            return NextResponse.json({error: "Current password is required to set a new password"},{status: 400})
        }
     }

     const isValid = await bcrypt.compare(currentPassword , user.password);
      if(!isValid){
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        )
      }

      if(newPassword.length < 6){
        return NextResponse.json({error: "New Password length should be greater than 6"}, {status: 400})
      }

      if(email && email != user.email){
         const eamilTaken = await prisma.user.findUnique({where:{email}});
         if(eamilTaken){return NextResponse.json({error: "Email already exits"},{status:400})}
      }

      const updated = await prisma.user.update({
        where: {id: session.user.id},
        data: {
            ...(name && {name}),
            ...(email && {email}),
            ...(newPassword && {password: await bcrypt.hash(newPassword , 10)}),
        },
        select:{
            id: true,
            name: true,
            email: true,
        },
      })

      return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
    }


export async function DELETE(){
    try {
        const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

      await prisma.transaction.deleteMany({where: {userId: session.user.id}})
      await prisma.category.deleteMany({where:{userId : session.user.id}})
      await prisma.category.deleteMany({ where: { userId: session.user.id } })
    await prisma.user.delete({ where: { id: session.user.id } })

       return NextResponse.json({ message: "Account deleted successfully" })
    } catch (error) {
        console.error("DELETE /user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}