"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Download } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export const Recommendations = () => {
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleDownloadReport = () => {
    setGeneratingPdf(true)

    // Simulate PDF generation
    setTimeout(() => {
      setGeneratingPdf(false)
      // In a real implementation, this would trigger the download of a PDF file
      alert("Report downloaded successfully")
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-red-500/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl"></div>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center relative z-10">
          <Shield className="h-5 w-5 text-red-500 mr-2" />
          Recommendations
        </h3>

        <div className="space-y-4 relative z-10">
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/20 to-red-900/10 border border-red-500/20 backdrop-blur-sm flex items-start gap-4 group transition-all duration-300 hover:bg-red-950/30">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 mt-1">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg">Do Not Execute This File</h4>
              <p className="text-zinc-400 mt-1">
                This file contains malicious code and should not be executed under any circumstances. Executing this
                file could lead to system compromise.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/20 to-red-900/10 border border-red-500/20 backdrop-blur-sm flex items-start gap-4 group transition-all duration-300 hover:bg-red-950/30">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 mt-1">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg">Quarantine or Delete</h4>
              <p className="text-zinc-400 mt-1">
                We recommend quarantining or deleting this file immediately to prevent accidental execution or further
                infection.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/20 to-red-900/10 border border-red-500/20 backdrop-blur-sm flex items-start gap-4 group transition-all duration-300 hover:bg-red-950/30">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 mt-1">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg">Scan Your System</h4>
              <p className="text-zinc-400 mt-1">
                Run a full system scan to check for other infected files and ensure your system is clean.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end mt-8 gap-4 relative z-10">
          <Button
            variant="outline"
            className="text-zinc-300 gap-2 border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-700/50 hover:text-white"
            onClick={handleDownloadReport}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <>
                <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF Report
              </>
            )}
          </Button>
          <Button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white gap-2 border-0 shadow-lg shadow-red-500/20">
            <Shield className="h-4 w-4" />
            Quarantine File
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}