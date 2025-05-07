import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, Shield, ShieldCheck, Info, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreatAssessment } from "../types";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ThreatSummaryProps {
  assessment: ThreatAssessment;
  yaraMatches?: {
    rule: string;
    severity: string;
    threat_name?: string;
    description?: string;
  }[];
}

export const ThreatSummary: React.FC<ThreatSummaryProps> = ({ assessment, yaraMatches = [] }) => {
  const { score, level, summary, details } = assessment;
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  
  // Count matches by severity
  const severityCounts = {
    high: yaraMatches.filter(match => match.severity === "high").length,
    medium: yaraMatches.filter(match => match.severity === "medium").length,
    low: yaraMatches.filter(match => match.severity === "low").length,
  };
  
  // Group matches by threat type/name
  const threatGroups = yaraMatches.reduce((groups, match) => {
    const name = match.threat_name || match.rule;
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(match);
    return groups;
  }, {} as Record<string, typeof yaraMatches>);
  
  const getIcon = () => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case "high":
        return <ShieldAlert className="h-8 w-8 text-amber-500" />;
      case "medium":
        return <Shield className="h-8 w-8 text-yellow-500" />;
      case "low":
      default:
        return <ShieldCheck className="h-8 w-8 text-green-500" />;
    }
  };
  
  const getBgColor = () => {
    switch (level) {
      case "critical":
        return "from-red-900/20 to-black/80";
      case "high":
        return "from-amber-900/20 to-black/80";
      case "medium":
        return "from-yellow-900/20 to-black/80";
      case "low":
      default:
        return "from-green-900/20 to-black/80";
    }
  };
  
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low":
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg text-card-foreground shadow-xl overflow-hidden backdrop-blur-md border border-zinc-800/50 p-6 bg-gradient-to-br ${getBgColor()}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={`p-3 rounded-lg bg-${level === "critical" ? "red" : level === "high" ? "amber" : level === "medium" ? "yellow" : "green"}-500/10 border border-${level === "critical" ? "red" : level === "high" ? "amber" : level === "medium" ? "yellow" : "green"}-500/30`}>
          {getIcon()}
        </motion.div>
        <div>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-medium text-white"
          >
            {summary}
          </motion.h3>
          <p className="text-zinc-400 mt-1">Combined analysis of PE structure and YARA patterns</p>
        </div>
        <motion.div 
          className="md:ml-auto flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-20 h-20 rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#444"
                strokeWidth="1"
                strokeDasharray="100, 100"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={level === "critical" ? "#ef4444" : level === "high" ? "#f59e0b" : level === "medium" ? "#eab308" : "#22c55e"}
                strokeWidth="4"
                strokeDasharray="100, 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - score }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            >
              <span className="text-2xl font-bold text-white glow-text">{score}</span>
            </motion.div>
          </div>
          <span className="text-xs text-zinc-400 mt-1">Threat Score</span>
        </motion.div>
      </div>
      
      {/* Threat statistics */}
      {yaraMatches.length > 0 && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
        >
          {severityCounts.high > 0 && (
            <motion.div 
              variants={itemVariants}
              
              className="rounded-lg text-card-foreground shadow-md overflow-hidden backdrop-blur-md bg-black/60 border border-zinc-800/50 p-4 flex items-center justify-between"
              style={{ 
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <div>
                <p className="text-xs text-red-400/80 uppercase tracking-wider">High Severity</p>
                <h4 className="text-2xl font-bold text-red-400">{severityCounts.high}</h4>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </motion.div>
          )}
          
          {severityCounts.medium > 0 && (
            <motion.div 
              variants={itemVariants}
              
              className="rounded-lg text-card-foreground shadow-md overflow-hidden backdrop-blur-md bg-black/60 border border-zinc-800/50 p-4 flex items-center justify-between"
              style={{ 
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <div>
                <p className="text-xs text-amber-400/80 uppercase tracking-wider">Medium Severity</p>
                <h4 className="text-2xl font-bold text-amber-400">{severityCounts.medium}</h4>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
            </motion.div>
          )}
          
          {severityCounts.low > 0 && (
            <motion.div 
              variants={itemVariants}
              
              className="rounded-lg text-card-foreground shadow-md overflow-hidden backdrop-blur-md bg-black/60 border border-zinc-800/50 p-4 flex items-center justify-between"
              style={{ 
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <div>
                <p className="text-xs text-blue-400/80 uppercase tracking-wider">Low Severity</p>
                <h4 className="text-2xl font-bold text-blue-400">{severityCounts.low}</h4>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      
      
      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 10px ${level === "critical" ? "rgba(239, 68, 68, 0.7)" : 
                       level === "high" ? "rgba(245, 158, 11, 0.7)" : 
                       level === "medium" ? "rgba(234, 179, 8, 0.7)" : 
                       "rgba(34, 197, 94, 0.7)"};
        }
      `}</style>
    </motion.div>
  );
};