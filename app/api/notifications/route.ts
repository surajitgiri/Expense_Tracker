import { getServerSession } from "next-auth";
import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(){
    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status: 401})
        }

        const notifications = await prisma.notification.findMany({
            where: {userId: session.user.id},
            orderBy: {createdAt: "desc"},
            take: 10,
        })

        return NextResponse.json(notifications)
    } catch (error) {
        console.error("GET /Notification error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req: Request){
    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status: 401})
        }

        const {id} = await req.json();
        if(!id){
            await prisma.notification.updateMany({
            where:{userId: session.user.id , isRead:false},
            data: {isRead: true}
        })
        }

        else{
            await prisma.notification.update({
                where:{id , userId: session.user.id},
                data:{isRead: true}
            })
        }
        

        return Response.json({success : true})
    } catch (error) {
        console.error("PATCH /Notification error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }

}