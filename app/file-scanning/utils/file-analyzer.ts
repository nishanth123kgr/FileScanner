// File analysis utility functions
import { analyzePEFile, type PEAnalysisResult, adaptNewPEFormat } from "@/components/file-scanning/pe-analysis/utils/pe-parser";
import { analyzePEWithWasm } from "@/components/file-scanning/pe-analysis/utils/pe-wasm-loader";
import { LARGE_FILE_THRESHOLD, PE_ANALYSIS_CHUNK_SIZE } from "../types";
import { isPEFile } from "./file-utils";

type ProgressCallback = (progress: number) => void;

/**
 * Handles progressive file analysis for both normal and large files
 */
export const analyzeFileProgressively = async (
  file: File, 
  updateProgress: ProgressCallback
): Promise<{ 
  isPEFile: boolean; 
  isLargeFile: boolean;
  peAnalysisData: PEAnalysisResult | null;
  parseError: string | null;
}> => {
  try {
    // Initial processing steps - 10%
    updateProgress(10);

    // Determine if this is a PE file
    const isPE = await isPEFile(file);
    updateProgress(20);

    // Check if this is a large file
    const largeFile = file.size > LARGE_FILE_THRESHOLD;
    updateProgress(30);

    let peAnalysisData: PEAnalysisResult | null = null;
    let parseError: string | null = null;

    if (isPE) {
      try {
        updateProgress(40);
        
        // Use the WebAssembly-based analyzer for better performance and more detailed analysis
        const rawPeAnalysisResult = await analyzePEWithWasm(file);
        updateProgress(70);
        
        // Adapt the new PE format to match the expected structure
        const peAnalysisResult = adaptNewPEFormat(rawPeAnalysisResult);
        updateProgress(80);
        
        peAnalysisData = peAnalysisResult;

        // For large files, add a note but still process them (WebAssembly is more efficient)
        if (largeFile) {
          parseError = "Large PE file: Analysis performed with WebAssembly for better performance.";
        }

        // Store limited analysis results in session storage
        try {
          // To avoid exceeding storage limits, store only essential data
          const essentialData = {
            file_size: peAnalysisResult.file_size,
            machine_type: peAnalysisResult.machine_type,
            timestamp: peAnalysisResult.timestamp,
            sections: peAnalysisResult.sections.map(s => ({
              name: s.name,
              virtual_address: s.virtual_address,
              virtual_size: s.virtual_size,
              raw_size: s.raw_size,
              entropy: s.entropy
            }))
          };
          sessionStorage.setItem('peAnalysis', JSON.stringify(essentialData));
        } catch (storageError) {
          console.warn("Could not store PE analysis in session storage:", storageError);
        }
      } catch (error) {
        console.error("Error with WebAssembly PE analysis, falling back to legacy analyzer:", error);
        
        // Fall back to the legacy PE analyzer if WebAssembly fails
        if (!largeFile) {
          // For smaller PE files, process normally with legacy analyzer
          updateProgress(40);
          const arrayBuffer = await file.arrayBuffer();
          updateProgress(50);
          const peAnalysisResult = await analyzePEFile(arrayBuffer);
          updateProgress(80);
          peAnalysisData = peAnalysisResult;

          // Store limited analysis results in session storage
          try {
            // To avoid exceeding storage limits, store only essential data
            const essentialData = {
              file_size: peAnalysisResult.file_size,
              machine_type: peAnalysisResult.machine_type,
              timestamp: peAnalysisResult.timestamp,
              sections: peAnalysisResult.sections.map(s => ({
                name: s.name,
                virtual_address: s.virtual_address,
                virtual_size: s.virtual_size,
                raw_size: s.raw_size,
                entropy: s.entropy
              }))
            };
            sessionStorage.setItem('peAnalysis', JSON.stringify(essentialData));
          } catch (storageError) {
            console.warn("Could not store PE analysis in session storage:", storageError);
          }
        }
        else {
          // For large PE files, do basic header analysis only initially using legacy analyzer
          updateProgress(40);

          // Read just the first chunk for basic analysis
          const headerChunkBlob = file.slice(0, PE_ANALYSIS_CHUNK_SIZE);
          const headerChunkBuffer = await headerChunkBlob.arrayBuffer();
          updateProgress(60);

          try {
            // Analyze just the headers without full section data
            const basicPeAnalysisResult = await analyzePEFile(headerChunkBuffer);

            // Keep limited information to avoid memory issues
            const limitedResult: PEAnalysisResult = {
              file_size: file.size,
              machine_type: basicPeAnalysisResult.machine_type,
              timestamp: basicPeAnalysisResult.timestamp,
              sections: basicPeAnalysisResult.sections.slice(0, 5), // Limit sections
              dosHeader: basicPeAnalysisResult.dosHeader,
              ntFileHeader: basicPeAnalysisResult.ntFileHeader,
              ntOptionalHeader: basicPeAnalysisResult.ntOptionalHeader
            };

            peAnalysisData = limitedResult;
            updateProgress(80);

            // Store warning about large file
            parseError = "Large PE file: Only header information analyzed. WebAssembly analysis failed, and full section analysis would be too resource-intensive for the browser.";
          } catch (fallbackError) {
            console.error("Error during basic PE header analysis:", fallbackError);
            parseError = fallbackError instanceof Error ? fallbackError.message : "Unknown error during PE analysis";
          }
        }
      }
    }
    else {
      // For non-PE files
      updateProgress(50);

      try {
        // Import here to avoid circular dependencies
        const { computeFileHashes } = await import('@/components/file-scanning/scan-results/utils/hash-utils');

        // Compute file hashes
        const hashResults = await computeFileHashes(file);

        // Store hash results in session storage for later use
        if (hashResults) {
          try {
            sessionStorage.setItem('fileHashes', JSON.stringify(hashResults));
          } catch (storageError) {
            console.warn("Could not store file hashes in session storage:", storageError);
          }
        }

        updateProgress(80);
      } catch (error) {
        console.error("Error during file hash computation:", error);
        parseError = error instanceof Error ? error.message : "Unknown error during file analysis";
        updateProgress(80);
      }
    }

    // Final processing
    updateProgress(100);
    
    return {
      isPEFile: isPE,
      isLargeFile: largeFile,
      peAnalysisData,
      parseError
    };
  } catch (error) {
    console.error("Error during progressive file analysis:", error);
    updateProgress(100);
    
    return {
      isPEFile: false,
      isLargeFile: false,
      peAnalysisData: null,
      parseError: error instanceof Error ? error.message : "Unknown error during file analysis"
    };
  }
};