"use client"

import { Card } from "@/components/ui/card"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { FileData, FileHashes } from "@/components/file-scanning/scan-results/utils/file-utils"

interface FileAnalysisReportProps {
  fileData: FileData
  fileHashes: FileHashes | null
  magicInfo: string | null
}

export const FileAnalysisReport = ({ fileData, fileHashes, magicInfo }: FileAnalysisReportProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hashes: true,
    fileInfo: true,
    timestamps: true,
    filenames: false,
    signature: false,
    peStructure: false,
    imports: false,
    resources: false,
    overlay: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          File Analysis Report
        </h3>

        <div className="space-y-6">
          {/* 1. Hashes and Signatures */}
          <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <button
              className="w-full px-5 py-4 flex justify-between items-center text-left"
              onClick={() => toggleSection("hashes")}
            >
              <h4 className="text-base font-medium text-white">Hashes and Signatures</h4>
              {expandedSections.hashes ? (
                <ChevronUp className="h-5 w-5 text-zinc-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-zinc-400" />
              )}
            </button>

            {expandedSections.hashes && (
              <div className="px-5 pb-5 space-y-3">
                <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-zinc-400">MD5</span>
                      <p className="text-sm font-mono text-zinc-300 mt-1 bg-black/20 p-1.5 rounded border border-zinc-800/50 overflow-x-auto break-all">
                        {fileHashes?.md5 || "Calculating..."}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400">SHA-1</span>
                      <p className="text-sm font-mono text-zinc-300 mt-1 bg-black/20 p-1.5 rounded border border-zinc-800/50 overflow-x-auto break-all">
                        {fileHashes?.sha1 || "Calculating..."}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400">SHA-256</span>
                      <p className="text-sm font-mono text-zinc-300 mt-1 bg-black/20 p-1.5 rounded border border-zinc-800/50 overflow-x-auto break-all">
                        {fileHashes?.sha256 || "Calculating..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. File Information */}
          <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <button
              className="w-full px-5 py-4 flex justify-between items-center text-left"
              onClick={() => toggleSection("fileInfo")}
            >
              <h4 className="text-base font-medium text-white">File Information</h4>
              {expandedSections.fileInfo ? (
                <ChevronUp className="h-5 w-5 text-zinc-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-zinc-400" />
              )}
            </button>

            {expandedSections.fileInfo && (
              <div className="px-5 pb-5 space-y-3">
                <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-zinc-400">File Type</span>
                      <p className="text-sm text-zinc-300 mt-1">{fileData.fileType}</p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400">Magic</span>
                      <p className="text-sm text-zinc-300 mt-1">{magicInfo || "Unknown"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400">File Size</span>
                      <p className="text-sm text-zinc-300 mt-1">{fileData.fileSize}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Timestamps */}
          <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <button
              className="w-full px-5 py-4 flex justify-between items-center text-left"
              onClick={() => toggleSection("timestamps")}
            >
              <h4 className="text-base font-medium text-white">Timestamps</h4>
              {expandedSections.timestamps ? (
                <ChevronUp className="h-5 w-5 text-zinc-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-zinc-400" />
              )}
            </button>

            {expandedSections.timestamps && (
              <div className="px-5 pb-5">
                <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-zinc-400">Creation Time</span>
                      <p className="text-sm text-zinc-300 mt-1">2024-11-29 16:00:00 UTC</p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400">First Seen In The Wild</span>
                      <p className="text-sm text-zinc-300 mt-1">2025-03-27 00:09:43 UTC</p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400">First Submission</span>
                      <p className="text-sm text-zinc-300 mt-1">2024-11-30 10:58:36 UTC</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}