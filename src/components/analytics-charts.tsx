"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface RSVPChartProps {
  data: Array<{
    name: string
    yes: number
    no: number
    maybe: number
  }>
}

export function RSVPChart({ data }: RSVPChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP Responses by Event</CardTitle>
        <CardDescription>Response breakdown for your recent events</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="yes" stackId="a" fill="#22c55e" name="Yes" />
            <Bar dataKey="maybe" stackId="a" fill="#eab308" name="Maybe" />
            <Bar dataKey="no" stackId="a" fill="#ef4444" name="No" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ResponseRateChartProps {
  data: Array<{
    name: string
    rate: number
  }>
}

export function ResponseRateChart({ data }: ResponseRateChartProps) {
  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#8b5cf6"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rates</CardTitle>
        <CardDescription>Attendance rates across your events</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="rate"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface MonthlyTrendsChartProps {
  data: Array<{
    month: string
    events: number
    rsvps: number
    guests: number
  }>
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
        <CardDescription>Events and responses over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="events" fill="#3b82f6" name="Events" />
            <Bar dataKey="rsvps" fill="#22c55e" name="RSVPs" />
            <Bar dataKey="guests" fill="#eab308" name="Guests" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
