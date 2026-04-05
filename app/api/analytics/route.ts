import {prisma} from "../../../lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request){
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error: "Unauthorized"},{status: 401})
        }

        const {searchParams} = new URL(req.url);
        const month = searchParams.get("month") || new Date().toISOString().slice(0,7)

        const startDate = new Date(`${month}-01`);
        const endDate = new Date(new Date(`${month}-01`).setMonth(startDate.getMonth()+1))

        //Total income vs expense
        const totals = await prisma.transaction.groupBy({
            by: ["type"],
            where:{
                userId: session.user.id,
                date: {gte: startDate , lt: endDate}
            },
            _sum: {amount: true},
        })

        //Spending by category
        const byCategory = await prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                userId: session.user.id,
                type: "expense",
                date: {gte: startDate , lt:endDate},
            },
            _sum: {amount: true}
        })

        //get category details for the above
        const categoryIds = byCategory.map((b) => b.categoryId)
        const categories = await prisma.category.findMany({
            where: { id :{in : categoryIds}}
        })

        const categoryData = byCategory.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            return {
                name: cat?.name || "Unknown",
                color: cat?.color || "#6366f1",
                icon: cat?.icon || "📦",
                amount: b._sum.amount || 0
            }
        })

        //Daily spending trend for the month
        const dailytransactions = await prisma.transaction.findMany({
            where:{
                userId: session.user.id,
                date:{ gte: startDate , lt: endDate}
            },
            select:{ amount :true , type: true , date: true},
            orderBy: {date: "asc"}
        })

        //Group by day
        const dailyMap: Record<string , {income: number; expense: number}> = {}
         dailytransactions.forEach((t) => {
            const day = t.date.toISOString().slice(0,10);
            if(!dailyMap[day]) dailyMap[day] = { income: 0 , expense: 0}
            if(t.type === "income") dailyMap[day].income += t.amount
            else dailyMap[day].expense += t.amount
         })

         const dailyData = Object.entries(dailyMap).map(([date , values]) => ({
            date,
            ...values,
         }))

         return NextResponse.json({
            totals,
            categoryData,
            dailyData,
         })
    } catch (error) {
        console.error("GET /analytics error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}