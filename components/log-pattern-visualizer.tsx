"use client"

import { useEffect, useRef } from "react"

export default function LogPatternVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Sample log data for visualization
    const logData = [
      { time: "10:27:10", ip: "192.168.1.20", url: "/admin/login.php", method: "GET", status: 200, type: "normal" },
      { time: "10:27:15", ip: "192.168.1.20", url: "/admin/login.php", method: "POST", status: 302, type: "normal" },
      { time: "10:27:16", ip: "192.168.1.20", url: "/admin/dashboard.php", method: "GET", status: 200, type: "normal" },
      { time: "10:30:12", ip: "192.168.1.35", url: "/admin/login.php", method: "GET", status: 200, type: "normal" },
      { time: "10:30:20", ip: "192.168.1.35", url: "/admin/login.php", method: "POST", status: 401, type: "warning" },
      { time: "10:30:25", ip: "192.168.1.35", url: "/admin/login.php", method: "POST", status: 401, type: "warning" },
      { time: "10:30:30", ip: "192.168.1.35", url: "/admin/login.php", method: "POST", status: 401, type: "warning" },
      { time: "10:30:35", ip: "192.168.1.35", url: "/admin/login.php", method: "POST", status: 401, type: "warning" },
      { time: "10:30:40", ip: "192.168.1.35", url: "/admin/login.php", method: "POST", status: 401, type: "warning" },
      { time: "10:35:22", ip: "203.0.113.42", url: "/admin/login.php", method: "GET", status: 200, type: "normal" },
      { time: "10:35:27", ip: "203.0.113.42", url: "/admin/login.php", method: "POST", status: 401, type: "warning" },
      { time: "10:35:28", ip: "203.0.113.42", url: "/admin/login.php", method: "GET", status: 200, type: "critical" },
      { time: "10:35:35", ip: "203.0.113.42", url: "/admin/login.php", method: "POST", status: 302, type: "critical" },
      {
        time: "10:35:36",
        ip: "203.0.113.42",
        url: "/admin/dashboard.php",
        method: "GET",
        status: 200,
        type: "critical",
      },
      { time: "10:35:40", ip: "203.0.113.42", url: "/admin/users.php", method: "GET", status: 200, type: "critical" },
      {
        time: "10:35:45",
        ip: "203.0.113.42",
        url: "/admin/settings.php",
        method: "GET",
        status: 200,
        type: "critical",
      },
    ]

    // Parse time strings to minutes since start
    const startTime = parseTimeToMinutes("10:27:10")
    const timeData = logData.map((entry) => ({
      ...entry,
      timeValue: parseTimeToMinutes(entry.time) - startTime,
    }))

    function parseTimeToMinutes(timeStr: string): number {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number)
      return hours * 60 + minutes + seconds / 60
    }

    // Define visualization parameters
    const padding = { top: 40, right: 30, bottom: 40, left: 60 }
    const graphWidth = rect.width - padding.left - padding.right
    const graphHeight = rect.height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw title
    ctx.font = "16px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#e4e4e7"
    ctx.fillText("Log Activity Timeline", rect.width / 2, 20)

    // Draw axes
    ctx.strokeStyle = "#3f3f46"
    ctx.lineWidth = 1

    // X-axis (time)
    ctx.beginPath()
    ctx.moveTo(padding.left, rect.height - padding.bottom)
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom)
    ctx.stroke()

    // Y-axis (events)
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.stroke()

    // Calculate time range
    const maxTime = Math.max(...timeData.map((d) => d.timeValue))

    // Draw time labels on x-axis
    const timeLabels = ["10:27", "10:30", "10:33", "10:36"]
    timeLabels.forEach((label, i) => {
      const x = padding.left + (graphWidth / (timeLabels.length - 1)) * i
      ctx.beginPath()
      ctx.moveTo(x, rect.height - padding.bottom)
      ctx.lineTo(x, rect.height - padding.bottom + 5)
      ctx.stroke()

      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#a1a1aa"
      ctx.fillText(label, x, rect.height - padding.bottom + 20)
    })

    // Draw IP address labels on y-axis
    const uniqueIps = Array.from(new Set(timeData.map((d) => d.ip)))
    uniqueIps.forEach((ip, i) => {
      const y = padding.top + (graphHeight / (uniqueIps.length + 1)) * (i + 1)

      ctx.beginPath()
      ctx.moveTo(padding.left - 5, y)
      ctx.lineTo(padding.left, y)
      ctx.stroke()

      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillStyle = "#a1a1aa"
      ctx.fillText(ip as string, padding.left - 10, y + 4)
    })

    // Draw axis labels
    ctx.font = "12px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#a1a1aa"
    ctx.fillText("Time", rect.width / 2, rect.height - 10)

    ctx.save()
    ctx.translate(20, rect.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("IP Address", 0, 0)
    ctx.restore()

    // Draw events
    timeData.forEach((entry) => {
      const ipIndex = uniqueIps.indexOf(entry.ip)
      const y = padding.top + (graphHeight / (uniqueIps.length + 1)) * (ipIndex + 1)
      const x = padding.left + (entry.timeValue / maxTime) * graphWidth

      // Event circle
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)

      if (entry.type === "critical") {
        ctx.fillStyle = "#ef4444" // Red
      } else if (entry.type === "warning") {
        ctx.fillStyle = "#f59e0b" // Yellow
      } else {
        ctx.fillStyle = "#10b981" // Green
      }

      ctx.fill()

      // Connect events from same IP
      const prevEntry = timeData.find(
        (e) =>
          e.ip === entry.ip &&
          parseTimeToMinutes(e.time) < parseTimeToMinutes(entry.time) &&
          Math.abs(parseTimeToMinutes(e.time) - parseTimeToMinutes(entry.time)) < 0.2,
      )

      if (prevEntry) {
        const prevX = padding.left + (prevEntry.timeValue / maxTime) * graphWidth

        ctx.beginPath()
        ctx.moveTo(prevX, y)
        ctx.lineTo(x, y)

        if (entry.type === "critical" || prevEntry.type === "critical") {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)" // Red
        } else if (entry.type === "warning" || prevEntry.type === "warning") {
          ctx.strokeStyle = "rgba(245, 158, 11, 0.5)" // Yellow
        } else {
          ctx.strokeStyle = "rgba(16, 185, 129, 0.5)" // Green
        }

        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Add tooltip on hover (simplified for this example)
      // In a real implementation, you would add event listeners for mouse movement
    })

    // Draw legend
    const legendItems = [
      { label: "Normal Activity", color: "#10b981" },
      { label: "Suspicious Activity", color: "#f59e0b" },
      { label: "Malicious Activity", color: "#ef4444" },
    ]

    const legendX = rect.width - padding.right - 180
    const legendY = padding.top

    legendItems.forEach((item, i) => {
      const y = legendY + i * 25

      // Color box
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, y, 15, 15)

      // Label
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.fillStyle = "#e4e4e7"
      ctx.fillText(item.label, legendX + 25, y + 12)
    })

    // Highlight attack pattern
    ctx.beginPath()
    ctx.rect(
      padding.left + ((parseTimeToMinutes("10:35:22") - startTime) / maxTime) * graphWidth - 10,
      padding.top,
      ((parseTimeToMinutes("10:35:45") - parseTimeToMinutes("10:35:22")) / maxTime) * graphWidth + 20,
      graphHeight,
    )
    ctx.strokeStyle = "rgba(239, 68, 68, 0.3)"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = "12px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#ef4444"
    ctx.fillText(
      "Attack Pattern",
      padding.left + ((parseTimeToMinutes("10:35:35") - startTime) / maxTime) * graphWidth,
      padding.top - 10,
    )
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
