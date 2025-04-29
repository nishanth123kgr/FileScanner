import React from "react";
import { AlertTriangle, ShieldAlert, Shield, ShieldCheck } from "lucide-react";
import { ThreatAssessment } from "../types";

interface ThreatSummaryProps {
  assessment: ThreatAssessment;
}

export const ThreatSummary: React.FC<ThreatSummaryProps> = ({ assessment }) => {
  const { score, level, summary, details } = assessment;
  
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
  
  const getScoreColor = () => {
    switch (level) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-amber-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
      default:
        return "bg-green-500";
    }
  };
  
  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br ${getBgColor()} backdrop-blur-xl border border-zinc-800/50`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-lg bg-${level === "critical" ? "red" : level === "high" ? "amber" : level === "medium" ? "yellow" : "green"}-500/10 border border-${level === "critical" ? "red" : level === "high" ? "amber" : level === "medium" ? "yellow" : "green"}-500/30`}>
          {getIcon()}
        </div>
        <div>
          <h3 className="text-xl font-medium text-white">{summary}</h3>
          <p className="text-zinc-400 mt-1">Combined analysis of PE structure and YARA patterns</p>
        </div>
        <div className="ml-auto flex flex-col items-center">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-16 h-16 rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#444"
                strokeWidth="1"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={level === "critical" ? "#ef4444" : level === "high" ? "#f59e0b" : level === "medium" ? "#eab308" : "#22c55e"}
                strokeWidth="4"
                strokeDasharray={`${score}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {score}
            </div>
          </div>
          <span className="text-xs text-zinc-400 mt-1">Threat Score</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="text-white font-medium">Detection Details</h4>
        <div className="bg-black/30 border border-zinc-800/50 rounded-lg p-3 max-h-48 overflow-y-auto">
          {details.length > 0 ? (
            <ul className="space-y-2">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-zinc-300">
                  <span className="text-zinc-500">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500">No specific threat details identified</p>
          )}
        </div>
      </div>
    </div>
  );
};