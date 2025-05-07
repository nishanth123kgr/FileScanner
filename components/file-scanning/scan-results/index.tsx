"use client"

import React, { useState, useEffect } from "react";
import CombinedAnalysis from "../combined-analysis";
import { YaraMatch } from "../yara-scanning/types";
import { PEAnalysisResult } from "../pe-analysis/utils/pe-parser";
import { computeFileHashes, FileData, FileHashes } from "./utils/file-utils";

interface ScanResultsProps {
  file: File | null;
  fileData?: FileData;
  peData?: PEAnalysisResult | null;
  yaraData?: any; // Added yaraData prop to receive YARA results from parent
}

export default function ScanResults({ file, fileData, peData, yaraData }: ScanResultsProps) {
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

  // Effect to load YARA data from props or session storage
  useEffect(() => {
    if (file) {
      if (yaraData) {
        // If yaraData is provided as a prop, use it
        if (yaraData.matched_rules) {
          // Convert matched_rules to YaraMatch[] format with proper transformation
          const matches: YaraMatch[] = yaraData.matched_rules.map((rule: any, index: number) => ({
            rule: rule.rule_name,
            description: rule.metadata?.description,
            severity: getSeverityFromValue(rule.metadata?.severity),
            matches: rule.matches?.map((m: any) => `Offset ${m.position}: ${m.data}`).filter((m: string) => m) || [],
            offset: rule.matches?.[0]?.position || 0,
            matchCount: rule.match_count || rule.matches?.length || 0,
            threatName: rule.metadata?.threat_name || rule.rule_name,
            author: rule.metadata?.author,
            creationDate: rule.metadata?.creation_date,
            archContext: rule.metadata?.arch_context,
            scanContext: rule.metadata?.scan_context,
            metadata: rule.metadata || {}
          }));
          setYaraMatches(matches);
          setIsYaraLoading(false);
        }
      } else {
        // Try to get YARA data from session storage if not provided via props
        const storedData = sessionStorage.getItem('yaraResults');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            if (parsedData.matched_rules) {
              // Convert matched_rules to YaraMatch[] format with proper transformation
              const matches: YaraMatch[] = parsedData.matched_rules.map((rule: any, index: number) => ({
                rule: rule.rule_name,
                description: rule.metadata?.description,
                severity: getSeverityFromValue(rule.metadata?.severity),
                matches: rule.matches?.map((m: any) => `Offset ${m.position}: ${m.data}`).filter((m: string) => m) || [],
                offset: rule.matches?.[0]?.position || 0,
                matchCount: rule.match_count || rule.matches?.length || 0,
                threatName: rule.metadata?.threat_name || rule.rule_name,
                author: rule.metadata?.author,
                creationDate: rule.metadata?.creation_date,
                archContext: rule.metadata?.arch_context,
                scanContext: rule.metadata?.scan_context,
                metadata: rule.metadata || {}
              }));
              setYaraMatches(matches);
            }
          } catch (error) {
            console.error("Error parsing stored YARA results:", error);
          }
        }
        setIsYaraLoading(false);
      }
    }
  }, [file, yaraData]);

  // Helper function to convert numeric severity to string category
  const getSeverityFromValue = (value: string): "high" | "medium" | "low" => {
    const num = parseInt(value) || 0;
    if (num >= 80) return "high";
    if (num >= 30) return "medium";
    return "low";
  };

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
