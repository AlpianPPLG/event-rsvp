"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Repeat, Users, Edit, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"
import { RecurringEventSeries } from "@/lib/types"
import { toast } from "sonner"

interface RecurringEventsManagerProps {
  onSeriesCreated?: (series: RecurringEventSeries) => void
}

export function RecurringEventsManager({ onSeriesCreated }: RecurringEventsManagerProps) {
  const [series, setSeries] = useState<RecurringEventSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<RecurringEventSeries | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    recurrenceType: "weekly" as "weekly" | "monthly" | "yearly",
    maxCapacity: ""
  })

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/events/recurring")
      if (response.ok) {
        const data = await response.json()
        setSeries(data.series)
      }
    } catch (error) {
      console.error("Error fetching series:", error)
      toast.error("Failed to load recurring events")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSeries = async () => {
    try {
      const response = await fetch("/api/events/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => [data.series, ...prev])
        setCreateDialogOpen(false)
        resetForm()
        toast.success("Recurring event series created successfully!")
        onSeriesCreated?.(data.series)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create series")
      }
    } catch (error) {
      console.error("Error creating series:", error)
      toast.error("Failed to create recurring event series")
    }
  }

  const handleUpdateSeries = async () => {
    if (!selectedSeries) return

    try {
      const response = await fetch("/api/events/recurring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: selectedSeries.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          updateFutureEvents: true
        })
      })

      if (response.ok) {
        await fetchSeries()
        setEditDialogOpen(false)
        setSelectedSeries(null)
        resetForm()
        toast.success("Series updated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update series")
      }
    } catch (error) {
      console.error("Error updating series:", error)
      toast.error("Failed to update series")
    }
  }

  const handleDeleteSeries = async (seriesId: number) => {
    if (!confirm("Are you sure you want to delete this recurring event series?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/events/recurring?seriesId=${seriesId}&deleteFutureEvents=true`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setSeries(prev => prev.filter(s => s.id !== seriesId))
        toast.success("Series deleted successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete series")
      }
    } catch (error) {
      console.error("Error deleting series:", error)
      toast.error("Failed to delete series")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      recurrenceType: "weekly",
      maxCapacity: ""
    })
  }

  const openEditDialog = (series: RecurringEventSeries) => {
    setSelectedSeries(series)
    setFormData({
      title: series.title,
      description: series.description || "",
      location: series.location || "",
      startDate: series.start_date,
      endDate: series.end_date || "",
      recurrenceType: series.recurrence_type,
      maxCapacity: ""
    })
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recurring Events</h2>
          <p className="text-muted-foreground">Manage your recurring event series</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Series
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Recurring Event Series</DialogTitle>
              <DialogDescription>
                Set up a series of recurring events with automatic scheduling
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Weekly Team Meeting"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Regular team sync and updates"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Conference Room A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="recurrenceType">Recurrence</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value: "weekly" | "monthly" | "yearly") => 
                      setFormData(prev => ({ ...prev, recurrenceType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxCapacity">Max Capacity (Optional)</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSeries} disabled={!formData.title || !formData.startDate}>
                Create Series
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {series.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Repeat className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recurring Events</h3>
            <p className="text-muted-foreground text-center">
              Create your first recurring event series to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {series.map((eventSeries) => (
            <Card key={eventSeries.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      {eventSeries.title}
                    </CardTitle>
                    <CardDescription>{eventSeries.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(eventSeries)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSeries(eventSeries.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Recurrence</p>
                    <Badge variant="secondary" className="capitalize">
                      {eventSeries.recurrence_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(eventSeries.start_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Events Created</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {eventSeries.events?.length || 0} events
                    </p>
                  </div>
                </div>
                {eventSeries.location && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Location</p>
                    <p className="text-muted-foreground text-sm">{eventSeries.location}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Recurring Event Series</DialogTitle>
            <DialogDescription>
              Update series information. Changes will apply to future events.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSeries} disabled={!formData.title}>
              Update Series
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}