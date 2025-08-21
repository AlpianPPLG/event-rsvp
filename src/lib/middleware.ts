import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const token =
        request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      // Add user info to request
      ;(request as any).user = decoded
      return handler(request, ...args)
    } catch (error) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export function withAdminAuth(handler: Function) {
  return withAuth(async (request: NextRequest, ...args: any[]) => {
    const user = (request as any).user

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    return handler(request, ...args)
  })
}
