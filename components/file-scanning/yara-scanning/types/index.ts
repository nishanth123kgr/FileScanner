export interface YaraMetadata {
  author?: string;
  creation_date?: string;
  last_modified?: string;
  description?: string;
  threat_name?: string;
  reference_sample?: string;
  severity?: string;
  arch_context?: string;
  scan_context?: string;
  id?: string;
  fingerprint?: string;
  license?: string;
  [key: string]: string | undefined;
}

export interface YaraMatch {
  rule: string;
  description: string;
  severity: "high" | "medium" | "low";
  matches: string[];
  offset: number;
  matchCount?: number;
  threatName?: string;
  author?: string;
  creationDate?: string;
  archContext?: string;
  scanContext?: string;
  metadata?: YaraMetadata;
}

export interface YaraScanProps {
  file: File | null;
}

export interface YaraScanResult {
  matches: YaraMatch[];
  scanTime: string;
  rulesApplied: number;
}