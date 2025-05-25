"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FileSearch, Shield, AlertCircle } from "lucide-react";

import PEAnalysis from "../pe-analysis";
import { ThreatSummary } from "./components/ThreatSummary";
import { evaluateThreatLevel } from "./utils/threat-assessment";
import { YaraMatch } from "../yara-scanning/types";
import { PEAnalysisResult, ThreatAssessment } from "./types";
import { isPEFile } from "@/app/file-scanning";
import { YaraResults } from "../yara-scanning/components/YaraResults";

interface CombinedAnalysisProps {
    file: File | null;
    peData: PEAnalysisResult | null;
    yaraMatches: YaraMatch[];
    isPELoading: boolean;
    isYaraLoading: boolean;
    peError: string | null;
    yaraError: string | null;
}

export default function CombinedAnalysis({
    file,
    peData,
    yaraMatches,
    isPELoading,
    isYaraLoading,
    peError,
    yaraError
}: CombinedAnalysisProps) {
    const [threatAssessment, setThreatAssessment] = useState<ThreatAssessment>({
        score: 0,
        level: "low",
        summary: "Analysis pending",
        details: []
    });
    const [isPEFileType, setIsPEFileType] = useState<boolean>(false);
    
    // Convert yaraMatches array to yaraData format for YaraResults component
    const yaraData = yaraMatches?.length > 0 ? {
        matched_rules: yaraMatches.map(match => ({
            rule_name: match.rule,
            metadata: {
                description: match.description,
                severity: match.severity === "high" ? "80" : match.severity === "medium" ? "50" : "20",
                threat_name: match.threatName || match.rule,
                author: match.metadata?.author || "Unknown",
                creation_date: match.metadata?.creation_date || new Date().toISOString().split('T')[0],
                last_modified: match.metadata?.last_modified,
                id: match.metadata?.id || crypto.randomUUID().slice(0, 8),
                fingerprint: match.metadata?.fingerprint,
                reference_sample: match.metadata?.reference_sample,
                arch_context: match.metadata?.arch_context || "x86",
                scan_context: match.metadata?.scan_context || "file",
                license: match.metadata?.license || "Default License"
            },
            matches: match.matches?.map(m => ({ data: m, position: match.offset })) || [],
            match_count: match.matchCount || match.matches?.length || 0
        })),
        scanTime: new Date().toISOString(),
        rulesApplied: "Default ruleset"
    } : { matched_rules: [] };

    // Check if file is a PE file
    useEffect(() => {
        const checkIsPEFile = async () => {
            if (file) {
                const isPE = await isPEFile(file);
                setIsPEFileType(isPE);
            } else {
                setIsPEFileType(false);
            }
        };
        
        checkIsPEFile();
    }, [file]);

    // Update threat assessment when data changes
    useEffect(() => {
        if (!file) return;

        // Update when both analyses are complete, regardless of whether they found anything
        if (!isPELoading && !isYaraLoading) {
            const assessment = evaluateThreatLevel(peData, yaraMatches);
            setThreatAssessment(assessment);
        }
    }, [file, peData, yaraMatches, isPELoading, isYaraLoading]);

    if (!file) {
        return (
            <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
                <div className="flex justify-center py-10">
                    <div className="text-center max-w-md">
                        <div className="bg-blue-500/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-blue-500 h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-3">No File Selected</h3>
                        <p className="text-zinc-400">
                            Please upload a file to perform combined YARA and PE structure analysis.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-full">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
                    <ThreatSummary 
                        assessment={threatAssessment}
                        yaraMatches={yaraMatches.map(match => ({
                            rule: match.rule,
                            severity: match.severity,
                            threat_name: match.rule, // Use rule name as threat_name
                            description: match.description
                        }))}
                    />
                </Card>
            </motion.div>

            {/* YARA Scan Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl"></div>
                    
                    {/* Use YaraResults component but with a no-op onScan function that doesn't trigger a new scan */}
                    <YaraResults
                        file={file}
                        yaraData={yaraData}
                        isScanning={isYaraLoading}
                        error={yaraError}
                        onScan={() => {
                            // This is a no-op function - it does nothing when onScan is called
                            // in the CombinedAnalysis view to prevent accidental scans
                            console.log("Scan button clicked in Combined Analysis view - this is disabled");
                        }}
                    />
                </Card>
            </motion.div>

            {/* PE Analysis Section */}
            {isPEFileType ?
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl"></div>

                        <PEAnalysis
                            fileName={file ? file.name : ""}
                            peData={peData}
                            isLoading={isPELoading}
                            error={peError}
                        />
                    </Card>
                </motion.div>
                : null}
        </div>
    );
}