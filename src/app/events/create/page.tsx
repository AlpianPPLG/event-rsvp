"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  FileText,
  Save,
  Repeat,
  Users,
  FormInput,
} from "lucide-react";
import Link from "next/link";
import { SmartFormBuilder } from "@/components/smart-form-builder";
import { CustomFormField } from "@/lib/types";

export default function CreateEventPage() {
  const [eventType, setEventType] = useState<"single" | "recurring">("single");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    // Capacity Management
    maxCapacity: "",
    enableWaitlist: false,
    // Recurring Events
    recurrenceType: "weekly" as "weekly" | "monthly" | "yearly",
    recurrenceEndDate: "",
  });
  const [customFormFields, setCustomFormFields] = useState<CustomFormField[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let response;

      if (eventType === "recurring") {
        // Create recurring event series
        response = await fetch("/api/events/recurring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            location: formData.location,
            startDate: formData.eventDate,
            endDate: formData.recurrenceEndDate || null,
            recurrenceType: formData.recurrenceType,
            maxCapacity: formData.maxCapacity
              ? parseInt(formData.maxCapacity)
              : undefined,
            customFormFields:
              customFormFields.length > 0 ? customFormFields : undefined,
          }),
        });
      } else {
        // Create single event
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            maxCapacity: formData.maxCapacity
              ? parseInt(formData.maxCapacity)
              : undefined,
            customFormFields:
              customFormFields.length > 0 ? customFormFields : undefined,
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        router.push("/events");
      } else {
        setError(data.error || "Failed to create event");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("An error occurred while creating the event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

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
            <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
            <p className="text-muted-foreground">
              Fill in the details to create your event
            </p>
          </div>

          <div className="max-w-4xl">
            <Tabs
              value={eventType}
              onValueChange={(value) =>
                setEventType(value as "single" | "recurring")
              }
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Single Event
                </TabsTrigger>
                <TabsTrigger
                  value="recurring"
                  className="flex items-center gap-2"
                >
                  <Repeat className="h-4 w-4" />
                  Recurring Series
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="single" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Event Details
                      </CardTitle>
                      <CardDescription>
                        Provide information about your event
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter event title"
                          value={formData.title}
                          onChange={(e) =>
                            handleInputChange("title", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="description"
                            placeholder="Describe your event (optional)"
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            className="pl-10 min-h-[100px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">Event Date *</Label>
                          <Input
                            id="eventDate"
                            type="datetime-local"
                            value={formData.eventDate}
                            onChange={(e) =>
                              handleInputChange("eventDate", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              placeholder="Event location (optional)"
                              value={formData.location}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recurring" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Repeat className="h-5 w-5" />
                        Recurring Event Series
                      </CardTitle>
                      <CardDescription>
                        Create a series of recurring events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Series Title *</Label>
                        <Input
                          id="title"
                          placeholder="Weekly Team Meeting"
                          value={formData.title}
                          onChange={(e) =>
                            handleInputChange("title", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="description"
                            placeholder="Describe your recurring event series"
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            className="pl-10 min-h-[100px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="datetime-local"
                            value={formData.eventDate}
                            onChange={(e) =>
                              handleInputChange("eventDate", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recurrenceType">Recurrence *</Label>
                          <Select
                            value={formData.recurrenceType}
                            onValueChange={(
                              value: "weekly" | "monthly" | "yearly"
                            ) => handleInputChange("recurrenceType", value)}
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

                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date (Optional)</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.recurrenceEndDate}
                            onChange={(e) =>
                              handleInputChange(
                                "recurrenceEndDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            placeholder="Event location (optional)"
                            value={formData.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Capacity Management - Common for both types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Capacity Management
                    </CardTitle>
                    <CardDescription>
                      Set attendance limits and enable waitlist functionality
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                        <Input
                          id="maxCapacity"
                          type="number"
                          placeholder="Leave empty for unlimited"
                          value={formData.maxCapacity}
                          onChange={(e) =>
                            handleInputChange("maxCapacity", e.target.value)
                          }
                          min="1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum number of attendees allowed
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableWaitlist"
                            checked={formData.enableWaitlist}
                            onCheckedChange={(checked: boolean) =>
                              handleInputChange(
                                "enableWaitlist",
                                checked ? "true" : "false"
                              )
                            }
                          />
                          <Label
                            htmlFor="enableWaitlist"
                            className="text-sm font-medium"
                          >
                            Enable Waitlist
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Allow people to join a waitlist when the event reaches
                          capacity
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Forms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FormInput className="h-5 w-5" />
                      Custom RSVP Form
                    </CardTitle>
                    <CardDescription>
                      Create custom questions and conditional logic for your
                      RSVP form
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SmartFormBuilder
                      initialFields={customFormFields}
                      onFieldsChange={setCustomFormFields}
                    />
                  </CardContent>
                </Card>

                <Separator />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating{" "}
                        {eventType === "recurring" ? "Series" : "Event"}...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create{" "}
                        {eventType === "recurring" ? "Event Series" : "Event"}
                      </>
                    )}
                  </Button>
                  <Link href="/events">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
