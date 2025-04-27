"use client"

import { useState, useEffect, useCallback } from "react"
import { File, ShieldAlert, FileCode, Award, Package, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PEHeaders from "./components/PEHeaders"
import { SectionsAnalysis } from "./components/SectionsAnalysis"
import { ImportsAnalysis } from "./components/ImportsAnalysis"
import { SuspiciousIndicators } from "./components/SuspiciousIndicators"
import { analyzePEFile } from "./utils/pe-parser"

// Maximum size for PE header analysis to keep performance fast
const MAX_HEADER_SIZE = 1024 * 1024; // First 1MB is enough for PE headers

export default function PEAnalysis({ file }: { file: File | null }) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("headers")
  const [loadProgress, setLoadProgress] = useState<number>(0)

  // Function to analyze the PE file with optimized loading
  const analyzePEFileHandler = useCallback(async (file: File) => {
    if (!file) return
    
    try {
      setIsLoading(true)
      setError(null)
      setLoadProgress(0)
      
      // We don't need the entire file for PE header analysis, just the first few MB
      const headerSize = Math.min(file.size, MAX_HEADER_SIZE)
      
      // Show loading progress while reading the file
      let accumulatedChunks = []
      const chunkSize = 64 * 1024 // 64KB per chunk for better UI responsiveness
      
      for (let position = 0; position < headerSize; position += chunkSize) {
        // Use setTimeout to yield to UI thread
        await new Promise(resolve => setTimeout(resolve, 0))
        
        const end = Math.min(position + chunkSize, headerSize)
        const chunk = await file.slice(position, end).arrayBuffer()
        
        accumulatedChunks.push(new Uint8Array(chunk))
        setLoadProgress(Math.floor((end / headerSize) * 100))
      }
      
      // Combine all chunks into one buffer
      const totalLength = accumulatedChunks.reduce((total, arr) => total + arr.length, 0)
      const combinedBuffer = new Uint8Array(totalLength)
      
      let offset = 0
      for (const chunk of accumulatedChunks) {
        combinedBuffer.set(chunk, offset)
        offset += chunk.length
      }
      
      // Convert Uint8Array to ArrayBuffer for analyzePEFile
      const arrayBuffer = combinedBuffer.buffer;
      
      // Analyze the PE file
      const result = await analyzePEFile(arrayBuffer)
      setAnalysis(result)
      setLoadProgress(100)
    } catch (err) {
      console.error("Error analyzing PE file:", err)
      setError("Failed to analyze PE file. The file may not be a valid PE executable.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // When file changes, attempt to analyze it
  useEffect(() => {
    if (file) {
      analyzePEFileHandler(file)
    }
  }, [file, analyzePEFileHandler])

  // Switch tabs for optimal loading experience
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="card-glassmorphism p-6 border-0 relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"></div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <FileCode className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-1">PE File Analysis</h3>
                <p className="text-zinc-400 mb-4">Examining {file?.name || "file"} structure and properties</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="text-center py-10">
              <div className="mb-4 text-zinc-300">Analyzing PE file structure...</div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 max-w-md mx-auto">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${loadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-zinc-500">{loadProgress}% complete</div>
            </div>
          </Card>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="flex justify-center py-8">
              <div className="text-center max-w-md">
                <div className="bg-red-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="text-red-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Analysis Error</h3>
                <p className="text-zinc-400">{error}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -bottom-24 -right-24 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl"></div>
            
            <div className="relative z-10">
              <Tabs 
                defaultValue="headers" 
                value={activeTab} 
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-8 bg-zinc-800/50 p-1 rounded-lg w-full max-w-xl mx-auto">
                  <TabsTrigger value="headers" className="data-[state=active]:bg-blue-600">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      <span className="hidden sm:inline">Headers</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="sections" className="data-[state=active]:bg-blue-600">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline">Sections</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="imports" className="data-[state=active]:bg-blue-600">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Imports</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="indicators" className="data-[state=active]:bg-blue-600">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="hidden sm:inline">Indicators</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                {/* Only render active tab's content to improve performance */}
                {activeTab === "headers" && (
                  <TabsContent value="headers" className="mt-0">
                    <PEHeaders analysisData={analysis} />
                  </TabsContent>
                )}
                
                {activeTab === "sections" && (
                  <TabsContent value="sections" className="mt-0">
                    <SectionsAnalysis sections={analysis.sections} />
                  </TabsContent>
                )}
                
                {activeTab === "imports" && (
                  <TabsContent value="imports" className="mt-0">
                    <ImportsAnalysis imports={analysis.imports || []} />
                  </TabsContent>
                )}
                
                {activeTab === "indicators" && (
                  <TabsContent value="indicators" className="mt-0">
                    <SuspiciousIndicators analysisData={analysis} />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="flex justify-center py-8">
              <div className="text-center max-w-md">
                <div className="bg-blue-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <File className="text-blue-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No File Selected</h3>
                <p className="text-zinc-400">Please upload a file to begin PE analysis.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}