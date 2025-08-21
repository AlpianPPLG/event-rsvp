import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import type { Event, RSVP, Guest } from "./types"

export interface ExportData {
  event: Event
  rsvps: RSVP[]
  guests: Guest[]
}

export function exportToCSV(data: ExportData): void {
  const { event, rsvps, guests } = data

  // Combine RSVPs and guests into a single dataset
  const combinedData = [
    ...rsvps.map((rsvp) => ({
      Name: rsvp.user_name || "",
      Email: rsvp.user_email || "",
      Status: rsvp.status,
      Type: "Registered User",
      "Response Date": new Date(rsvp.responded_at).toLocaleDateString(),
    })),
    ...guests.map((guest) => ({
      Name: guest.name,
      Email: guest.email || "",
      Status: guest.status,
      Type: "Guest",
      "Response Date": new Date(guest.responded_at).toLocaleDateString(),
    })),
  ]

  // Create CSV content
  const headers = ["Name", "Email", "Status", "Type", "Response Date"]
  const csvContent = [
    headers.join(","),
    ...combinedData.map((row) => headers.map((header) => `"${row[header as keyof typeof row] || ""}"`).join(",")),
  ].join("\n")

  // Download CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, "_")}_attendees.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToExcel(data: ExportData): void {
  const { event, rsvps, guests } = data

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Event Info Sheet
  const eventInfo = [
    ["Event Information"],
    ["Title", event.title],
    ["Description", event.description || ""],
    ["Date", new Date(event.event_date).toLocaleDateString()],
    ["Location", event.location || ""],
    ["Created By", event.creator_name || ""],
    [""],
    ["Statistics"],
    ["Total RSVPs", rsvps.length],
    ["Total Guests", guests.length],
    ["Total Responses", rsvps.length + guests.length],
    [
      "Attending (Yes)",
      rsvps.filter((r) => r.status === "yes").length + guests.filter((g) => g.status === "yes").length,
    ],
    [
      "Not Attending (No)",
      rsvps.filter((r) => r.status === "no").length + guests.filter((g) => g.status === "no").length,
    ],
    ["Maybe", rsvps.filter((r) => r.status === "maybe").length + guests.filter((g) => g.status === "maybe").length],
  ]

  const eventWs = XLSX.utils.aoa_to_sheet(eventInfo)
  XLSX.utils.book_append_sheet(wb, eventWs, "Event Info")

  // RSVPs Sheet
  if (rsvps.length > 0) {
    const rsvpData = rsvps.map((rsvp) => ({
      Name: rsvp.user_name || "",
      Email: rsvp.user_email || "",
      Status: rsvp.status,
      "Response Date": new Date(rsvp.responded_at).toLocaleDateString(),
    }))

    const rsvpWs = XLSX.utils.json_to_sheet(rsvpData)
    XLSX.utils.book_append_sheet(wb, rsvpWs, "Registered Users")
  }

  // Guests Sheet
  if (guests.length > 0) {
    const guestData = guests.map((guest) => ({
      Name: guest.name,
      Email: guest.email || "",
      Status: guest.status,
      "Response Date": new Date(guest.responded_at).toLocaleDateString(),
    }))

    const guestWs = XLSX.utils.json_to_sheet(guestData)
    XLSX.utils.book_append_sheet(wb, guestWs, "Guests")
  }

  // Combined Attendees Sheet
  const combinedData = [
    ...rsvps.map((rsvp) => ({
      Name: rsvp.user_name || "",
      Email: rsvp.user_email || "",
      Status: rsvp.status,
      Type: "Registered User",
      "Response Date": new Date(rsvp.responded_at).toLocaleDateString(),
    })),
    ...guests.map((guest) => ({
      Name: guest.name,
      Email: guest.email || "",
      Status: guest.status,
      Type: "Guest",
      "Response Date": new Date(guest.responded_at).toLocaleDateString(),
    })),
  ]

  if (combinedData.length > 0) {
    const combinedWs = XLSX.utils.json_to_sheet(combinedData)
    XLSX.utils.book_append_sheet(wb, combinedWs, "All Attendees")
  }

  // Download Excel file
  XLSX.writeFile(wb, `${event.title.replace(/[^a-z0-9]/gi, "_")}_report.xlsx`)
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const { event, rsvps, guests } = data

  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20

  // Title
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("Event RSVP Report", margin, 30)

  // Event Information
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("Event Information", margin, 50)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  let yPos = 65
  const lineHeight = 8

  const eventDetails = [
    `Title: ${event.title}`,
    `Description: ${event.description || "N/A"}`,
    `Date: ${new Date(event.event_date).toLocaleDateString()}`,
    `Location: ${event.location || "N/A"}`,
    `Organizer: ${event.creator_name || "N/A"}`,
  ]

  eventDetails.forEach((detail) => {
    pdf.text(detail, margin, yPos)
    yPos += lineHeight
  })

  // Statistics
  yPos += 10
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("Statistics", margin, yPos)

  yPos += 15
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")

  const stats = [
    `Total Registered Users: ${rsvps.length}`,
    `Total Guests: ${guests.length}`,
    `Total Responses: ${rsvps.length + guests.length}`,
    `Attending (Yes): ${rsvps.filter((r) => r.status === "yes").length + guests.filter((g) => g.status === "yes").length}`,
    `Not Attending (No): ${rsvps.filter((r) => r.status === "no").length + guests.filter((g) => g.status === "no").length}`,
    `Maybe: ${rsvps.filter((r) => r.status === "maybe").length + guests.filter((g) => g.status === "maybe").length}`,
  ]

  stats.forEach((stat) => {
    pdf.text(stat, margin, yPos)
    yPos += lineHeight
  })

  // Attendee List
  if (rsvps.length > 0 || guests.length > 0) {
    yPos += 15
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("Attendee List", margin, yPos)

    yPos += 15
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")

    // Table headers
    const headers = ["Name", "Email", "Status", "Type"]
    const colWidths = [40, 60, 25, 35]
    let xPos = margin

    headers.forEach((header, index) => {
      pdf.text(header, xPos, yPos)
      xPos += colWidths[index]
    })

    yPos += 8
    pdf.setFont("helvetica", "normal")

    // Combined attendee data
    const allAttendees = [
      ...rsvps.map((rsvp) => ({
        name: rsvp.user_name || "",
        email: rsvp.user_email || "",
        status: rsvp.status,
        type: "User",
      })),
      ...guests.map((guest) => ({
        name: guest.name,
        email: guest.email || "",
        status: guest.status,
        type: "Guest",
      })),
    ]

    allAttendees.forEach((attendee) => {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 30
      }

      xPos = margin
      const rowData = [attendee.name, attendee.email, attendee.status, attendee.type]

      rowData.forEach((data, index) => {
        const text = data.length > 20 ? data.substring(0, 17) + "..." : data
        pdf.text(text, xPos, yPos)
        xPos += colWidths[index]
      })

      yPos += 6
    })
  }

  // Download PDF
  pdf.save(`${event.title.replace(/[^a-z0-9]/gi, "_")}_report.pdf`)
}

export function exportAttendingOnly(data: ExportData, format: "csv" | "excel"): void {
  const { event, rsvps, guests } = data

  // Filter only attending attendees
  const attendingRSVPs = rsvps.filter((rsvp) => rsvp.status === "yes")
  const attendingGuests = guests.filter((guest) => guest.status === "yes")

  const filteredData = {
    event,
    rsvps: attendingRSVPs,
    guests: attendingGuests,
  }

  if (format === "csv") {
    exportToCSV(filteredData)
  } else {
    exportToExcel(filteredData)
  }
}
