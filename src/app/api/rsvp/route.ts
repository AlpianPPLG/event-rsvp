import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { createOrUpdateRSVP } from "@/lib/rsvp"
import { getEventById } from "@/lib/events"

async function postHandler(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user
    const { eventId, status } = await request.json()

    if (!eventId || !status) {
      return NextResponse.json({ error: "Event ID and status are required" }, { status: 400 })
    }

    if (!["yes", "no", "maybe"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be yes, no, or maybe" }, { status: 400 })
    }

    // Check if event exists
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const rsvp = await createOrUpdateRSVP(eventId, user.id, status)

    if (!rsvp) {
      return NextResponse.json({ error: "Failed to create/update RSVP" }, { status: 500 })
    }

    return NextResponse.json({ rsvp, message: "RSVP updated successfully" })
  } catch (error) {
    console.error("RSVP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(postHandler)
