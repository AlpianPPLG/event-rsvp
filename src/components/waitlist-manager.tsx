/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail,
  UserCheck
} from "lucide-react"
import { EventWaitlist } from "@/lib/types"
import { toast } from "sonner"
import { format } from "date-fns"

interface WaitlistManagerProps {
  eventId: number
  showAddButton?: boolean
  onCapacityChange?: (capacity: any) => void
}

interface EventCapacity {
  currentAttendees: number
  maxCapacity: number | null
  isAtCapacity: boolean
  availableSpots: number
  waitlistCount: number
}

export function WaitlistManager({ eventId, onCapacityChange }: WaitlistManagerProps) {
  const [capacity, setCapacity] = useState<EventCapacity | null>(null)
  const [waitlist, setWaitlist] = useState<EventWaitlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCapacityAndWaitlist()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const fetchCapacityAndWaitlist = async () => {
    try {
      const [capacityRes, waitlistRes] = await Promise.all([
        fetch(`/api/events/waitlist?eventId=${eventId}&action=capacity`),
        fetch(`/api/events/waitlist?eventId=${eventId}&action=waitlist`)
      ])

      if (capacityRes.ok) {
        const capacityData = await capacityRes.json()
        setCapacity(capacityData.capacity)
        onCapacityChange?.(capacityData.capacity)
      }

      if (waitlistRes.ok) {
        const waitlistData = await waitlistRes.json()
        setWaitlist(waitlistData.waitlist)
      }
    } catch (error) {
      console.error("Error fetching waitlist data:", error)
      toast.error("Failed to load waitlist information")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWaitlist = async (waitlistId: number) => {
    try {
      const response = await fetch(`/api/events/waitlist?waitlistId=${waitlistId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchCapacityAndWaitlist()
        toast.success("Removed from waitlist successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to remove from waitlist")
      }
    } catch (error) {
      console.error("Error removing from waitlist:", error)
      toast.error("Failed to remove from waitlist")
    }
  }

  const handleConvertToRSVP = async (waitlistId: number, status: 'yes' | 'no' | 'maybe' = 'yes') => {
    try {
      const response = await fetch("/api/events/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          action: "convert",
          waitlistId,
          responseStatus: status
        })
      })

      if (response.ok) {
        await fetchCapacityAndWaitlist()
        toast.success("Successfully converted waitlist entry to RSVP")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to convert to RSVP")
      }
    } catch (error) {
      console.error("Error converting to RSVP:", error)
      toast.error("Failed to convert to RSVP")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'notified':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'converted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'notified':
        return 'bg-blue-100 text-blue-800'
      case 'converted':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!capacity) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load capacity information
        </AlertDescription>
      </Alert>
    )
  }

  const capacityPercentage = capacity.maxCapacity 
    ? (capacity.currentAttendees / capacity.maxCapacity) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Capacity
          </CardTitle>
          <CardDescription>
            Current attendance and capacity management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {capacity.maxCapacity ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {capacity.currentAttendees} / {capacity.maxCapacity} attendees
                </span>
                <span className="text-sm text-muted-foreground">
                  {capacity.availableSpots} spots available
                </span>
              </div>
              <Progress value={capacityPercentage} className="h-2" />
              
              {capacity.isAtCapacity && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    This event has reached its maximum capacity. New registrations will be added to the waitlist.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No capacity limit set - unlimited attendees allowed
              </p>
              <p className="text-lg font-semibold mt-1">
                {capacity.currentAttendees} attendees
              </p>
            </div>
          )}

          {capacity.waitlistCount > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {capacity.waitlistCount} people on waitlist
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waitlist Management */}
      {waitlist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Waitlist Management
            </CardTitle>
            <CardDescription>
              Manage people waiting for spots to become available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        #{entry.position}
                      </Badge>
                      {getStatusIcon(entry.status)}
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        {entry.guest_name}
                      </p>
                      {entry.guest_email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {entry.guest_email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined {format(new Date(entry.joined_at), "PPp")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                    
                    {entry.status === 'waiting' && capacity.availableSpots > 0 && (
                      <Button
                        size="sm"
                        onClick={() => handleConvertToRSVP(entry.id)}
                        className="gap-1"
                      >
                        <UserCheck className="h-3 w-3" />
                        Convert to RSVP
                      </Button>
                    )}
                    
                    {entry.status === 'notified' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvertToRSVP(entry.id, 'yes')}
                          className="gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromWaitlist(entry.id)}
                          className="gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    {(entry.status === 'waiting' || entry.status === 'expired') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromWaitlist(entry.id)}
                        className="gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {waitlist.length === 0 && capacity.maxCapacity && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Waitlist</h3>
            <p className="text-muted-foreground text-center">
              {capacity.isAtCapacity 
                ? "The event is at capacity, but no one is on the waitlist yet."
                : "There are still spots available for this event."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WaitlistManager