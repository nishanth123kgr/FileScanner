"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, AlertCircle, FileWarning, Info, Calendar, Hash, User, Link2, Fingerprint, CheckCircle, AlertTriangle, File, Filter, RefreshCw, Tag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

// Define the YARA results types to match the provided format
interface YaraMatch {
  offset: number
  // Add other match fields as needed
}

interface YaraRuleMetadata {
  author: string
  id: string
  fingerprint: string
  creation_date: string
  last_modified?: string
  description?: string
  threat_name: string
  reference_sample?: string
  severity: string
  arch_context: string
  scan_context: string
  license: string
  [key: string]: string | undefined // For any other metadata fields
}

interface YaraRule {
  rule_name: string
  metadata: YaraRuleMetadata
  match_count: number
  matches: YaraMatch[]
}

interface YaraResults {
  matched_rules: YaraRule[]
}

export default function YaraResults({ file, yaraData }: { file: File | null, yaraData?: YaraResults }) {
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanProgress, setScanProgress] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [chunkScanned, setChunkScanned] = useState<number>(0)
  const [totalChunks, setTotalChunks] = useState<number>(0)
  const [filterOption, setFilterOption] = useState<string>("severity")
  
  // Function to simulate scanning with YARA rules
  const scanWithYara = useCallback(async (file: File) => {
    if (!file) return
    
    try {
      setIsScanning(true)
      setError(null)
      setScanProgress(0)
      
      // Define chunk size for incremental scanning
      const chunkSize = 1024 * 1024 // 1MB chunks for scanning
      const totalSize = file.size
      const chunks = Math.ceil(totalSize / chunkSize)
      setTotalChunks(chunks)
      
      // Simulate scanning progress
      for (let i = 0; i < chunks; i++) {
        setChunkScanned(i + 1)
        
        // Allow UI to update between chunks
        await new Promise(resolve => setTimeout(resolve, 10))
        
        const progress = Math.floor(((i + 1) / chunks) * 100)
        setScanProgress(progress)
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
    if (file && !yaraData) {
      scanWithYara(file)
    }
  }, [file, scanWithYara, yaraData])

  // Function to get severity class based on severity value
  const getSeverityColor = (severity: string) => {
    const severityNum = parseInt(severity) || 0
    
    if (severityNum >= 80) return { bg: "bg-red-500", text: "text-red-500", border: "border-red-500", hover: "hover:bg-red-500/10" }
    if (severityNum >= 60) return { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500", hover: "hover:bg-orange-500/10" }
    if (severityNum >= 30) return { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500", hover: "hover:bg-amber-500/10" }
    return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", hover: "hover:bg-blue-500/10" }
  }

  // Function to get severity text based on severity value
  const getSeverityText = (severity: string) => {
    const severityNum = parseInt(severity) || 0
    
    if (severityNum >= 80) return "Critical"
    if (severityNum >= 60) return "High"
    if (severityNum >= 30) return "Medium"
    return "Low"
  }

  // Filter rules based on selected tab
  const getFilteredRules = () => {
    if (!yaraData?.matched_rules) return []
    
    if (activeTab === "all") return yaraData.matched_rules
    
    return yaraData.matched_rules.filter(rule => {
      const severityNum = parseInt(rule.metadata.severity) || 0
      
      switch (activeTab) {
        case "critical": return severityNum >= 80
        case "high": return severityNum >= 60 && severityNum < 80
        case "medium": return severityNum >= 30 && severityNum < 60
        case "low": return severityNum < 30
        default: return true
      }
    })
  }

  // Sort and filter rules based on options
  const getSortedRules = () => {
    const filteredRules = getFilteredRules()
    
    switch (filterOption) {
      case "severity":
        return [...filteredRules].sort((a, b) => 
          (parseInt(b.metadata.severity) || 0) - (parseInt(a.metadata.severity) || 0)
        )
      case "matches":
        return [...filteredRules].sort((a, b) => b.match_count - a.match_count)
      case "name":
        return [...filteredRules].sort((a, b) => a.rule_name.localeCompare(b.rule_name))
      case "date":
        return [...filteredRules].sort((a, b) => {
          const dateA = a.metadata.creation_date || ""
          const dateB = b.metadata.creation_date || ""
          return dateB.localeCompare(dateA)
        })
      default:
        return filteredRules
    }
  }

  const sortedRules = getSortedRules()
  const totalThreats = yaraData?.matched_rules?.length || 0
  const criticalThreats = yaraData?.matched_rules?.filter(rule => parseInt(rule.metadata.severity) >= 80).length || 0
  
  // Group rules by threat category for visualization
  const threatCategories = yaraData?.matched_rules?.reduce((acc, rule) => {
    const threatName = rule.metadata.threat_name || "Unknown"
    if (!acc[threatName]) acc[threatName] = 0
    acc[threatName]++
    return acc
  }, {} as Record<string, number>) || {}

  // Calculate total match count for all rules
  const totalMatchCount = yaraData?.matched_rules?.reduce((total, rule) => total + rule.match_count, 0) || 0

  return (
    <div className="space-y-6 w-full">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="absolute -z-10 w-full h-64 bg-gradient-to-b from-red-900/20 via-amber-900/10 to-transparent rounded-3xl blur-xl"></div>
        <Card className="overflow-hidden backdrop-blur-md bg-black/40 border border-zinc-800/50">
          <div className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Shield className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">YARA Threat Analysis</h2>
                  <p className="text-zinc-400 text-sm">
                    {file?.name ? `Analyzing ${file.name} for malicious patterns` : "No file selected"}
                  </p>
                </div>
              </div>
              
              {file && !isScanning && (
                <Button 
                  variant="outline" 
                  onClick={() => scanWithYara(file)}
                  className="flex items-center gap-2 bg-zinc-900/50 text-white border-zinc-700 hover:bg-zinc-800"
                >
                  <RefreshCw size={16} />
                  Rescan File
                </Button>
              )}
            </div>
            
            {yaraData?.matched_rules && yaraData.matched_rules.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Threats</p>
                    <h3 className="text-2xl font-bold text-white">{totalThreats}</h3>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-zinc-400" />
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Critical Threats</p>
                    <h3 className="text-2xl font-bold text-red-500">{criticalThreats}</h3>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Threat Categories</p>
                    <h3 className="text-2xl font-bold text-amber-500">{Object.keys(threatCategories).length}</h3>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <FileWarning className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Matches</p>
                    <h3 className="text-2xl font-bold text-blue-400">{totalMatchCount}</h3>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Fingerprint className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </div>
            )}
            
            {isScanning && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>Scanning file...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-1.5 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-red-500" />
                <p className="text-zinc-500 text-xs mt-2">
                  Processed {chunkScanned} of {totalChunks} chunks
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      
      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-red-900/30 bg-black/40 backdrop-blur-md">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Scan Error</h3>
                <p className="text-zinc-400 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* Results Section */}
      {!isScanning && !error && (
        <>
          {yaraData?.matched_rules && yaraData.matched_rules.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="bg-black/40 backdrop-blur-md border border-zinc-800/50 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <Tabs 
                      value={activeTab} 
                      onValueChange={setActiveTab} 
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="bg-zinc-900/70 border border-zinc-800">
                        <TabsTrigger 
                          value="all" 
                          className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                          All
                        </TabsTrigger>
                        <TabsTrigger 
                          value="critical" 
                          className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
                        >
                          Critical
                        </TabsTrigger>
                        <TabsTrigger 
                          value="high" 
                          className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                        >
                          High
                        </TabsTrigger>
                        <TabsTrigger 
                          value="medium" 
                          className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
                        >
                          Medium
                        </TabsTrigger>
                        <TabsTrigger 
                          value="low" 
                          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                        >
                          Low
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 bg-zinc-900/50 text-zinc-300 border-zinc-700 hover:bg-zinc-800">
                          <Filter size={16} />
                          Sort by: {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                        <DropdownMenuItem 
                          className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                          onClick={() => setFilterOption("severity")}
                        >
                          Severity
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                          onClick={() => setFilterOption("matches")}
                        >
                          Match Count
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                          onClick={() => setFilterOption("name")}
                        >
                          Rule Name
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                          onClick={() => setFilterOption("date")}
                        >
                          Creation Date
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Show threat categories visualization */}
                  {activeTab === 'all' && Object.keys(threatCategories).length > 0 && (
                    <div className="mb-6 bg-zinc-900/40 rounded-lg p-4 border border-zinc-800/50">
                      <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <Tag size={14} className="text-amber-500" />
                        Threat Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(threatCategories).map(([category, count]) => (
                          <Badge 
                            key={category}
                            variant="outline" 
                            className="py-1.5 px-3 bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700/50 text-zinc-300"
                          >
                            {category.replace(/.*\./, '')} ({count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab + filterOption}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {sortedRules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="p-4 rounded-full bg-blue-500/10 mb-4">
                            <Info className="h-6 w-6 text-blue-400" />
                          </div>
                          <h3 className="text-lg font-medium text-white">No matches in this category</h3>
                          <p className="text-zinc-400 max-w-sm mt-2">
                            No threats with this severity level were detected in the scanned file.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sortedRules.map((rule, index) => {
                            const severityColors = getSeverityColor(rule.metadata.severity);
                            const severityText = getSeverityText(rule.metadata.severity);
                            const severityLevel = parseInt(rule.metadata.severity) || 0;
                            
                            return (
                              <motion.div
                                key={rule.rule_name + index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value={`rule-${index}`} className="border-0">
                                    <div className={`
                                      relative overflow-hidden rounded-lg border 
                                      ${severityLevel >= 80 
                                        ? "border-red-900/30 bg-gradient-to-r from-red-950/30 to-zinc-900/70" 
                                        : severityLevel >= 60 
                                          ? "border-orange-900/30 bg-gradient-to-r from-orange-950/30 to-zinc-900/70"
                                          : "border-zinc-800/50 bg-zinc-900/30"}
                                    `}>
                                      <AccordionTrigger className="px-4 py-4 hover:no-underline">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full text-left">
                                          <div className={`p-2 rounded-lg ${severityColors.bg}/10 border ${severityColors.border}/20 mr-2`}>
                                            <FileWarning className={`h-5 w-5 ${severityColors.text}`} />
                                          </div>
                                          
                                          <div className="flex-1">
                                            <h4 className="text-white font-medium flex flex-wrap items-center gap-2">
                                              {rule.rule_name}
                                              <Badge className={`${severityColors.bg}/20 ${severityColors.text} border-none`}>
                                                {severityText} ({rule.metadata.severity})
                                              </Badge>
                                            </h4>
                                            <p className="text-sm text-zinc-400 mt-1">
                                              {rule.metadata.threat_name}
                                            </p>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 lg:gap-6 mt-2 lg:mt-0">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <div className="flex items-center gap-1.5">
                                                    <Fingerprint className="h-4 w-4 text-blue-400" />
                                                    <span className="text-sm font-medium text-blue-400">
                                                      {rule.match_count}
                                                    </span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                  {rule.match_count} matches found
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <div className="flex items-center gap-1.5">
                                                    <User className="h-4 w-4 text-zinc-500" />
                                                    <span className="text-sm text-zinc-400">{rule.metadata.author}</span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                  Rule author
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4 text-zinc-500" />
                                                    <span className="text-sm text-zinc-400">{rule.metadata.creation_date}</span>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                  Rule creation date
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      
                                      <AccordionContent className="px-4 pb-4 pt-0">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                          {/* Alert and Description */}
                                          <div className={`
                                            rounded-lg p-4
                                            ${severityLevel >= 80 ? "bg-red-950/30 border border-red-900/30" : 
                                              severityLevel >= 60 ? "bg-orange-950/30 border border-orange-900/30" : 
                                              "bg-zinc-900/50 border border-zinc-800/50"}
                                          `}>
                                            <div className="flex items-start gap-3 mb-4">
                                              <div className={`p-2 rounded-full ${severityColors.bg}/20`}>
                                                <AlertTriangle className={`h-5 w-5 ${severityColors.text}`} />
                                              </div>
                                              <div>
                                                <h5 className="font-medium text-white">Threat Summary</h5>
                                                <p className={`text-sm ${severityColors.text} mt-1`}>
                                                  {rule.metadata.threat_name}
                                                </p>
                                              </div>
                                            </div>
                                            
                                            <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
                                              {rule.metadata.description || 
                                                `This file contains patterns consistent with ${rule.metadata.threat_name}, which was detected by the "${rule.rule_name}" YARA rule. This may indicate malicious content or potentially unwanted behavior.`}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-2 mt-4">
                                              {rule.metadata.arch_context && (
                                                <Badge variant="outline" className="bg-zinc-800/60 text-zinc-300 border-zinc-700/50">
                                                  Architecture: {rule.metadata.arch_context}
                                                </Badge>
                                              )}
                                              <Badge variant="outline" className={`${severityColors.bg}/10 ${severityColors.text} border-${severityColors.border}/20`}>
                                                Severity: {rule.metadata.severity}
                                              </Badge>
                                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                Matches: {rule.match_count}
                                              </Badge>
                                            </div>
                                          </div>
                                          
                                          {/* Metadata Details */}
                                          <div className="bg-zinc-900/40 rounded-lg p-4 border border-zinc-800/50">
                                            <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                                              <Info size={16} className="text-zinc-400" />
                                              Rule Metadata
                                            </h5>
                                            
                                            <div className="space-y-2 text-sm">
                                              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                <span className="text-zinc-400">ID:</span>
                                                <span className="text-zinc-300 font-mono text-xs col-span-2 break-all">{rule.metadata.id}</span>
                                              </div>
                                              
                                              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                <span className="text-zinc-400">Author:</span>
                                                <span className="text-zinc-300 col-span-2">{rule.metadata.author}</span>
                                              </div>
                                              
                                              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                <span className="text-zinc-400">Created:</span>
                                                <span className="text-zinc-300 col-span-2">{rule.metadata.creation_date}</span>
                                              </div>
                                              
                                              {rule.metadata.last_modified && (
                                                <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                  <span className="text-zinc-400">Modified:</span>
                                                  <span className="text-zinc-300 col-span-2">{rule.metadata.last_modified}</span>
                                                </div>
                                              )}
                                              
                                              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                <span className="text-zinc-400">License:</span>
                                                <span className="text-zinc-300 col-span-2">{rule.metadata.license}</span>
                                              </div>
                                              
                                              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                <span className="text-zinc-400">Fingerprint:</span>
                                                <span className="text-zinc-300 font-mono text-xs col-span-2 break-all">{rule.metadata.fingerprint}</span>
                                              </div>
                                              
                                              {rule.metadata.reference_sample && (
                                                <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                  <span className="text-zinc-400">Reference:</span>
                                                  <span className="text-zinc-300 font-mono text-xs col-span-2 break-all">{rule.metadata.reference_sample}</span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {rule.metadata.scan_context && (
                                              <div className="mt-4 pt-2">
                                                <Badge className="bg-zinc-800 hover:bg-zinc-800 text-zinc-300">
                                                  Scan Context: {rule.metadata.scan_context}
                                                </Badge>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </div>
                                  </AccordionItem>
                                </Accordion>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="bg-black/40 backdrop-blur-md border border-zinc-800/50">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No Threats Detected</h3>
                  <p className="text-zinc-400 max-w-sm">
                    No suspicious patterns were detected in this file according to the YARA ruleset.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
