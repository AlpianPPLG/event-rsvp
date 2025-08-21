"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, HelpCircle } from "lucide-react"

interface RSVPQuickFormProps {
  eventId: number
  currentStatus?: "yes" | "no" | "maybe" | null
  onUpdate?: (status: "yes" | "no" | "maybe") => void
}

export function RSVPQuickForm({ eventId, currentStatus, onUpdate }: RSVPQuickFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleRSVP = async (status: "yes" | "no" | "maybe") => {
    setSubmitting(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Your RSVP has been updated!")
        onUpdate?.(status)
      } else {
        setError(data.error || "Failed to update RSVP")
      }
    } catch (error) {
      setError("An error occurred while updating your RSVP")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick RSVP</CardTitle>
        <CardDescription>Update your response for this event</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-2">
          <Button
            onClick={() => handleRSVP("yes")}
            disabled={submitting}
            variant={currentStatus === "yes" ? "default" : "outline"}
            className="justify-start"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Yes, I'll attend
          </Button>

          <Button
            onClick={() => handleRSVP("no")}
            disabled={submitting}
            variant={currentStatus === "no" ? "default" : "outline"}
            className="justify-start"
          >
            <XCircle className="h-4 w-4 mr-2" />
            No, I can't make it
          </Button>

          <Button
            onClick={() => handleRSVP("maybe")}
            disabled={submitting}
            variant={currentStatus === "maybe" ? "default" : "outline"}
            className="justify-start"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Maybe
          </Button>
        </div>

        {submitting && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
