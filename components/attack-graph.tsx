"use client"

import { useEffect, useRef } from "react"

export default function AttackGraph() {
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

    // Define attack path nodes
    const nodes = [
      { id: 1, x: 100, y: rect.height / 2, radius: 30, label: "Reconnaissance", color: "#3b82f6", completed: true },
      { id: 2, x: 250, y: rect.height / 2, radius: 30, label: "Port Scanning", color: "#3b82f6", completed: true },
      { id: 3, x: 400, y: rect.height / 2 - 80, radius: 30, label: "SQL Injection", color: "#ef4444", completed: true },
      { id: 4, x: 400, y: rect.height / 2 + 80, radius: 30, label: "Brute Force", color: "#f59e0b", completed: true },
      {
        id: 5,
        x: 550,
        y: rect.height / 2,
        radius: 30,
        label: "Authentication Bypass",
        color: "#ef4444",
        completed: true,
      },
      {
        id: 6,
        x: 700,
        y: rect.height / 2,
        radius: 30,
        label: "Privilege Escalation",
        color: "#ef4444",
        completed: true,
      },
      {
        id: 7,
        x: 850,
        y: rect.height / 2 - 60,
        radius: 30,
        label: "Backdoor Creation",
        color: "#ef4444",
        completed: true,
      },
      {
        id: 8,
        x: 850,
        y: rect.height / 2 + 60,
        radius: 30,
        label: "Data Exfiltration",
        color: "#f59e0b",
        completed: false,
      },
    ]

    // Define connections between nodes
    const connections = [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 6, to: 8 },
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

        // Set connection color based on completion status
        if (fromNode.completed && toNode.completed) {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.6)" // Red for successful attack path
          ctx.lineWidth = 3
        } else {
          ctx.strokeStyle = "rgba(75, 85, 99, 0.3)" // Gray for incomplete paths
          ctx.lineWidth = 2
        }

        ctx.stroke()

        // Draw arrow at the end of the line
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
        const arrowSize = 10

        ctx.beginPath()
        ctx.moveTo(toNode.x - Math.cos(angle) * toNode.radius, toNode.y - Math.sin(angle) * toNode.radius)
        ctx.lineTo(
          toNode.x - Math.cos(angle) * toNode.radius - Math.cos(angle - Math.PI / 6) * arrowSize,
          toNode.y - Math.sin(angle) * toNode.radius - Math.sin(angle - Math.PI / 6) * arrowSize,
        )
        ctx.lineTo(
          toNode.x - Math.cos(angle) * toNode.radius - Math.cos(angle + Math.PI / 6) * arrowSize,
          toNode.y - Math.sin(angle) * toNode.radius - Math.sin(angle + Math.PI / 6) * arrowSize,
        )
        ctx.closePath()

        if (fromNode.completed && toNode.completed) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.6)" // Red for successful attack path
        } else {
          ctx.fillStyle = "rgba(75, 85, 99, 0.3)" // Gray for incomplete paths
        }

        ctx.fill()
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

      // Add checkmark for completed nodes
      if (node.completed) {
        ctx.beginPath()
        ctx.moveTo(node.x - 10, node.y)
        ctx.lineTo(node.x - 5, node.y + 5)
        ctx.lineTo(node.x + 10, node.y - 10)
        ctx.strokeStyle = "white"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Node label
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#e4e4e7" // Zinc-200

      // Draw label below the node
      ctx.fillText(node.label, node.x, node.y + node.radius + 15)
    })
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
