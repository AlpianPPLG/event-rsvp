"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RSVPChart, ResponseRateChart, MonthlyTrendsChart } from "@/components/analytics-charts"
import { AnalyticsExport } from "@/components/analytics-export"
import { CalendarDays, Users, UserCheck, TrendingUp, BarChart3, PieChart } from "lucide-react"
import type { DashboardStats, EventAnalytics, MonthlyStats } from "@/lib/analytics"

export default function AnalyticsPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [dashboardRes, eventsRes, monthlyRes] = await Promise.all([
        fetch("/api/analytics/dashboard"),
        fetch("/api/analytics/events"),
        fetch("/api/analytics/monthly"),
      ])

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        setDashboardStats(dashboardData.stats)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEventAnalytics(eventsData.analytics)
      }

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthlyStats(monthlyData.stats)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // ... existing code for chart data preparation ...

  const rsvpChartData = eventAnalytics.slice(0, 10).map((event) => ({
    name: event.eventTitle.length > 20 ? event.eventTitle.substring(0, 20) + "..." : event.eventTitle,
    yes: event.yesCount,
    no: event.noCount,
    maybe: event.maybeCount,
  }))

  const responseRateData = eventAnalytics.slice(0, 5).map((event) => ({
    name: event.eventTitle.length > 15 ? event.eventTitle.substring(0, 15) + "..." : event.eventTitle,
    rate: event.responseRate,
  }))

  const monthlyTrendsData = monthlyStats.reverse().map((stat) => ({
    month: new Date(stat.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    events: stat.events,
    rsvps: stat.rsvps,
    guests: stat.guests,
  }))

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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Insights and statistics for your events</p>
            </div>
            <AnalyticsExport dashboardStats={dashboardStats} eventAnalytics={eventAnalytics} />
          </div>

          {/* ... existing code for key metrics ... */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{dashboardStats?.totalEvents || 0}</p>
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
                    <p className="text-2xl font-bold">
                      {(dashboardStats?.totalRSVPs || 0) + (dashboardStats?.totalGuests || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardStats?.totalRSVPs || 0} users, {dashboardStats?.totalGuests || 0} guests
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Attending</p>
                    <p className="text-2xl font-bold">{dashboardStats?.totalAttending || 0}</p>
                    <p className="text-xs text-green-600 mt-1">{dashboardStats?.responseRate || 0}% response rate</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Response Rate</p>
                    <p className="text-2xl font-bold">{dashboardStats?.responseRate || 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Across all events</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ... existing code for charts and tables ... */}
          <div className="space-y-8">
            {rsvpChartData.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                <RSVPChart data={rsvpChartData} />
                {responseRateData.length > 0 && <ResponseRateChart data={responseRateData} />}
              </div>
            )}

            {monthlyTrendsData.length > 0 && <MonthlyTrendsChart data={monthlyTrendsData} />}

            {eventAnalytics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Event Performance
                  </CardTitle>
                  <CardDescription>Detailed breakdown of your events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Event</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-center p-2">Responses</th>
                          <th className="text-center p-2">Attending</th>
                          <th className="text-center p-2">Response Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventAnalytics.map((event) => (
                          <tr key={event.eventId} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{event.eventTitle}</td>
                            <td className="p-2 text-muted-foreground">
                              {new Date(event.eventDate).toLocaleDateString()}
                            </td>
                            <td className="p-2 text-center">{event.totalResponses}</td>
                            <td className="p-2 text-center text-green-600">{event.yesCount}</td>
                            <td className="p-2 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  event.responseRate >= 70
                                    ? "bg-green-100 text-green-800"
                                    : event.responseRate >= 40
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {event.responseRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {eventAnalytics.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
                  <p className="text-muted-foreground text-center">
                    Create some events and gather RSVPs to see your analytics here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
