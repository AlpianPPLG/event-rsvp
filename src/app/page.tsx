"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, UserCheck, BarChart3, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { DashboardStats } from "@/lib/analytics"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Event RSVP Manager</h1>
            <p className="text-xl text-muted-foreground mb-8">Professional event management and RSVP tracking system</p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create and manage events with detailed information, dates, and locations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>RSVP Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track attendee responses with yes, no, and maybe options for better planning.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Guest Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage both registered users and guest attendees in one unified system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate detailed reports and export data for comprehensive event analysis.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Here's an overview of your events and RSVPs
            </p>
          </div>
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      dashboardStats?.totalEvents || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{dashboardStats?.upcomingEvents || 0} upcoming</p>
                </div>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      (dashboardStats?.totalRSVPs || 0) + (dashboardStats?.totalGuests || 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardStats?.totalRSVPs || 0} users, {dashboardStats?.totalGuests || 0} guests
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed Attending</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      dashboardStats?.totalAttending || 0
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-1">{dashboardStats?.responseRate || 0}% response rate</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      `${dashboardStats?.responseRate || 0}%`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all events</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                My Events
              </CardTitle>
              <CardDescription>View and manage your created events</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/events">
                <Button className="w-full">View Events</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                RSVP Responses
              </CardTitle>
              <CardDescription>Track attendee responses and confirmations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/events">
                <Button className="w-full">Manage RSVPs</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>View detailed reports and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
