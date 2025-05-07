"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Fingerprint } from "lucide-react"
import { formatFileSize } from "../utils/hexUtils"

interface FileInformationProps {
  fileSize: number
  hexDataSize: number
}

export const FileInformation = ({ fileSize, hexDataSize }: FileInformationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="rounded-lg text-card-foreground shadow-none animate-fadeIn bg-black/40 backdrop-blur-md border border-zinc-800/50 p-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl"></div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
          <Fingerprint className="h-5 w-5 text-purple-500" />
          File Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Fingerprint className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h4 className="text-white font-medium">File Size</h4>
                <p className="text-xs text-zinc-300 mt-1 p-1.5 rounded border font-mono bg-black/30 border border-zinc-900">
                  {fileSize > 0 ? `${formatFileSize(fileSize)} (${fileSize.toLocaleString()} bytes)` : "N/A"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 rounded-lg hover:bg-zinc-800/70 transition-colors border bg-zinc-900/40 border-zinc-800/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Fingerprint className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h4 className="text-white font-medium">Loaded Data</h4>
                <p className="text-xs text-zinc-300 mt-1 p-1.5 rounded border font-mono bg-black/30 border border-zinc-900">
                  {hexDataSize ? `${(hexDataSize / 1024).toFixed(2)} KB loaded` : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}