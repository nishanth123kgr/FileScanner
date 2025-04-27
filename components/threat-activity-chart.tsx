"use client"

import { useEffect, useRef } from "react"

export default function ThreatActivityChart() {
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

    // Chart data - simulating threat activity over time
    const data = [12, 19, 8, 15, 25, 14, 23, 38, 45, 35, 25, 18, 22, 16, 28, 32, 40, 25, 18, 22, 30, 35]

    const labels = [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
    ]

    // Chart dimensions
    const chartWidth = rect.width
    const chartHeight = rect.height
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const graphWidth = chartWidth - padding.left - padding.right
    const graphHeight = chartHeight - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, chartWidth, chartHeight)

    // Draw background grid
    ctx.strokeStyle = "rgba(75, 85, 99, 0.1)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    const maxValue = Math.max(...data) * 1.2
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (graphHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(chartWidth - padding.right, y)
      ctx.stroke()

      // Y-axis labels
      const value = Math.round(maxValue - (maxValue / gridLines) * i)
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toString(), padding.left - 8, y + 4)
    }

    // Draw gradient area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, chartHeight - padding.bottom)
    gradient.addColorStop(0, "rgba(239, 68, 68, 0.5)")
    gradient.addColorStop(1, "rgba(239, 68, 68, 0.0)")

    // Calculate points
    const points = data.map((value, index) => {
      const x = padding.left + (graphWidth / (data.length - 1)) * index
      const y = padding.top + graphHeight - (value / maxValue) * graphHeight
      return { x, y }
    })

    // Draw area
    ctx.beginPath()
    ctx.moveTo(points[0].x, chartHeight - padding.bottom)
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.lineTo(points[points.length - 1].x, chartHeight - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((point, index) => {
      if (index > 0) {
        const xc = (points[index - 1].x + point.x) / 2
        const yc = (points[index - 1].y + point.y) / 2
        ctx.quadraticCurveTo(points[index - 1].x, points[index - 1].y, xc, yc)
      }
      if (index === points.length - 1) {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.strokeStyle = "rgba(239, 68, 68, 1)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw points
    points.forEach((point, index) => {
      if (index % 3 === 0) {
        // Draw fewer points for cleaner look
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#ef4444"
        ctx.fill()
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // X-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.font = "10px Inter, sans-serif"
    ctx.textAlign = "center"
    labels.forEach((label, index) => {
      if (index % 3 === 0) {
        // Show fewer labels to avoid crowding
        const x = padding.left + (graphWidth / (labels.length - 1)) * index
        ctx.fillText(label, x, chartHeight - padding.bottom + 15)
      }
    })
  }, [])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
