import React, { useState } from "react";
import { Shield, AlertCircle, FileWarning, Info, Calendar, User, Fingerprint, CheckCircle, AlertTriangle, Filter, RefreshCw, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { YaraMatch } from "../types";
import { ScanHeader } from "./ScanHeader";
import { ScanProgress } from "./ScanProgress";
import { ScanError } from "./ScanError";
import { MatchesList } from "./MatchesList";
import { ScanInformation } from "./ScanInformation";

interface ExtendedYaraScanProps {
  file: File | null;
  yaraData?: any;
  isScanning: boolean;
  error: string | null;
  onScan: () => void;
}

export const YaraResults: React.FC<ExtendedYaraScanProps> = ({ 
  file, 
  yaraData, 
  isScanning, 
  error, 
  onScan 
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [scanProgress, setScanProgress] = useState<number>(isScanning ? 50 : 0);
  const [filterOption, setFilterOption] = useState<string>("severity");
  const [currentChunk, setCurrentChunk] = useState<number>(1);
  const [totalChunks, setTotalChunks] = useState<number>(2);
  
  // Function to check if YARA scan has matches
  const hasMatches = yaraData?.matched_rules?.length > 0;
  
  // Get YARA matches in our format for filtering
  const getYaraMatchesArray = (): YaraMatch[] => {
    if (!yaraData?.matched_rules) return [];
    
    return yaraData.matched_rules.map((rule: any) => ({
      rule: rule.rule_name,
      description: rule.metadata?.description || "No description",
      severity: getSeverityFromValue(rule.metadata?.severity),
      matches: rule.matches?.map((m: any) => `Offset ${m.position}: ${m.data}`).filter((m: string) => m) || [],
      offset: rule.matches?.[0]?.position || 0,
      metadata: rule.metadata || {}
    }));
  };

  // Convert numeric severity to string category
  const getSeverityFromValue = (value: string): "high" | "medium" | "low" => {
    const num = parseInt(value) || 0;
    if (num >= 80) return "high";
    if (num >= 30) return "medium";
    return "low";
  };

  // Get severity text based on numeric value
  const getSeverityText = (severity: string | number) => {
    const sevNum = typeof severity === 'string' ? parseInt(severity) : severity;
    if (sevNum >= 80) return "Critical";
    if (sevNum >= 60) return "High";
    if (sevNum >= 30) return "Medium";
    return "Low";
  };
  
  // Function to get severity styling based on severity value
  const getSeverityColor = (severity: string | number) => {
    const sevNum = typeof severity === 'string' ? parseInt(severity) : severity;
    
    if (sevNum >= 80) return { bg: "bg-red-500", text: "text-red-500", border: "border-red-500", hover: "hover:bg-red-500/10" };
    if (sevNum >= 60) return { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500", hover: "hover:bg-orange-500/10" };
    if (sevNum >= 30) return { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500", hover: "hover:bg-amber-500/10" };
    return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", hover: "hover:bg-blue-500/10" };
  };
  
  // Get all YARA matches
  const yaraMatches = getYaraMatchesArray();
  
  // Filter matches based on selected tab
  const getFilteredRules = () => {
    if (!yaraData?.matched_rules) return [];
    
    if (activeTab === "all") return yaraData.matched_rules;
    
    return yaraData.matched_rules.filter((rule: any) => {
      const severityNum = parseInt(rule.metadata?.severity) || 0;
      
      switch (activeTab) {
        case "critical": return severityNum >= 80;
        case "high": return severityNum >= 60 && severityNum < 80;
        case "medium": return severityNum >= 30 && severityNum < 60;
        case "low": return severityNum < 30;
        default: return true;
      }
    });
  };

  // Sort and filter rules based on options
  const getSortedRules = () => {
    const filteredRules = getFilteredRules();
    
    switch (filterOption) {
      case "severity":
        return [...filteredRules].sort((a, b) => 
          (parseInt(b.metadata?.severity) || 0) - (parseInt(a.metadata?.severity) || 0)
        );
      case "matches":
        return [...filteredRules].sort((a, b) => (b.matches?.length || 0) - (a.matches?.length || 0));
      case "name":
        return [...filteredRules].sort((a, b) => a.rule_name.localeCompare(b.rule_name));
      case "date":
        return [...filteredRules].sort((a, b) => {
          const dateA = a.metadata?.creation_date || "";
          const dateB = b.metadata?.creation_date || "";
          return dateB.localeCompare(dateA);
        });
      default:
        return filteredRules;
    }
  };

  // Get sorted rules
  const sortedRules = getSortedRules();
  
  // Calculate statistics for dashboard
  const totalThreats = yaraData?.matched_rules?.length || 0;
  const criticalThreats = yaraData?.matched_rules?.filter((rule: any) => 
    parseInt(rule.metadata?.severity) >= 80).length || 0;
  
  // Group rules by threat category for visualization
  const threatCategories: Record<string, number> = {};
  yaraData?.matched_rules?.forEach((rule: any) => {
    const threatName = rule.metadata?.threat_name || "Unknown";
    if (!threatCategories[threatName]) threatCategories[threatName] = 0;
    threatCategories[threatName]++;
  });

  // Calculate total match count for all rules
  const totalMatchCount = yaraData?.matched_rules?.reduce((total: number, rule: any) => 
    total + (rule.matches?.length || 0), 0) || 0;

  return (
    <div className="space-y-6 w-full max-w-full">
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
                  onClick={onScan}
                  className="flex items-center gap-2 bg-zinc-900/50 text-white border-zinc-700 hover:bg-zinc-800"
                >
                  <RefreshCw size={16} />
                  {yaraData ? "Rescan File" : "Start Scan"}
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
                  Processed {currentChunk} of {totalChunks} chunks
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
          {hasMatches ? (
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
                          {sortedRules.map((rule: any, index: number) => {
                            const severityLevel = parseInt(rule.metadata?.severity) || 0;
                            const severityColors = getSeverityColor(severityLevel);
                            const severityText = getSeverityText(severityLevel);
                            
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
                                                {severityText} ({rule.metadata?.severity || 0})
                                              </Badge>
                                            </h4>
                                            <p className="text-sm text-zinc-400 mt-1">
                                              {rule.metadata?.threat_name || rule.metadata?.description || "Potential threat detected"}
                                            </p>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 lg:gap-6 mt-2 lg:mt-0">
                                            <div className="flex items-center gap-1.5">
                                              <Fingerprint className="h-4 w-4 text-blue-400" />
                                              <span className="text-sm font-medium text-blue-400">
                                                {rule.matches?.length || 0}
                                              </span>
                                            </div>
                                            
                                            {rule.metadata?.author && (
                                              <div className="flex items-center gap-1.5">
                                                <User className="h-4 w-4 text-zinc-500" />
                                                <span className="text-sm text-zinc-400">{rule.metadata.author}</span>
                                              </div>
                                            )}
                                            
                                            {rule.metadata?.creation_date && (
                                              <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-zinc-500" />
                                                <span className="text-sm text-zinc-400">{rule.metadata.creation_date}</span>
                                              </div>
                                            )}
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
                                            {/* Tooltip information moved here */}
                                            <div className="flex flex-wrap gap-3 mb-4">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1.5 cursor-help">
                                                      <Fingerprint className="h-4 w-4 text-blue-400" />
                                                      <span className="text-sm font-medium text-blue-400">
                                                        {rule.matches?.length || 0} matches
                                                      </span>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                    {rule.matches?.length || 0} matches found
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                              
                                              {rule.metadata?.author && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <div className="flex items-center gap-1.5 cursor-help">
                                                        <User className="h-4 w-4 text-zinc-500" />
                                                        <span className="text-sm text-zinc-400">{rule.metadata.author}</span>
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                      Rule author
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                              
                                              {rule.metadata?.creation_date && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <div className="flex items-center gap-1.5 cursor-help">
                                                        <Calendar className="h-4 w-4 text-zinc-500" />
                                                        <span className="text-sm text-zinc-400">{rule.metadata.creation_date}</span>
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                      Rule creation date
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                            </div>

                                            <div className="flex items-start gap-3 mb-4">
                                              <div className={`p-2 rounded-full ${severityColors.bg}/20`}>
                                                <AlertTriangle className={`h-5 w-5 ${severityColors.text}`} />
                                              </div>
                                              <div>
                                                <h5 className="font-medium text-white">Threat Summary</h5>
                                                <p className={`text-sm ${severityColors.text} mt-1`}>
                                                  {rule.metadata?.threat_name || rule.rule_name}
                                                </p>
                                              </div>
                                            </div>
                                            
                                            <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
                                              {rule.metadata?.description || 
                                                `This file contains patterns consistent with ${rule.metadata?.threat_name || rule.rule_name}, which was detected by the "${rule.rule_name}" YARA rule. This may indicate malicious content or potentially unwanted behavior.`}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-2 mt-4">
                                              {rule.metadata?.arch_context && (
                                                <Badge variant="outline" className="bg-zinc-800/60 text-zinc-300 border-zinc-700/50">
                                                  Architecture: {rule.metadata.arch_context}
                                                </Badge>
                                              )}
                                              <Badge variant="outline" className={`${severityColors.bg}/10 ${severityColors.text} border-${severityColors.border}/20`}>
                                                Severity: {rule.metadata?.severity}
                                              </Badge>
                                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                Matches: {rule.matches?.length || 0}
                                              </Badge>
                                            </div>
                                          </div>
                                          
                                          {/* Rule Details and Match Data */}
                                          <div className="bg-zinc-900/40 rounded-lg p-4 border border-zinc-800/50">
                                            <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                                              <Info size={16} className="text-zinc-400" />
                                              Match Details
                                            </h5>
                                            
                                            <div className="space-y-2">
                                              {rule.metadata && Object.keys(rule.metadata).map((key) => (
                                                rule.metadata[key] && (
                                                  <div key={key} className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/50">
                                                    <span className="text-zinc-400 text-xs">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-zinc-300 col-span-2 text-xs break-all">
                                                      {rule.metadata[key].toString()}
                                                    </span>
                                                  </div>
                                                )
                                              ))}
                                            </div>
                                            
                                            {rule.matches && rule.matches.length > 0 && (
                                              <div className="mt-4 pt-2">
                                                <h5 className="font-medium text-white mb-2 text-sm">Match Offsets</h5>
                                                <div className="bg-black/30 rounded p-2 max-h-36 overflow-y-auto font-mono text-xs text-zinc-400">
                                                  {rule.matches.map((match: string, i: number) => (
                                                    <div key={i} className="py-1 border-b border-zinc-800/40 last:border-0">
                                                      {match}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </div>
                                  </AccordionItem>
                                </Accordion>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ) : yaraData ? (
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
          ) : file ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="bg-black/40 backdrop-blur-md border border-zinc-800/50">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Ready to Scan</h3>
                  <p className="text-zinc-400 max-w-sm mb-6">
                    Click the Scan button to analyze this file for malicious patterns using YARA rules.
                  </p>
                  <Button 
                    onClick={onScan}
                    className="bg-amber-600 hover:bg-amber-500 text-white border-0"
                  >
                    Start YARA Scan
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : null}
        </>
      )}
      
      {/* Scan Information Section (shown when scan is complete) */}
      {yaraData && !isScanning && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-black/40 backdrop-blur-md border border-zinc-800/50">
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                Scan Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Scan Time</span>
                    <span className="text-sm text-zinc-300">
                      {yaraData.scanTime || new Date().toISOString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">YARA Rules Applied</span>
                    <span className="text-sm text-zinc-300">
                      {yaraData.rulesApplied || "Default ruleset"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">File Information</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">Name</span>
                      <span className="text-sm text-zinc-300">{file?.name || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">Size</span>
                      <span className="text-sm text-zinc-300">
                        {file ? `${(file.size / 1024).toFixed(2)} KB` : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
