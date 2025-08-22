import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getEventById } from "@/lib/events"
import { getRSVPsByEvent } from "@/lib/rsvp"
import { getGuestsByEvent } from "@/lib/guests"

async function getHandler(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user
    const eventId = Number.parseInt(params.eventId)

    // Check if event exists and user owns it
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to export data for this event" }, { status: 403 })
    }

    // Get RSVPs and guests
    const rsvps = await getRSVPsByEvent(eventId)
    const guests = await getGuestsByEvent(eventId)

    return NextResponse.json({
      event,
      rsvps,
      guests,
    })
  } catch (error) {
    console.error("Export data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
