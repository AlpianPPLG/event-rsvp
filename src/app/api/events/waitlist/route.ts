import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import {
  addToWaitlist,
  removeFromWaitlist,
  getEventWaitlist,
  checkEventCapacity,
  convertWaitlistToRSVP,
  getWaitlistPosition
} from "@/lib/waitlist"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const action = searchParams.get("action")

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId parameter" }, { status: 400 })
    }

    const eventIdNum = parseInt(eventId)

    if (action === "capacity") {
      const capacity = await checkEventCapacity(eventIdNum)
      return NextResponse.json({ capacity })
    }

    if (action === "waitlist") {
      const waitlist = await getEventWaitlist(eventIdNum)
      return NextResponse.json({ waitlist })
    }

    if (action === "position") {
      const user = await verifyAuth(request)
      const guestEmail = searchParams.get("guestEmail")
      
      const position = await getWaitlistPosition(
        eventIdNum,
        user?.id,
        guestEmail || undefined
      )
      return NextResponse.json({ position })
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching waitlist data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      eventId,
      userId,
      guestName,
      guestEmail,
      action
    } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    if (action === "join") {
      if (!userId && (!guestName || !guestEmail)) {
        return NextResponse.json(
          { error: "Must provide either userId or guestName and guestEmail" },
          { status: 400 }
        )
      }

      const waitlistEntry = await addToWaitlist(
        eventId,
        userId,
        guestName,
        guestEmail
      )

      if (!waitlistEntry) {
        return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 })
      }

      return NextResponse.json({ waitlistEntry }, { status: 201 })
    }

    if (action === "convert") {
      const { waitlistId, responseStatus } = await request.json()
      
      if (!waitlistId) {
        return NextResponse.json({ error: "Missing waitlistId" }, { status: 400 })
      }

      const success = await convertWaitlistToRSVP(waitlistId, responseStatus)
      
      if (!success) {
        return NextResponse.json({ error: "Failed to convert waitlist to RSVP" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error managing waitlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const waitlistId = searchParams.get("waitlistId")

    if (!waitlistId) {
      return NextResponse.json({ error: "Missing waitlistId parameter" }, { status: 400 })
    }

    const success = await removeFromWaitlist(parseInt(waitlistId))

    if (!success) {
      return NextResponse.json({ error: "Failed to remove from waitlist" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from waitlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}