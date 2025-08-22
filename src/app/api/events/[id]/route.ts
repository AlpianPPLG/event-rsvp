/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getEventById, updateEvent, deleteEvent } from "@/lib/events"

async function getHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = Number.parseInt(params.id)
    const event = await getEventById(eventId)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Get event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function putHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (request as any).user
    const eventId = Number.parseInt(params.id)
    const { title, description, eventDate, location } = await request.json()

    // Check if event exists and user owns it
    const existingEvent = await getEventById(eventId)
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to edit this event" }, { status: 403 })
    }

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 })
    }

    const event = await updateEvent(eventId, title, description || "", eventDate, location || "")

    if (!event) {
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function deleteHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (request as any).user
    const eventId = Number.parseInt(params.id)

    // Check if event exists and user owns it
    const existingEvent = await getEventById(eventId)
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to delete this event" }, { status: 403 })
    }

    const success = await deleteEvent(eventId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
    }

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const PUT = withAuth(putHandler)
export const DELETE = withAuth(deleteHandler)
