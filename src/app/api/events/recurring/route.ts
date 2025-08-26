import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import {
  createRecurringEventSeries,
  getRecurringEventSeries,
  updateRecurringEventSeries,
  deleteRecurringEventSeries
} from "@/lib/recurring-events"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const series = await getRecurringEventSeries(user.id)
    return NextResponse.json({ series })
  } catch (error) {
    console.error("Error fetching recurring events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      recurrenceType,
      maxCapacity,
      customFormFields
    } = await request.json()

    if (!title || !startDate || !recurrenceType) {
      return NextResponse.json(
        { error: "Missing required fields: title, startDate, recurrenceType" },
        { status: 400 }
      )
    }

    if (!['weekly', 'monthly', 'yearly'].includes(recurrenceType)) {
      return NextResponse.json(
        { error: "Invalid recurrence type. Must be weekly, monthly, or yearly" },
        { status: 400 }
      )
    }

    const series = await createRecurringEventSeries(
      title,
      description,
      location,
      startDate,
      endDate,
      recurrenceType,
      user.id,
      maxCapacity,
      customFormFields
    )

    if (!series) {
      return NextResponse.json({ error: "Failed to create recurring event series" }, { status: 500 })
    }

    return NextResponse.json({ series }, { status: 201 })
  } catch (error) {
    console.error("Error creating recurring event series:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      seriesId,
      title,
      description,
      location,
      updateFutureEvents
    } = await request.json()

    if (!seriesId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: seriesId, title" },
        { status: 400 }
      )
    }

    const success = await updateRecurringEventSeries(
      seriesId,
      title,
      description,
      location,
      updateFutureEvents
    )

    if (!success) {
      return NextResponse.json({ error: "Failed to update recurring event series" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating recurring event series:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const seriesId = searchParams.get("seriesId")
    const deleteFutureEvents = searchParams.get("deleteFutureEvents") === "true"

    if (!seriesId) {
      return NextResponse.json({ error: "Missing seriesId parameter" }, { status: 400 })
    }

    const success = await deleteRecurringEventSeries(
      parseInt(seriesId),
      deleteFutureEvents
    )

    if (!success) {
      return NextResponse.json({ error: "Failed to delete recurring event series" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recurring event series:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}