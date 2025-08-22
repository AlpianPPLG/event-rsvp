import { type NextRequest, NextResponse } from "next/server"
import { getRSVPByEventAndUser } from "@/lib/rsvp"
import { getEventById } from "@/lib/events"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    const eventIdNum = Number.parseInt(eventId)

    // Get event details (public info)
    const event = await getEventById(eventIdNum)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is authenticated and get their RSVP status
    let userRSVP = null
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userRSVP = await getRSVPByEventAndUser(eventIdNum, decoded.id)
      }
    }

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        location: event.location,
        creator_name: event.creator_name,
      },
      userRSVP,
    })
  } catch (error) {
    console.error("Get public event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
