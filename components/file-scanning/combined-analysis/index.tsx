"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FileSearch, Shield, AlertCircle } from "lucide-react";

import PEAnalysis from "../pe-analysis";
import YaraScan from "../yara-scanning";
import { ThreatSummary } from "./components/ThreatSummary";
import { evaluateThreatLevel } from "./utils/threat-assessment";
import { YaraMatch } from "../yara-scanning/types";
import { PEAnalysisResult, ThreatAssessment } from "./types";
import { isPEFile } from "@/app/file-scanning";

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
            {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="card-glassmorphism p-6 border-0 relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"></div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <FileSearch className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-1">Combined Security Analysis</h3>
                <p className="text-zinc-400 mb-4">
                  Comprehensive file analysis combining YARA pattern detection and PE structure examination
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div> */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
                    <ThreatSummary assessment={threatAssessment} />
                </Card>
            </motion.div>

            {/* Summary Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl"></div>

                    <div className="w-full relative z-10">
                        <h3 className="text-xl font-medium text-white mb-6">Analysis Results</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-500" />
                                    YARA Scan Summary
                                </h3>
                                {isYaraLoading ? (
                                    <div className="text-zinc-400 animate-pulse">Analyzing with YARA patterns...</div>
                                ) : yaraError ? (
                                    <div className="text-red-400">{yaraError}</div>
                                ) : yaraMatches.length > 0 ? (
                                    <div>
                                        <p className="text-white mb-2">
                                            <span className="text-amber-500 font-medium">{yaraMatches.length}</span> suspicious patterns detected
                                        </p>
                                        <div className="bg-zinc-900/60 rounded-lg p-3 max-h-40 overflow-y-auto">
                                            {yaraMatches.map((match, i) => (
                                                <div key={i} className="text-sm mb-2 p-2 border-b border-zinc-800 last:border-b-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${match.severity === "high" ? "bg-red-500" : match.severity === "medium" ? "bg-amber-500" : "bg-blue-500"}`}></span>
                                                        <span className="text-white">{match.rule}</span>
                                                        <span className="text-xs font-medium text-zinc-500 ml-auto">{match.severity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-green-400">No suspicious patterns detected</div>
                                )}
                            </div>

                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <FileSearch className="h-5 w-5 text-indigo-500" />
                                    PE Structure Summary
                                </h3>
                                {isPELoading ? (
                                    <div className="text-zinc-400 animate-pulse">Analyzing PE structure...</div>
                                ) : peError ? (
                                    <div className="text-red-400">{peError}</div>
                                ) : peData ? (
                                    <div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between pb-1 border-b border-zinc-800">
                                                <span className="text-zinc-400">Machine Type</span>
                                                <span className="text-white">{peData.machine_type || 'Unknown'}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-zinc-800">
                                                <span className="text-zinc-400">Sections</span>
                                                <span className="text-white">{peData.sections.length}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-zinc-800">
                                                <span className="text-zinc-400">Import DLLs</span>
                                                <span className="text-white">{peData.imports?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-zinc-800">
                                                <span className="text-zinc-400">Timestamp</span>
                                                <span className="text-white">{peData.ntFileHeader?.timeDateStamp || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-zinc-400">PE analysis not available</div>
                                )}
                            </div>
                        </div>
                    </div>
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

                    <h3 className="text-xl font-medium text-amber-500 mb-6 flex items-center">
                        <Shield className="h-6 w-6 mr-2" />
                        YARA Pattern Analysis
                    </h3>

                    <YaraScan file={file} />
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

                        <h3 className="text-xl font-medium text-indigo-500 mb-6 flex items-center">
                            <FileSearch className="h-6 w-6 mr-2" />
                            PE Structure Analysis
                        </h3>

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