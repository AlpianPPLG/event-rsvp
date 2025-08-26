"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CalendarDays, MapPin, Users, Plus, Search, Edit, Trash2, Repeat, Clock, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecurringEventsManager } from "@/components/recurring-events-manager"
import Link from "next/link"
import { format } from "date-fns"
import type { Event, RecurringEventSeries } from "@/lib/types"

export default function EventsPage() {
  useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [recurringEvents, setRecurringEvents] = useState<RecurringEventSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState("single")

  useEffect(() => {
    fetchEvents()
    fetchRecurringEvents()
  }, [])

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEvents(filtered)
  }, [events, searchTerm])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecurringEvents = async () => {
    try {
      const response = await fetch("/api/events/recurring")
      if (response.ok) {
        const data = await response.json()
        setRecurringEvents(data.series)
      }
    } catch (error) {
      console.error("Error fetching recurring events:", error)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId))
      }
    } catch (error) {
      console.error("Error deleting event:", error)
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

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Events</h1>
              <p className="text-muted-foreground">Manage and track your events and recurring series</p>
            </div>
            <Link href="/events/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Single Events ({events.length})
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Recurring Series ({recurringEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6">
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {events.length === 0 ? "No events yet" : "No events found"}
                    </h3>
                    <p className="text-muted-foreground text-center mb-6">
                      {events.length === 0
                        ? "Create your first event to start managing RSVPs"
                        : "Try adjusting your search terms"}
                    </p>
                    {events.length === 0 && (
                      <Link href="/events/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Event
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredEvents.map((event) => {
                    const eventStatus = getEventStatus(event.event_date)
                    return (
                      <Card key={event.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-xl">{event.title}</CardTitle>
                                <Badge variant={eventStatus.variant}>{eventStatus.status}</Badge>
                                {event.is_recurring && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Repeat className="h-3 w-3" />
                                    Recurring
                                  </Badge>
                                )}
                                {event.max_capacity && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Cap: {event.max_capacity}
                                  </Badge>
                                )}
                                {event.custom_form_fields && event.custom_form_fields.length > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    📝 Smart Form
                                  </Badge>
                                )}
                              </div>
                              {event.description && (
                                <CardDescription className="text-base">{event.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/events/${event.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarDays className="h-4 w-4" />
                              {format(new Date(event.event_date), "PPP")}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {event.rsvp_count?.total || 0} responses
                              {event.max_capacity && (
                                <span className="text-xs">/ {event.max_capacity} max</span>
                              )}
                            </div>
                            {event.max_capacity && event.rsvp_count && (
                              <div className="flex items-center gap-2 text-sm">
                                {event.rsvp_count.total >= event.max_capacity ? (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <AlertCircle className="h-3 w-3" />
                                    At Capacity
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-green-600">
                                    ✓ {event.max_capacity - event.rsvp_count.total} spots left
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {event.rsvp_count && event.rsvp_count.total > 0 && (
                            <div className="mt-4 flex gap-4 text-sm">
                              <span className="text-green-600">✓ {event.rsvp_count.yes} Yes</span>
                              <span className="text-red-600">✗ {event.rsvp_count.no} No</span>
                              <span className="text-yellow-600">? {event.rsvp_count.maybe} Maybe</span>
                            </div>
                          )}

                          <div className="mt-4 flex gap-2">
                            <Link href={`/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/events/${event.id}/rsvp`}>
                              <Button variant="outline" size="sm">
                                Manage RSVPs
                              </Button>
                            </Link>
                            {event.max_capacity && (
                              <Button variant="outline" size="sm">
                                <Clock className="h-3 w-3 mr-1" />
                                Waitlist
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recurring" className="space-y-6">
              <RecurringEventsManager 
                onSeriesCreated={() => {
                  fetchRecurringEvents()
                  fetchEvents()
                }}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
