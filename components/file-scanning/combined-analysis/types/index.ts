// Import types from YARA scanning and PE analysis modules
import { YaraMatch } from "../../yara-scanning/types";
import { PEAnalysisResult as OriginalPEAnalysisResult } from "../../pe-analysis/utils/pe-parser";

// Just use the imported type directly
export type PEAnalysisResult = OriginalPEAnalysisResult;

export interface CombinedAnalysisProps {
  file: File | null;
  peData: PEAnalysisResult | null;
  yaraMatches: YaraMatch[];
  isPELoading: boolean;
  isYaraLoading: boolean;
  peError: string | null;
  yaraError: string | null;
}

export interface ThreatAssessment {
  score: number; // 0-100
  level: "low" | "medium" | "high" | "critical";
  summary: string;
  details: string[];
}