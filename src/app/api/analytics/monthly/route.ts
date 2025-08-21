import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getMonthlyStats } from "@/lib/analytics"

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const stats = await getMonthlyStats(user.id)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Monthly analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
