import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { createEvent, getEventsByUser, getAllEvents } from "@/lib/events"

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get("all") === "true"

    let events
    if (showAll && user.role === "admin") {
      events = await getAllEvents()
    } else {
      events = await getEventsByUser(user.id)
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function postHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const { title, description, eventDate, location } = await request.json()

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 })
    }

    const event = await createEvent(title, description || "", eventDate, location || "", user.id)

    if (!event) {
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
