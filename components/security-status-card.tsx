import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface SecurityStatusCardProps {
  title: string
  status: string
  icon: LucideIcon
  value: number
  color: "red" | "green" | "blue" | "yellow"
  valueHidden?: boolean
}

export default function SecurityStatusCard({
  title,
  status,
  icon: Icon,
  value,
  color,
  valueHidden = false,
}: SecurityStatusCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "red":
        return {
          bg: "bg-red-500/10",
          text: "text-red-500",
          border: "border-red-500/20",
          progress: "bg-red-500",
        }
      case "green":
        return {
          bg: "bg-green-500/10",
          text: "text-green-500",
          border: "border-green-500/20",
          progress: "bg-green-500",
        }
      case "blue":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-500",
          border: "border-blue-500/20",
          progress: "bg-blue-500",
        }
      case "yellow":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-500",
          border: "border-yellow-500/20",
          progress: "bg-yellow-500",
        }
    }
  }

  const colorClasses = getColorClasses()

  return (
    <Card className={`card-glassmorphism ${colorClasses.bg} border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl p-6 relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-zinc-200">{title}</h3>
        <div className={`p-2 rounded-full ${colorClasses.bg} ${colorClasses.border} border`}>
          <Icon className={`h-5 w-5 ${colorClasses.text}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${colorClasses.text}`}>{status}</p>

      {!valueHidden && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Security Score</span>
            <span className={colorClasses.text}>{value}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
            <div className={`h-full ${colorClasses.progress} rounded-full`} style={{ width: `${value}%` }} />
          </div>
        </div>
      )}

      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-transparent to-white/5 blur-xl" />
    </Card>
  )
}
