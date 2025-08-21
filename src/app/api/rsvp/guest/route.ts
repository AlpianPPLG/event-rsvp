import { type NextRequest, NextResponse } from "next/server"
import { getGuestByEventAndEmail, updateGuestStatus, createGuest } from "@/lib/guests"
import { getEventById } from "@/lib/events"

export async function POST(request: NextRequest) {
  try {
    const { eventId, name, email, status } = await request.json()

    if (!eventId || !name || !email || !status) {
      return NextResponse.json({ error: "Event ID, name, email, and status are required" }, { status: 400 })
    }

    if (!["yes", "no", "maybe"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be yes, no, or maybe" }, { status: 400 })
    }

    // Check if event exists
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if guest already exists
    let guest = await getGuestByEventAndEmail(eventId, email)

    if (guest) {
      // Update existing guest
      guest = await updateGuestStatus(guest.id, status)
    } else {
      // Create new guest
      guest = await createGuest(eventId, name, email, status)
    }

    if (!guest) {
      return NextResponse.json({ error: "Failed to create/update guest RSVP" }, { status: 500 })
    }

    return NextResponse.json({ guest, message: "Guest RSVP updated successfully" })
  } catch (error) {
    console.error("Guest RSVP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
