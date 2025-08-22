"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Edit, Trash2, Mail, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import type { Guest } from "@/lib/types"

interface GuestListProps {
  guests: Guest[]
  onGuestUpdated?: () => void
  onGuestDeleted?: () => void
}

export function GuestList({ guests, onGuestUpdated, onGuestDeleted }: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", status: "yes" as "yes" | "no" | "maybe" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest)
    setEditForm({
      name: guest.name,
      email: guest.email || "",
      status: guest.status,
    })
    setMessage("")
    setError("")
  }

  const handleUpdateGuest = async () => {
    if (!editingGuest) return

    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch(`/api/guests/${editingGuest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Guest updated successfully!")
        setEditingGuest(null)
        onGuestUpdated?.()
      } else {
        setError(data.error || "Failed to update guest")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("An error occurred while updating the guest")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGuest = async (guestId: number) => {
    if (!confirm("Are you sure you want to remove this guest?")) return

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onGuestDeleted?.()
      }
    } catch (error) {
      console.error("Error deleting guest:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Guest List</CardTitle>
            <CardDescription>Manage guests who dont have accounts</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {guests.length === 0 ? "No guests added yet" : "No matching guests found"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGuests.map((guest) => {
              const initials = guest.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()

              return (
                <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      {guest.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(guest.status)}
                        {getStatusBadge(guest.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(guest.responded_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditGuest(guest)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Guest</DialogTitle>
                            <DialogDescription>Update guest information and RSVP status</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {message && (
                              <Alert>
                                <AlertDescription>{message}</AlertDescription>
                              </Alert>
                            )}

                            {error && (
                              <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Full Name</Label>
                              <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email Address</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-status">RSVP Status</Label>
                              <Select
                                value={editForm.status}
                                onValueChange={(value) =>
                                  setEditForm((prev) => ({ ...prev, status: value as "yes" | "no" | "maybe" }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes - Attending</SelectItem>
                                  <SelectItem value="no">No - Not Attending</SelectItem>
                                  <SelectItem value="maybe">Maybe - Unsure</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleUpdateGuest} disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Updating..." : "Update Guest"}
                              </Button>
                              <Button variant="outline" onClick={() => setEditingGuest(null)} disabled={isSubmitting}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteGuest(guest.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
