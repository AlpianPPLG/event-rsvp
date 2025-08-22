"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Users } from "lucide-react"
import { exportToCSV, exportToExcel, exportToPDF, exportAttendingOnly } from "@/lib/export"
import type { ExportData } from "@/lib/export"

interface ExportButtonsProps {
  eventId: number
  eventTitle?: string
}

export function ExportButtons({ eventId }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const fetchExportData = async (): Promise<ExportData | null> => {
    try {
      const response = await fetch(`/api/export/${eventId}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error("Error fetching export data:", error)
      return null
    }
  }

  const handleExport = async (format: "csv" | "excel" | "pdf", attendingOnly = false) => {
    setIsExporting(true)

    try {
      const data = await fetchExportData()
      if (!data) {
        alert("Failed to fetch export data")
        return
      }

      if (attendingOnly) {
        exportAttendingOnly(data, format as "csv" | "excel")
      } else {
        switch (format) {
          case "csv":
            exportToCSV(data)
            break
          case "excel":
            exportToExcel(data)
            break
          case "pdf":
            await exportToPDF(data)
            break
        }
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export All Attendees</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF Report
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Export Attending Only</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("csv", true)}>
          <Users className="h-4 w-4 mr-2" />
          Attending List (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel", true)}>
          <Users className="h-4 w-4 mr-2" />
          Attending List (Excel)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
