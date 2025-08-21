"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import type { DashboardStats, EventAnalytics } from "@/lib/analytics"

interface AnalyticsExportProps {
  dashboardStats: DashboardStats | null
  eventAnalytics: EventAnalytics[]
}

export function AnalyticsExport({ dashboardStats, eventAnalytics }: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportAnalyticsToExcel = () => {
    setIsExporting(true)

    try {
      const wb = XLSX.utils.book_new()

      // Dashboard Stats Sheet
      if (dashboardStats) {
        const dashboardData = [
          ["Dashboard Statistics"],
          ["Metric", "Value"],
          ["Total Events", dashboardStats.totalEvents],
          ["Total RSVPs", dashboardStats.totalRSVPs],
          ["Total Guests", dashboardStats.totalGuests],
          ["Total Attending", dashboardStats.totalAttending],
          ["Upcoming Events", dashboardStats.upcomingEvents],
          ["Past Events", dashboardStats.pastEvents],
          ["Response Rate (%)", dashboardStats.responseRate],
        ]

        const dashboardWs = XLSX.utils.aoa_to_sheet(dashboardData)
        XLSX.utils.book_append_sheet(wb, dashboardWs, "Dashboard Stats")
      }

      // Event Analytics Sheet
      if (eventAnalytics.length > 0) {
        const analyticsData = eventAnalytics.map((event) => ({
          "Event Title": event.eventTitle,
          "Event Date": new Date(event.eventDate).toLocaleDateString(),
          "Total Responses": event.totalResponses,
          "Yes Count": event.yesCount,
          "No Count": event.noCount,
          "Maybe Count": event.maybeCount,
          "Guest Count": event.guestCount,
          "Response Rate (%)": event.responseRate,
        }))

        const analyticsWs = XLSX.utils.json_to_sheet(analyticsData)
        XLSX.utils.book_append_sheet(wb, analyticsWs, "Event Analytics")
      }

      XLSX.writeFile(wb, `analytics_report_${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export analytics")
    } finally {
      setIsExporting(false)
    }
  }

  const exportAnalyticsToPDF = async () => {
    setIsExporting(true)

    try {
      const pdf = new jsPDF()
      const margin = 20
      let yPos = 30

      // Title
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text("Analytics Report", margin, yPos)

      yPos += 20

      // Dashboard Stats
      if (dashboardStats) {
        pdf.setFontSize(16)
        pdf.setFont("helvetica", "bold")
        pdf.text("Dashboard Statistics", margin, yPos)

        yPos += 15
        pdf.setFontSize(12)
        pdf.setFont("helvetica", "normal")

        const stats = [
          `Total Events: ${dashboardStats.totalEvents}`,
          `Total RSVPs: ${dashboardStats.totalRSVPs}`,
          `Total Guests: ${dashboardStats.totalGuests}`,
          `Total Attending: ${dashboardStats.totalAttending}`,
          `Upcoming Events: ${dashboardStats.upcomingEvents}`,
          `Past Events: ${dashboardStats.pastEvents}`,
          `Response Rate: ${dashboardStats.responseRate}%`,
        ]

        stats.forEach((stat) => {
          pdf.text(stat, margin, yPos)
          yPos += 8
        })
      }

      // Event Analytics
      if (eventAnalytics.length > 0) {
        yPos += 15
        pdf.setFontSize(16)
        pdf.setFont("helvetica", "bold")
        pdf.text("Event Performance", margin, yPos)

        yPos += 15
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "bold")

        // Table headers
        const headers = ["Event", "Date", "Responses", "Attending", "Rate"]
        const colWidths = [50, 30, 25, 25, 20]
        let xPos = margin

        headers.forEach((header, index) => {
          pdf.text(header, xPos, yPos)
          xPos += colWidths[index]
        })

        yPos += 8
        pdf.setFont("helvetica", "normal")

        eventAnalytics.forEach((event) => {
          if (yPos > 270) {
            pdf.addPage()
            yPos = 30
          }

          xPos = margin
          const rowData = [
            event.eventTitle.length > 20 ? event.eventTitle.substring(0, 17) + "..." : event.eventTitle,
            new Date(event.eventDate).toLocaleDateString(),
            event.totalResponses.toString(),
            event.yesCount.toString(),
            `${event.responseRate}%`,
          ]

          rowData.forEach((data, index) => {
            pdf.text(data, xPos, yPos)
            xPos += colWidths[index]
          })

          yPos += 6
        })
      }

      pdf.save(`analytics_report_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export analytics")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Report"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Analytics</DropdownMenuLabel>
        <DropdownMenuItem onClick={exportAnalyticsToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAnalyticsToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
