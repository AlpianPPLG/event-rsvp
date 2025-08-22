"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users, ArrowLeft, Edit, Share2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { Event } from "@/lib/types"

export default function EventDetailPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
      }
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEventStatus = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "Past", variant: "secondary" as const }
    if (diffDays === 0) return { status: "Today", variant: "destructive" as const }
    if (diffDays <= 7) return { status: "This Week", variant: "default" as const }
    return { status: "Upcoming", variant: "outline" as const }
  }

  const copyEventLink = () => {
    const url = `${window.location.origin}/rsvp/${params.id}`
    const receiptText = `
═══════════════════════════════════════
        EVENT RSVP INVITATION
═══════════════════════════════════════

Event: ${event?.title || "N/A"}
Date: ${event ? format(new Date(event.event_date), "PPP") : "N/A"}
Location: ${event?.location || "N/A"}
Organizer: ${event?.creator_name || "N/A"}

───────────────────────────────────────
RSVP LINK:
${url}
───────────────────────────────────────

Please click the link above to confirm
your attendance for this event.

Generated: ${format(new Date(), "PPP 'at' p")}
═══════════════════════════════════════
    `

    navigator.clipboard.writeText(receiptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    )
  }

  if (!event) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <h3 className="text-xl font-semibold mb-2">Event not found</h3>
                <p className="text-muted-foreground mb-6">The event youre looking for doesnt exist.</p>
                <Link href="/events">
                  <Button>Back to Events</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthGuard>
    )
  }

  const eventStatus = getEventStatus(event.event_date)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{event.title}</CardTitle>
                        <Badge variant={eventStatus.variant}>{eventStatus.status}</Badge>
                      </div>
                      <CardDescription className="text-base">
                        Created by {event.creator_name || "Unknown"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyEventLink}>
                        {copied ? "Copied✅" : <Share2 className="h-4 w-4" />}
                      </Button>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {event.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(event.event_date), "PPP")}</p>
                      </div>
                    </div>

                    {event.location && (
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
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    RSVP Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Responses</span>
                      <span className="font-semibold">{event.rsvp_count?.total || 0}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">✓ Yes</span>
                        <span className="font-medium">{event.rsvp_count?.yes || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">✗ No</span>
                        <span className="font-medium">{event.rsvp_count?.no || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-600">? Maybe</span>
                        <span className="font-medium">{event.rsvp_count?.maybe || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/events/${event.id}/rsvp`}>
                    <Button className="w-full">Manage RSVPs</Button>
                  </Link>
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit Event
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-transparent" onClick={copyEventLink}>
                    {copied ? "Copied✅" : "Copy RSVP Link"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
