"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { FileSearch, ChevronDown, ChevronUp, AlertTriangle, FileCode } from "lucide-react"
import { motion } from "framer-motion"
import { AnalysisHeader } from "./components/AnalysisHeader"
import PEHeaders from "./components/PEHeaders"
import { SectionsAnalysis } from "./components/SectionsAnalysis"
import { ImportsAnalysis } from "./components/ImportsAnalysis"
import { SuspiciousIndicators } from "./components/SuspiciousIndicators"
import { ResourcesAnalysis } from "./components/ResourcesAnalysis"
import type { PEAnalysisResult } from "./utils/pe-parser"
import { adaptNewPEFormat } from "./utils/pe-parser"

interface PEAnalysisProps {
  fileName: string,
  peData: PEAnalysisResult | null,
  isLoading: boolean,
  error: string | null
}

type SectionKey = 'headers' | 'sections' | 'imports' | 'resources' | 'indicators';

export default function PEAnalysis({ fileName, peData: rawPeData, isLoading, error }: PEAnalysisProps) {

  // Convert the PE data to the format expected by our components if it doesn't match
  const peData = React.useMemo(() => {
    if (!rawPeData) return null;
    
    // If this is the new format (with header property), convert it
    // This check is more direct - if there's a header property, it's the new format
    if (rawPeData.header) {
      console.log("Converting new PE format to component format...");
      return adaptNewPEFormat(rawPeData);
    }
    
    // Otherwise it's already in the right format
    return rawPeData;
  }, [rawPeData]);

  const [expandedSections, setExpandedSections] = React.useState({
    headers: true,
    sections: true,
    imports: true,
    resources: true,
    indicators: true
  })

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-8 w-full max-w-full">
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
            <div className="flex items-center justify-center py-10">
              <div className="animate-pulse flex flex-col items-center">
                <FileSearch className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="text-lg font-medium text-white">Analyzing PE File Structure...</h3>
                <p className="text-zinc-400 text-sm mt-2">This may take a moment for large files</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-red-900/20 to-black/80 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">PE Analysis Error</h3>
                <p className="text-zinc-400 mt-1">{error}</p>
                <p className="text-sm text-zinc-500 mt-4">
                  This could be due to an unsupported PE file format or a corrupted file structure.
                  Try analyzing with a different tool or check if the file is a valid PE executable.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {peData && !isLoading && (
        <div className="space-y-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <Card className="card-glassmorphism p-6 border-0 relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"></div>
              
              <AnalysisHeader fileName={fileName} fileData={peData} />
            </Card>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FileSearch className="h-5 w-5 text-blue-500 mr-2" />
                PE File Analysis
              </h3> */}

              <div className="space-y-6">
                {/* PE Headers Section */}
                <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex justify-between items-center text-left"
                    onClick={() => toggleSection("headers")}
                  >
                    <h4 className="text-base font-medium text-white">PE Headers</h4>
                    {expandedSections.headers ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>

                  {expandedSections.headers && (
                    <div className="px-5 pb-5 space-y-3">
                      <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                        <PEHeaders analysisData={peData} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sections Analysis */}
                <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex justify-between items-center text-left"
                    onClick={() => toggleSection("sections")}
                  >
                    <h4 className="text-base font-medium text-white">Sections Analysis</h4>
                    {expandedSections.sections ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>

                  {expandedSections.sections && (
                    <div className="px-5 pb-5 space-y-3">
                      <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                        <SectionsAnalysis sections={peData.sections} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Imports Analysis */}
                <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex justify-between items-center text-left"
                    onClick={() => toggleSection("imports")}
                  >
                    <h4 className="text-base font-medium text-white">Imports Analysis</h4>
                    {expandedSections.imports ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>

                  {expandedSections.imports && (
                    <div className="px-5 pb-5 space-y-3">
                      <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                        <ImportsAnalysis imports={peData.imports || []} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Analysis */}
                {peData.resources && peData.resources.length > 0 && (
                  <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                    <button
                      className="w-full px-5 py-4 flex justify-between items-center text-left"
                      onClick={() => toggleSection("resources")}
                    >
                      <h4 className="text-base font-medium text-white">Resources Analysis</h4>
                      {expandedSections.resources ? (
                        <ChevronUp className="h-5 w-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-zinc-400" />
                      )}
                    </button>

                    {expandedSections.resources && (
                      <div className="px-5 pb-5 space-y-3">
                        <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                          <ResourcesAnalysis resources={peData.resources} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Suspicious Indicators */}
                <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex justify-between items-center text-left"
                    onClick={() => toggleSection("indicators")}
                  >
                    <h4 className="text-base font-medium text-white">Suspicious Indicators</h4>
                    {expandedSections.indicators ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>

                  {expandedSections.indicators && (
                    <div className="px-5 pb-5 space-y-3">
                      <div className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-zinc-800/50">
                        <SuspiciousIndicators analysisData={peData} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            {/* </Card>
          </motion.div> */}
        </div>
      )}
    </div>
  )
}
