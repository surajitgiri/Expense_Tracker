import { prisma } from "../../../lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("GET /categories error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color, icon } = await req.json()

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    // Prevent duplicate category names for same user
    const existing = await prisma.category.findFirst({
      where: { name, userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon: icon || "📦",
        userId: session.user.id,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("POST /categories error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, color, icon } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing category id" }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /categories error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if(!session){
       return NextResponse.json({error: "Unauthorized"},{status: 401})
    }

    const {searchParams} = new URL(req.url);
    const id = searchParams.get("id")

    if(!id){
      return NextResponse.json({error: "Missing category id"}, {status: 400})
    }

    const existing = await prisma.category.findUnique({
      where:{id}
    })

    if(!existing || existing.id !== session.user.id){
      return NextResponse.json({error: "Not found"},{status:  404})
    }

    const transactionCount = await prisma.transaction.count({
      where:{categoryId: id}
    })

    if(transactionCount > 0){
      return NextResponse.json(
        {error: `Cannot delete - this category has ${transactionCount} transaction`},
        {status: 400}
      )
    }

    await prisma.category.delete({
      where:{id}
    })

    return NextResponse.json({message: "Category deleted successfully"})
  } catch (error) {
     console.error("DELETE /categories error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}