/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, MapPin, CheckCircle, XCircle, HelpCircle, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { Event, RSVP } from "@/lib/types"

export default function PublicRSVPPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.eventId) {
      fetchEventData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.eventId])

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/rsvp/${params.eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setUserRSVP(data.userRSVP)
      } else {
        setError("Event not found")
      }
    } catch (error) {
      setError("Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async (status: "yes" | "no" | "maybe") => {
    if (!user) {
      router.push(`/auth/login?redirect=/rsvp/${params.eventId}`)
      return
    }

    setSubmitting(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: Number.parseInt(params.eventId as string), status }),
      })

      const data = await response.json()

      if (response.ok) {
        setUserRSVP(data.rsvp)
        setMessage("Your RSVP has been updated successfully!")
      } else {
        setError(data.error || "Failed to update RSVP")
      }
    } catch (error) {
      setError("An error occurred while updating your RSVP")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "yes":
        return { text: "You're attending this event", icon: CheckCircle, color: "text-green-600" }
      case "no":
        return { text: "You're not attending this event", icon: XCircle, color: "text-red-600" }
      case "maybe":
        return { text: "You might attend this event", icon: HelpCircle, color: "text-yellow-600" }
      default:
        return null
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-semibold mb-2">Event Not Found</h3>
            <p className="text-muted-foreground text-center mb-6">
              The event youre looking for doesnt exist or has been removed.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = userRSVP ? getStatusMessage(userRSVP.status) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Youre Invited!</h1>
            <p className="text-xl text-muted-foreground">Please respond to this event invitation</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{event?.title}</CardTitle>
              <CardDescription className="text-base">
                Organized by {event?.creator_name || "Event Organizer"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {event?.description && (
                <div>
                  <h3 className="font-semibold mb-2">About this event</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {event && format(new Date(event.event_date), "PPP")}
                    </p>
                  </div>
                </div>

                {event?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!user ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign in to RSVP</h3>
                <p className="text-muted-foreground text-center mb-6">
                  You need to be signed in to respond to this event invitation
                </p>
                <div className="flex gap-4">
                  <Link href={`/auth/login?redirect=/rsvp/${params.eventId}`}>
                    <Button>Sign In</Button>
                  </Link>
                  <Link href={`/auth/register?redirect=/rsvp/${params.eventId}`}>
                    <Button variant="outline">Create Account</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Response</CardTitle>
                <CardDescription>Let the organizer know if youll be attending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {statusInfo && (
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <statusInfo.icon className={`h-5 w-5 ${statusInfo.color}`} />
                    <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => handleRSVP("yes")}
                    disabled={submitting}
                    variant={userRSVP?.status === "yes" ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Yes, Ill be there
                  </Button>

                  <Button
                    onClick={() => handleRSVP("no")}
                    disabled={submitting}
                    variant={userRSVP?.status === "no" ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    No, I cant make it
                  </Button>

                  <Button
                    onClick={() => handleRSVP("maybe")}
                    disabled={submitting}
                    variant={userRSVP?.status === "maybe" ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Maybe, Im not sure yet
                  </Button>
                </div>

                {submitting && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                Event RSVP Manager
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
