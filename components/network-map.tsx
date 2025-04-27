"use client"

import { useEffect, useRef } from "react"

export default function NetworkMap() {
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

    // Network nodes
    const nodes = [
      { id: 1, x: rect.width / 2, y: rect.height / 2, radius: 25, label: "Router", color: "#3b82f6", type: "router" },
      {
        id: 2,
        x: rect.width / 2 - 120,
        y: rect.height / 2 - 80,
        radius: 15,
        label: "192.168.1.5",
        color: "#10b981",
        type: "secure",
      },
      {
        id: 3,
        x: rect.width / 2 + 120,
        y: rect.height / 2 - 80,
        radius: 15,
        label: "192.168.1.10",
        color: "#10b981",
        type: "secure",
      },
      {
        id: 4,
        x: rect.width / 2 - 150,
        y: rect.height / 2 + 80,
        radius: 15,
        label: "192.168.1.15",
        color: "#f59e0b",
        type: "warning",
      },
      {
        id: 5,
        x: rect.width / 2 + 150,
        y: rect.height / 2 + 80,
        radius: 15,
        label: "192.168.1.20",
        color: "#ef4444",
        type: "vulnerable",
      },
      {
        id: 6,
        x: rect.width / 2 - 60,
        y: rect.height / 2 + 40,
        radius: 15,
        label: "192.168.1.25",
        color: "#10b981",
        type: "secure",
      },
      {
        id: 7,
        x: rect.width / 2 + 60,
        y: rect.height / 2 + 40,
        radius: 15,
        label: "192.168.1.30",
        color: "#10b981",
        type: "secure",
      },
      {
        id: 8,
        x: rect.width / 2 - 60,
        y: rect.height / 2 - 40,
        radius: 15,
        label: "192.168.1.35",
        color: "#f59e0b",
        type: "warning",
      },
      {
        id: 9,
        x: rect.width / 2 + 60,
        y: rect.height / 2 - 40,
        radius: 15,
        label: "192.168.1.40",
        color: "#10b981",
        type: "secure",
      },
    ]

    // Connections between nodes
    const connections = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 },
      { from: 1, to: 6 },
      { from: 1, to: 7 },
      { from: 1, to: 8 },
      { from: 1, to: 9 },
    ]

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw connections
    connections.forEach((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.from)
      const toNode = nodes.find((n) => n.id === conn.to)

      if (fromNode && toNode) {
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)

        // Set connection color based on node type
        if (toNode.type === "vulnerable") {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)" // Red
        } else if (toNode.type === "warning") {
          ctx.strokeStyle = "rgba(245, 158, 11, 0.5)" // Yellow
        } else {
          ctx.strokeStyle = "rgba(75, 85, 99, 0.3)" // Gray
        }

        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = node.color + "20" // Add transparency
      ctx.fill()
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Node label
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#e4e4e7" // Zinc-200
      ctx.fillText(node.label, node.x, node.y)

      // Add pulse effect for vulnerable nodes
      if (node.type === "vulnerable") {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(239, 68, 68, 0.3)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Animation loop for pulse effect
    let animationFrame: number
    let pulseSize = 0

    const animate = () => {
      pulseSize = (pulseSize + 0.02) % 1

      // Clear and redraw everything
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from)
        const toNode = nodes.find((n) => n.id === conn.to)

        if (fromNode && toNode) {
          ctx.beginPath()
          ctx.moveTo(fromNode.x, fromNode.y)
          ctx.lineTo(toNode.x, toNode.y)

          // Set connection color based on node type
          if (toNode.type === "vulnerable") {
            ctx.strokeStyle = "rgba(239, 68, 68, 0.5)" // Red
          } else if (toNode.type === "warning") {
            ctx.strokeStyle = "rgba(245, 158, 11, 0.5)" // Yellow
          } else {
            ctx.strokeStyle = "rgba(75, 85, 99, 0.3)" // Gray
          }

          ctx.lineWidth = 2
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color + "20" // Add transparency
        ctx.fill()
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Node label
        ctx.font = "12px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#e4e4e7" // Zinc-200
        ctx.fillText(node.label, node.x, node.y)

        // Add pulse effect for vulnerable nodes
        if (node.type === "vulnerable") {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 5 + pulseSize * 10, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 - pulseSize * 0.5})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
