"use client"

import { motion } from "framer-motion"
import { ScanProgressProps } from "../types"

export function ScanProgress({ scanning, progress }: ScanProgressProps) {
  if (!scanning) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-2"
    >
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">Analysis Progress</span>
        <span className="text-zinc-300 font-medium">{progress}%</span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Running static analysis...</span>
        <span>Step {Math.max(1, Math.ceil(progress/20))}/5</span>
      </div>
    </motion.div>
  )
}