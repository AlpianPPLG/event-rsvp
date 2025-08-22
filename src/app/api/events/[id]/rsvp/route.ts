import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getRSVPsByEvent, getRSVPStats } from "@/lib/rsvp"
import { getEventById } from "@/lib/events"

async function getHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user
    const eventId = Number.parseInt(params.id)

    // Check if event exists and user owns it
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to view RSVPs for this event" }, { status: 403 })
    }

    const rsvps = await getRSVPsByEvent(eventId)
    const stats = await getRSVPStats(eventId)

    return NextResponse.json({ rsvps, stats, event })
  } catch (error) {
    console.error("Get RSVPs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
