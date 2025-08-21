"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddGuestForm } from "@/components/add-guest-form"
import { GuestList } from "@/components/guest-list"
import { ExportButtons } from "@/components/export-buttons"
import { ArrowLeft, Users, Search, Mail, CheckCircle, XCircle, HelpCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { Event, RSVP, Guest } from "@/lib/types"

export default function EventRSVPPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRSVPs] = useState<RSVP[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [stats, setStats] = useState({ yes: 0, no: 0, maybe: 0, total: 0 })
  const [guestStats, setGuestStats] = useState({ yes: 0, no: 0, maybe: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRSVPs, setFilteredRSVPs] = useState<RSVP[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchRSVPs()
      fetchGuests()
    }
  }, [params.id])

  useEffect(() => {
    const filtered = rsvps.filter(
      (rsvp) =>
        rsvp.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.user_email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRSVPs(filtered)
  }, [rsvps, searchTerm])

  const fetchRSVPs = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/rsvp`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setRSVPs(data.rsvps)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching RSVPs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/guests`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests)
        setGuestStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching guests:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "yes":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "no":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "maybe":
        return <HelpCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "yes":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Yes</Badge>
      case "no":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">No</Badge>
      case "maybe":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maybe</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const copyRSVPLink = () => {
    const url = `${window.location.origin}/rsvp/${params.id}`
    const receiptText = `
═══════════════════════════════════════
        EVENT RSVP INVITATION
═══════════════════════════════════════

Event: ${event?.title || "N/A"}
Date: ${event ? format(new Date(event.event_date), "PPP") : "N/A"}
Location: ${event?.location || "N/A"}
Organizer: ${event?.creator_name || "N/A"}

Current RSVPs:
• Attending: ${totalStats.yes}
• Not Attending: ${totalStats.no}
• Maybe: ${totalStats.maybe}
• Total Responses: ${totalStats.total}

───────────────────────────────────────
RSVP LINK:
${url}
───────────────────────────────────────

Share this link with guests to collect
their RSVP responses for your event.

Generated: ${format(new Date(), "PPP 'at' p")}
═══════════════════════════════════════
    `

    navigator.clipboard.writeText(receiptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalStats = {
    yes: stats.yes + guestStats.yes,
    no: stats.no + guestStats.no,
    maybe: stats.maybe + guestStats.maybe,
    total: stats.total + guestStats.total,
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
                <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">RSVP Management</h1>
                <p className="text-muted-foreground">{event.title}</p>
              </div>
              <div className="flex gap-2">
                <ExportButtons eventId={Number.parseInt(params.id as string)} eventTitle={event.title} />
                <Button onClick={copyRSVPLink}>{copied ? "Copied✅" : "Copy RSVP Link"}</Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                    <p className="text-2xl font-bold">{totalStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Attending</p>
                    <p className="text-2xl font-bold text-green-600">{totalStats.yes}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Not Attending</p>
                    <p className="text-2xl font-bold text-red-600">{totalStats.no}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Maybe</p>
                    <p className="text-2xl font-bold text-yellow-600">{totalStats.maybe}</p>
                  </div>
                  <HelpCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="registered" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="registered">Registered Users ({stats.total})</TabsTrigger>
              <TabsTrigger value="guests">Guests ({guestStats.total})</TabsTrigger>
              <TabsTrigger value="add-guest">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Guest
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registered">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Registered User RSVPs</CardTitle>
                      <CardDescription>Users with accounts who have responded</CardDescription>
                    </div>
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredRSVPs.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {rsvps.length === 0 ? "No RSVPs yet" : "No matching RSVPs"}
                      </h3>
                      <p className="text-muted-foreground">
                        {rsvps.length === 0
                          ? "Share your event link to start receiving RSVPs"
                          : "Try adjusting your search terms"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRSVPs.map((rsvp) => {
                        const initials = rsvp.user_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()

                        return (
                          <div key={rsvp.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" alt={rsvp.user_name || "User"} />
                                <AvatarFallback>{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{rsvp.user_name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {rsvp.user_email}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(rsvp.status)}
                                  {getStatusBadge(rsvp.status)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(rsvp.responded_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guests">
              <GuestList guests={guests} onGuestUpdated={fetchGuests} onGuestDeleted={fetchGuests} />
            </TabsContent>

            <TabsContent value="add-guest">
              <AddGuestForm eventId={Number.parseInt(params.id as string)} onGuestAdded={fetchGuests} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
