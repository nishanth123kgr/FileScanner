"use client"

import React, { useState, useEffect } from "react";
import CombinedAnalysis from "../combined-analysis";
import { YaraMatch } from "../yara-scanning/types";
import { PEAnalysisResult } from "../pe-analysis/utils/pe-parser";
import { scanFileWithYara } from "../yara-scanning/utils/yara-scanner";
import { computeFileHashes, FileData, FileHashes } from "./utils/file-utils";

interface ScanResultsProps {
  file: File | null;
  fileData?: FileData;
  peData?: PEAnalysisResult | null;
}

export default function ScanResults({ file, fileData, peData }: ScanResultsProps) {
  const [yaraMatches, setYaraMatches] = useState<YaraMatch[]>([]);
  const [isYaraLoading, setIsYaraLoading] = useState<boolean>(false);
  const [yaraError, setYaraError] = useState<string | null>(null);
  const [fileHashes, setFileHashes] = useState<FileHashes | null>(null);

  // Effect to compute hashes when file changes
  useEffect(() => {
    const getHashes = async () => {
      if (file) {
        const hashes = await computeFileHashes(file);
        setFileHashes(hashes);
      }
    };
    
    getHashes();
  }, [file]);

  // For YARA scanning functionality - can be implemented later if needed
  const isPELoading = false;
  const peError = null;



  return (
    <div className="space-y-8">
      <CombinedAnalysis
        file={file}
        peData={peData || null}
        yaraMatches={yaraMatches}
        isPELoading={isPELoading}
        isYaraLoading={isYaraLoading}
        peError={peError}
        yaraError={yaraError}
      />
    </div>
  );
}
