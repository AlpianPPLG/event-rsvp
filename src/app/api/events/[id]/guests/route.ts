/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getGuestsByEvent, createGuest, getGuestStats } from "@/lib/guests"
import { getEventById } from "@/lib/events"

async function getHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (request as any).user
    const eventId = Number.parseInt(params.id)

    // Check if event exists and user owns it
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to view guests for this event" }, { status: 403 })
    }

    const guests = await getGuestsByEvent(eventId)
    const stats = await getGuestStats(eventId)

    return NextResponse.json({ guests, stats, event })
  } catch (error) {
    console.error("Get guests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function postHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (request as any).user
    const eventId = Number.parseInt(params.id)
    const { name, email, status = "yes" } = await request.json()

    // Check if event exists and user owns it
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to add guests to this event" }, { status: 403 })
    }

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    if (!["yes", "no", "maybe"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be yes, no, or maybe" }, { status: 400 })
    }

    const guest = await createGuest(eventId, name, email, status)

    if (!guest) {
      return NextResponse.json({ error: "Failed to create guest" }, { status: 500 })
    }

    return NextResponse.json({ guest }, { status: 201 })
  } catch (error) {
    console.error("Create guest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
