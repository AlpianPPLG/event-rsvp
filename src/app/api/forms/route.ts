import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import {
  createFormTemplate,
  getFormTemplates,
  updateFormTemplate,
  deleteFormTemplate,
  saveFormResponse,
  getFormResponses,
  processConditionalForm
} from "@/lib/smart-forms"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const eventId = searchParams.get("eventId")

    if (action === "templates") {
      const templates = await getFormTemplates(user.id)
      return NextResponse.json({ templates })
    }

    if (action === "responses" && eventId) {
      const responses = await getFormResponses(parseInt(eventId))
      return NextResponse.json({ responses })
    }

    return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching smart forms data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const body = await request.json()
    const { action } = body

    if (action === "create_template") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { name, description, fields, isPublic } = body

      if (!name || !fields) {
        return NextResponse.json(
          { error: "Missing required fields: name, fields" },
          { status: 400 }
        )
      }

      const template = await createFormTemplate(
        name,
        description,
        fields,
        user.id,
        isPublic
      )

      if (!template) {
        return NextResponse.json({ error: "Failed to create form template" }, { status: 500 })
      }

      return NextResponse.json({ template }, { status: 201 })
    }

    if (action === "submit_response") {
      const {
        eventId,
        userId,
        guestName,
        guestEmail,
        responses,
        rsvpStatus
      } = body

      if (!eventId || !responses || !rsvpStatus) {
        return NextResponse.json(
          { error: "Missing required fields: eventId, responses, rsvpStatus" },
          { status: 400 }
        )
      }

      if (!userId && (!guestName || !guestEmail)) {
        return NextResponse.json(
          { error: "Must provide either userId or guestName and guestEmail" },
          { status: 400 }
        )
      }

      const success = await saveFormResponse(
        eventId,
        userId,
        guestName,
        guestEmail,
        responses,
        rsvpStatus
      )

      if (!success) {
        return NextResponse.json({ error: "Failed to save form response" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === "process_conditional") {
      const { fields, formData } = body

      if (!fields || !formData) {
        return NextResponse.json(
          { error: "Missing required fields: fields, formData" },
          { status: 400 }
        )
      }

      const result = processConditionalForm(fields, formData)
      return NextResponse.json({ result })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing smart forms request:", error)
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
      templateId,
      name,
      description,
      fields
    } = await request.json()

    if (!templateId || !name || !fields) {
      return NextResponse.json(
        { error: "Missing required fields: templateId, name, fields" },
        { status: 400 }
      )
    }

    const success = await updateFormTemplate(
      templateId,
      name,
      description,
      fields
    )

    if (!success) {
      return NextResponse.json({ error: "Failed to update form template" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating form template:", error)
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
    const templateId = searchParams.get("templateId")

    if (!templateId) {
      return NextResponse.json({ error: "Missing templateId parameter" }, { status: 400 })
    }

    const success = await deleteFormTemplate(parseInt(templateId))

    if (!success) {
      return NextResponse.json({ error: "Failed to delete form template" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}