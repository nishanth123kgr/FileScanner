"use client"

import { useState, useEffect, useCallback } from "react"
import { FileWarning, AlertTriangle, FileCode, Shield, Fingerprint } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

// Mock YARA rules for demo (in reality, these would be loaded from a server)
const YARA_RULES = [
  "rule WannaCry_Ransomware { strings: $s1 = \"msg/m_bulgarian\" $s2 = \"msg/m_chinese\" condition: $s1 and $s2 }",
  "rule Suspicious_MZ_Header { strings: $mz = {4D 5A 90 00} condition: $mz at 0 }",
  "rule Potential_Shellcode { strings: $sc = {EB ?? ?? ?? ?? ?? 68 ?? ?? ?? ?? E8} condition: $sc }",
  "rule Contains_Base64_PE { strings: $b64 = /TVqQAAMA/ condition: $b64 }"
]

interface YaraMatch {
  rule: string
  description: string
  severity: "high" | "medium" | "low"
  matches: string[]
  offset: number
}

export default function YaraResults({ file }: { file: File | null }) {
  const [yaraMatches, setYaraMatches] = useState<YaraMatch[]>([])
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanProgress, setScanProgress] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [chunkScanned, setChunkScanned] = useState<number>(0)
  const [totalChunks, setTotalChunks] = useState<number>(0)

  // Function to simulate scanning with YARA rules using progressive chunking
  const scanWithYara = useCallback(async (file: File) => {
    if (!file) return
    
    try {
      setIsScanning(true)
      setError(null)
      setScanProgress(0)
      setYaraMatches([])
      
      // Define chunk size for incremental scanning
      const chunkSize = 1024 * 1024 // 1MB chunks for scanning
      const totalSize = file.size
      const chunks = Math.ceil(totalSize / chunkSize)
      setTotalChunks(chunks)
      
      // Simulate matches (in real implementation, this would be server-side scanning)
      const mockMatches: YaraMatch[] = []
      
      // Scan file in chunks to maintain UI responsiveness
      for (let i = 0; i < chunks; i++) {
        setChunkScanned(i + 1)
        
        // Allow UI to update between chunks
        await new Promise(resolve => setTimeout(resolve, 10))
        
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, totalSize)
        const progress = Math.floor(((i + 1) / chunks) * 100)
        setScanProgress(progress)
        
        // In a real implementation, each chunk would be sent to a backend for scanning
        // Here we simulate finding some matches in specific chunks
        
        // Simulate random matches for demo purposes
        if (i === 1 || i === Math.floor(chunks / 2) || i === chunks - 2) {
          // Create a randomized match for this chunk
          const randomRule = YARA_RULES[Math.floor(Math.random() * YARA_RULES.length)]
          const match: YaraMatch = {
            rule: randomRule.split(" ")[1], // Extract rule name
            description: `Detected ${randomRule.split(" ")[1]} pattern`,
            severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
            matches: [`Offset ${start + Math.floor(Math.random() * chunkSize)}`],
            offset: start + Math.floor(Math.random() * chunkSize)
          }
          mockMatches.push(match)
          
          // Update matches incrementally to show progress
          setYaraMatches(prev => [...prev, match])
        }
      }
      
      // Ensure consistent results for demo - add standard matches if none were added
      if (mockMatches.length === 0) {
        const standardMatch: YaraMatch = {
          rule: "Suspicious_MZ_Header",
          description: "Found executable header signature",
          severity: "low",
          matches: ["Offset 0"],
          offset: 0
        }
        setYaraMatches([standardMatch])
      }
      
      setScanProgress(100)
    } catch (err) {
      console.error("Error scanning with YARA:", err)
      setError("Failed to complete YARA scan. The file may be corrupted or too large.")
    } finally {
      setIsScanning(false)
    }
  }, [])

  // Start scanning when file changes
  useEffect(() => {
    if (file) {
      scanWithYara(file)
    }
  }, [file, scanWithYara])

  // Filter matches based on selected severity tab
  const filteredMatches = activeTab === "all" 
    ? yaraMatches 
    : yaraMatches.filter(match => match.severity === activeTab)

  // Visual indicators for match severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500"
      case "medium": return "bg-amber-500"
      case "low": return "bg-blue-500"
      default: return "bg-zinc-500"
    }
  }

  return (
    <div className="space-y-6 w-full max-w-full">
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
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-white mb-1">YARA Scan Results</h3>
                <p className="text-zinc-400 mb-4">
                  {file ? `Scanning ${file.name} for suspicious patterns` : "No file selected"}
                </p>
              </div>
              {file && !isScanning && (
                <Button 
                  onClick={() => scanWithYara(file)} 
                  className="bg-amber-600 hover:bg-amber-500 text-white border-0"
                >
                  Rescan
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {isScanning ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="text-center py-10">
              <div className="mb-4 text-zinc-300">Scanning file with YARA rules...</div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 max-w-md mx-auto">
                <div 
                  className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {scanProgress}% complete - Processed chunk {chunkScanned} of {totalChunks}
              </div>
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
                  <AlertTriangle className="text-red-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Scan Error</h3>
                <p className="text-zinc-400">{error}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : yaraMatches.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -bottom-24 -right-24 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl"></div>
            
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full relative z-10"
            >
              <TabsList className="grid grid-cols-4 mb-8 bg-zinc-800/50 p-1 rounded-lg w-full max-w-md mx-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-amber-600">All</TabsTrigger>
                <TabsTrigger value="high" className="data-[state=active]:bg-red-500">High</TabsTrigger>
                <TabsTrigger value="medium" className="data-[state=active]:bg-amber-500">Medium</TabsTrigger>
                <TabsTrigger value="low" className="data-[state=active]:bg-blue-500">Low</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {/* Only render items for the active tab to improve performance */}
                <div className="space-y-3">
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400">
                      No matches found for the selected severity level.
                    </div>
                  ) : (
                    filteredMatches.map((match, index) => (
                      <div 
                        key={`${match.rule}-${index}`}
                        className="p-4 bg-zinc-800/50 border border-zinc-700/40 rounded-lg hover:bg-zinc-800/70 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(match.severity)}/20 border ${getSeverityColor(match.severity)}/30`}>
                            <FileWarning className={`h-5 w-5 ${match.severity === "high" ? "text-red-500" : match.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium">{match.rule}</h4>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${match.severity === "high" ? "bg-red-500/20 text-red-300" : match.severity === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                                {match.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{match.description}</p>
                            <div className="mt-3 bg-zinc-900/60 p-2 rounded text-sm border border-zinc-800/70">
                              <div className="font-mono text-xs text-zinc-500">
                                Matches found: {match.matches.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
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
                <div className="bg-green-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-green-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Matches Found</h3>
                <p className="text-zinc-400">No suspicious patterns were detected in the scanned file.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl"></div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
            <Fingerprint className="h-5 w-5 text-amber-500" />
            Scan Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Fingerprint className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Scan Time</h4>
                  <p className="text-sm text-zinc-300 mt-1 bg-black/40 p-1.5 rounded border border-zinc-800/50 font-mono">
                    {new Date().toISOString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Fingerprint className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Rules Applied</h4>
                  <p className="text-sm text-zinc-300 mt-1 bg-black/40 p-1.5 rounded border border-zinc-800/50 font-mono">
                    {YARA_RULES.length} rules (general malware detection)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
