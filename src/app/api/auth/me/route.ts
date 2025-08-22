import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getUserById } from "@/lib/auth"

async function handler(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user
    const fullUser = await getUserById(user.id)

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: fullUser })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(handler)
