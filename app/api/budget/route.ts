import {prisma} from "../../../lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createNotification } from "@/lib/notification";

export async function GET(req: Request){
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error: "Unauthorized"}, {status:401})
        }

        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month") || new Date().toISOString().slice(0,7)

        const budgets = await prisma.budget.findMany({
            where:{
                userId: session.user.id,
                month,
            },
            include: {category: true},
            orderBy: {category: {name: "asc"}},
        })

        const budgetWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const spent = await prisma.transaction.aggregate({
                    where:{
                        userId: session.user.id,
                        categoryId: budget.categoryId,
                        type: "expense",
                        date:{
                            gte: new Date(`${month}-01`),
                            lt: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth()+1))
                        },
                    },
                    _sum: {amount: true}
                })

                const spentamount = spent._sum.amount || 0;
                if(spentamount > budget.limit){
                    await createNotification({
                        userId: session.user.id,
                        message: `You exceeded your budget for ${budget.category.name}`,
                        type: "warning"
                    })
                }

                return {
                    ...budget,
                    spent: spent._sum.amount || 0,
                    remaining: budget.limit - (spent._sum.amount || 0),
                    percentage: Math.min(((spent._sum.amount || 0) / budget.limit) * 100, 100)
                }

                
            })

            
        )

        
        return NextResponse.json(budgetWithSpent)
    } catch (error) {
        console.error("GET /budget error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}


export async function POST(req: Request){
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const {categoryId , limit , month } = await req.json();

        if(!categoryId || !limit || !month){
            return NextResponse.json({error: "Missing fields"} , {status: 400})
        }

        if(limit <= 0){
            return NextResponse.json({error: "Limit must be greater than 0"}, {status: 400})
        }

        const existing = await prisma.budget.findFirst({
            where:{
                userId: session.user.id,
                categoryId,
                month
            }
        })

        if(existing){
            return NextResponse.json(
        { error: "Budget already exists for this category and month" },
        { status: 400 }
        )}

        const budget = await prisma.budget.create({
            data:{
                categoryId,
                limit: parseFloat(limit),
                month,
                userId: session.user.id,
            }
        })

        return NextResponse.json(budget , {status: 201})
    } catch (error) {
        console.error("POST /budget error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
    }


export async function PATCH(req: Request){
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {id , limit} = await req.json();
      if(!id || !limit){
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
      }

      if (limit <= 0) {
      return NextResponse.json({ error: "Limit must be greater than 0" }, { status: 400 })
    }

    const existing = await prisma.budget.findUnique({where :{id}})
    if(!existing || existing.userId !== session.user.id){
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

      const updated = await prisma.budget.update({
        where:{id},
        data: {limit: parseFloat(limit)},
        include: {category: true}
      })

      return NextResponse.json(updated)
    } catch (error) {
        console.error("PATCH /budget error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
    }


export async function DELETE(req: Request){
    try {
        const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {searchParams} = new URL(req.url);
    const id = searchParams.get("id") 

    if(!id){
        return NextResponse.json({error: "missing budget id"},{status:400})
    }
    const existing = await prisma.budget.findUnique({where:{id}})

    if(!existing || existing.id !== session.user.id){
        return NextResponse.json({error:"Not found"}, {status:401})
    }

    await prisma.budget.delete({where:{id}})

        return NextResponse.json({ message: "Budget deleted successfully" })
    } catch (error) {
        console.error("PATCH /budget error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
    }
