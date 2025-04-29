import { YaraMatch } from "../../yara-scanning/types";
import { PEAnalysisResult, ThreatAssessment } from "../types";

// Function to evaluate threat level based on combined PE and YARA results
export const evaluateThreatLevel = (
  peData: PEAnalysisResult | null, 
  yaraMatches: YaraMatch[]
): ThreatAssessment => {
  let score = 0;
  const details: string[] = [];
  
  // Calculate score based on YARA matches
  if (yaraMatches.length > 0) {
    const severityScores = {
      high: 30,
      medium: 15,
      low: 5
    };
    
    yaraMatches.forEach(match => {
      score += severityScores[match.severity] || 0;
      details.push(`YARA rule "${match.rule}" triggered (${match.severity} severity)`);
    });
  }
  
  // Add additional score based on PE analysis if available
  if (peData) {
    // Check for suspicious sections
    // PE characteristics are bit flags:
    // IMAGE_SCN_MEM_EXECUTE = 0x20000000
    // IMAGE_SCN_MEM_WRITE = 0x80000000
    const suspiciousSections = peData.sections.filter(section => {
      return (section.characteristics & 0x20000000) !== 0 && // EXECUTE
             (section.characteristics & 0x80000000) !== 0 && // WRITE
             parseFloat(section.entropy as string) > 7.0;
    });
    
    if (suspiciousSections.length > 0) {
      score += 20;
      details.push(`Found ${suspiciousSections.length} section(s) with both EXECUTE and WRITE permissions and high entropy`);
    }
    
    // Check for suspicious imports
    const suspiciousImports = (peData.imports || []).filter(imp => {
      return imp.functions.some(fn => 
        /VirtualAlloc|WriteProcessMemory|CreateProcess|WinExec|ShellExecute|URLDownload/i.test(fn)
      );
    });
    
    if (suspiciousImports.length > 0) {
      score += 15;
      details.push(`Found suspicious imports commonly used by malware`);
    }
  }
  
  // Cap the score at 100
  score = Math.min(score, 100);
  
  // Determine threat level
  let level: "low" | "medium" | "high" | "critical";
  let summary: string;
  
  if (score >= 75) {
    level = "critical";
    summary = "Critical security threat detected";
  } else if (score >= 50) {
    level = "high";
    summary = "High security risk detected";
  } else if (score >= 25) {
    level = "medium";
    summary = "Moderate security concerns found";
  } else {
    level = "low";
    summary = "Low risk assessment";
  }
  
  return {
    score,
    level,
    summary,
    details
  };
};