import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getGuestById, updateGuest, deleteGuest } from "@/lib/guests"
import { getEventById } from "@/lib/events"

async function putHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (request as any).user
    const guestId = Number.parseInt(params.id)
    const { name, email, status } = await request.json()

    // Check if guest exists
    const guest = await getGuestById(guestId)
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Check if user owns the event
    const event = await getEventById(guest.event_id)
    if (!event || (event.created_by !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized to edit this guest" }, { status: 403 })
    }

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    if (!["yes", "no", "maybe"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be yes, no, or maybe" }, { status: 400 })
    }

    const updatedGuest = await updateGuest(guestId, name, email, status)

    if (!updatedGuest) {
      return NextResponse.json({ error: "Failed to update guest" }, { status: 500 })
    }

    return NextResponse.json({ guest: updatedGuest })
  } catch (error) {
    console.error("Update guest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function deleteHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (request as any).user
    const guestId = Number.parseInt(params.id)

    // Check if guest exists
    const guest = await getGuestById(guestId)
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Check if user owns the event
    const event = await getEventById(guest.event_id)
    if (!event || (event.created_by !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized to delete this guest" }, { status: 403 })
    }

    const success = await deleteGuest(guestId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete guest" }, { status: 500 })
    }

    return NextResponse.json({ message: "Guest deleted successfully" })
  } catch (error) {
    console.error("Delete guest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAuth(putHandler)
export const DELETE = withAuth(deleteHandler)
