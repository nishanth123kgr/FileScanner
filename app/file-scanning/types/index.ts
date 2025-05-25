// File scanning types

// Type for the active tab in file scanning
export type FileTabType = "upload" | "results" | "pe-analysis" | "yara" | "hex";

// Type for file metadata
export interface FileData {
  fileName: string;
  fileType: string;
  fileSize: string;
}

// Type for scan state
export interface ScanState {
  fileSelected: boolean;
  fileName: string;
  fileType: string;
  fileSize: string;
  scanComplete: boolean;
  scanning: boolean;
  progress: number;
  file: File | null;
  isPEFile: boolean;
  isLargeFile: boolean;
}

// Import relevant types from components to re-export
import { PEAnalysisResult } from '@/components/file-scanning/pe-analysis/utils/pe-parser';
export type { PEAnalysisResult };

// Constants for file processing
export const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
export const PE_ANALYSIS_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB for progressive PE analysis