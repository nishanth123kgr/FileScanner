"use client"

import { useState, useEffect } from "react"
import { ThreatSummary } from "./components/ThreatSummary"
import { DetectedIssues } from "./components/DetectedIssues"
import { FileAnalysisReport } from "./components/FileAnalysisReport" 
import { Recommendations } from "./components/Recommendations"
import { AdditionalActions } from "./components/AdditionalActions"
import { computeFileHashes, getMagicInfo, FileData, FileHashes } from "@/components/file-scanning/scan-results/utils/file-utils"

interface ScanResultsProps {
  file: File | null
  fileData: FileData
}

export default function ScanResults({ fileData, file }: ScanResultsProps) {
  // State for file hashes
  const [fileHashes, setFileHashes] = useState<FileHashes | null>(null)
  
  // State for file magic information
  const [magicInfo, setMagicInfo] = useState<string | null>(null)

  // Effect to compute hashes when file changes
  useEffect(() => {
    const getHashes = async () => {
      const hashes = await computeFileHashes(file)
      setFileHashes(hashes)
    }
    
    getHashes()
  }, [file])

  // Effect to get magic info when file changes
  useEffect(() => {
    const getFileInfo = async () => {
      const magic = await getMagicInfo(file)
      setMagicInfo(magic)
    }
    
    getFileInfo()
  }, [file])

  return (
    <div className="space-y-8">
      {/* Threat Summary Card */}
      <ThreatSummary fileName={fileData.fileName} />

      {/* Detected Issues */}
      <DetectedIssues />

      {/* File Analysis Report */}
      <FileAnalysisReport 
        fileData={fileData}
        fileHashes={fileHashes}
        magicInfo={magicInfo}
      />

      {/* Recommendations */}
      <Recommendations />

      {/* Additional Actions */}
      <AdditionalActions />
    </div>
  )
}
