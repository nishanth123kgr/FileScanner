"use client"

import { Card } from "@/components/ui/card"
import { ExternalLink, FileText, Shield } from "lucide-react"
import { motion } from "framer-motion"

export const AdditionalActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-glassmorphism p-4 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <ExternalLink className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <div>
              <h4 className="text-white font-medium">Submit to VirusTotal</h4>
              <p className="text-xs text-zinc-400 mt-1">Get additional analysis from multiple engines</p>
            </div>
          </div>
        </Card>

        <Card className="card-glassmorphism p-4 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <FileText className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
            <div>
              <h4 className="text-white font-medium">Export to JSON</h4>
              <p className="text-xs text-zinc-400 mt-1">Save analysis data in machine-readable format</p>
            </div>
          </div>
        </Card>

        <Card className="card-glassmorphism p-4 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <Shield className="h-4 w-4 text-green-400 group-hover:text-green-300 transition-colors" />
            </div>
            <div>
              <h4 className="text-white font-medium">Share Analysis</h4>
              <p className="text-xs text-zinc-400 mt-1">Share this report with your security team</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}