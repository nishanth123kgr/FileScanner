export interface YaraMatch {
  rule: string;
  description: string;
  severity: "high" | "medium" | "low";
  matches: string[];
  offset: number;
}

export interface YaraScanProps {
  file: File | null;
}

export interface YaraScanResult {
  matches: YaraMatch[];
  scanTime: string;
  rulesApplied: number;
}