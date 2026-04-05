import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createNotification } from "@/lib/notification";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json({error: "Unauthorized"},{status: 401})
        }

        const {searchParams} = new URL(req.url);
        const category = searchParams.get("category")
        const type = searchParams.get("type")
        const month = searchParams.get("month")

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                ...(category && {categoryId: category}),
                ...(type && {type}),
                ...(month && {
                    date: {
                        gte: new Date(`${month}-01`),
                        lte: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth()+1))
                    },
                }),
            },
            include: {category: true},
            orderBy: {date:"desc"}
        })

        return NextResponse.json(transactions)

    } catch (error) {
        console.error("GET /transactions error:", error);
        return NextResponse.json({error: "Somthing went wrong"} , {status:500})
    } 
}


export async function POST(req: Request){
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error: "Unauthorized"} , {status: 401})
        }

        const {amount , type , description , date , categoryId} = await req.json();

         if (!amount || !type || !date || !categoryId || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

       const transaction = await prisma.transaction.create({
         data:{
            amount: parseFloat(amount),
            type,
            description,
            date: new Date(date),
            categoryId,
            userId: session.user.id
         },
         include: {category : true}
       })

       await createNotification({
        userId: session.user.id,
        message: "Transaction added successfully",
        type: "success"
       })

       return NextResponse.json(transaction , {status: 201})
    } catch (error) {
         console.error("POST /transactions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}


export async function DELETE(req: Request){
    try {
        const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {searchParams } = new URL(req.url)
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 })
    }

    const existing = await prisma.transaction.findUnique({where:{id}});

    if(!existing || existing.userId !== session.user.id){
        return NextResponse.json({error: "Not found"} , {status: 404})
    }

    await prisma.transaction.delete({where:{id}})

    return NextResponse.json({message: "Deleted successfully"})
    } catch (error) {
        console.error("DELETE /transactions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}


export async function PUT(req: Request){
    try {
        const session = await getServerSession(authOptions)
        if(!session){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const { id, amount, type, description, date, categoryId } = await req.json()

         if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 })
    }
      const existing = await prisma.transaction.findUnique({where:{id}})
      if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
     
    const updated = await prisma.transaction.update({
        where:{id},
        data:{
            ...(amount && {amount: parseFloat(amount)}),
            ...(type && {type}),
            ...(description && {description}),
            ...(date && {date: new Date(date)}),
            ...(categoryId && {categoryId}),
        },
        include: {category: true},
    })
     return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /transactions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}