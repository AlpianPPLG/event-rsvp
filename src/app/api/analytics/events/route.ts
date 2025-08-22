import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getEventAnalytics } from "@/lib/analytics"

async function getHandler(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user
    const analytics = await getEventAnalytics(user.id)

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Event analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
