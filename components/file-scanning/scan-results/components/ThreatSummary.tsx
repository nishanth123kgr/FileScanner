"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { FileWarning, Info } from "lucide-react"
import { motion } from "framer-motion"

interface ThreatSummaryProps {
  fileName: string
}

export const ThreatSummary = ({ fileName }: ThreatSummaryProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="card-glassmorphism p-6 border-0 relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-red-500/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="flex items-start gap-6 relative z-10">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <FileWarning className="h-8 w-8 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Threat Detected</h3>
                <p className="text-zinc-400">
                  Analysis of <span className="text-white font-medium">{fileName}</span>
                </p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 px-3 py-1.5 text-sm self-start md:self-center">
                High Risk Score: 85/100
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 backdrop-blur-sm">
                <div className="text-2xl font-bold text-red-400">2</div>
                <div className="text-xs text-zinc-400 mt-1">Malware Signatures</div>
                <div className="mt-2 h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "40%" }} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 backdrop-blur-sm">
                <div className="text-2xl font-bold text-orange-400">3</div>
                <div className="text-xs text-zinc-400 mt-1">Suspicious Patterns</div>
                <div className="mt-2 h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 backdrop-blur-sm">
                <div className="text-2xl font-bold text-yellow-400">1</div>
                <div className="text-xs text-zinc-400 mt-1">Vulnerabilities</div>
                <div className="mt-2 h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-400">85%</div>
                  <Info className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="text-xs text-zinc-400 mt-1">Overall Risk Score</div>
                <div className="mt-2 h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}