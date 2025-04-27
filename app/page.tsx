"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import FileUploader from "@/components/file-scanning/file-uploader"
import ScanResults from "@/components/file-scanning/scan-results"
import PEAnalysis from "@/components/file-scanning/pe-analysis"
import YaraResults from "@/components/file-scanning/yara-results"
import HexViewer from "@/components/file-scanning/hex-viewer"
import { analyzePEFile, type PEAnalysisResult } from "@/components/file-scanning/pe-analysis/utils/pe-parser"

// Define a file size threshold for optimization strategies
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
const PE_ANALYSIS_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB for progressive PE analysis

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "results" | "pe-analysis" | "yara" | "hex">("upload")
  const [fileSelected, setFileSelected] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [scanComplete, setScanComplete] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [peAnalysisData, setPEAnalysisData] = useState<PEAnalysisResult | null>(null)
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isPEFile, setIsPEFile] = useState<boolean>(false)
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false)

  const getFileData = () => {
    return {
      fileName,
      fileType,
      fileSize
    }
  }

  const handleFileSelected = async (file: File | null) => {
    if (file) {
      setFile(file)
      setFileSelected(true)
      setFileName(file.name)
      setFileType(file.type || getFileTypeFromExtension(file.name))
      setFileSize(formatFileSize(file.size))

      // Check if this is a large file
      const largeFile = file.size > LARGE_FILE_THRESHOLD;
      setIsLargeFile(largeFile);
      if (largeFile) {
        console.warn(`Large file detected (${(file.size / 1024 / 1024).toFixed(2)} MB). Using optimized handling.`);
      }

      // Reset PE analysis state when a new file is selected
      setPEAnalysisData(null)
      setParseError(null)
      
      // Reset scan state
      setScanComplete(false);
    }
  }

  const getFileTypeFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || ""

    const typeMap: Record<string, string> = {
      exe: "Windows Executable",
      dll: "Windows Dynamic Link Library",
      sys: "Windows System File",
      pdf: "PDF Document",
      doc: "Microsoft Word Document",
      docx: "Microsoft Word Document",
      xls: "Microsoft Excel Spreadsheet",
      xlsx: "Microsoft Excel Spreadsheet",
      zip: "ZIP Archive",
      rar: "RAR Archive",
      js: "JavaScript File",
      vbs: "VBScript File",
      ps1: "PowerShell Script",
      bat: "Windows Batch File",
      sh: "Shell Script",
    }

    return typeMap[ext] || `${ext.toUpperCase()} File`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Progressive file analysis for large files
  const analyzeFileProgressively = async (file: File): Promise<boolean> => {
    try {
      // Initial processing steps - 10%
      setProgress(10);
      
      // Read just the first 8 bytes to determine file type
      const headerBlob = file.slice(0, 8);
      const headerBuffer = await headerBlob.arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      const headerHex = Array.from(headerBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      setProgress(20);
      
      // Detect PE file based on MZ header
      const isPE = headerHex.startsWith('4d5a'); // MZ header
      setIsPEFile(isPE);
      setProgress(30);
      
      if (isPE && file.size < LARGE_FILE_THRESHOLD) {
        // For smaller PE files, process normally
        setProgress(40);
        const arrayBuffer = await file.arrayBuffer();
        setProgress(50);
        const peAnalysisResult = await analyzePEFile(arrayBuffer);
        setProgress(80);
        setPEAnalysisData(peAnalysisResult);
        
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
      else if (isPE && file.size >= LARGE_FILE_THRESHOLD) {
        // For large PE files, do basic header analysis only initially
        setProgress(40);
        
        // Read just the first chunk for basic analysis
        const headerChunkBlob = file.slice(0, PE_ANALYSIS_CHUNK_SIZE);
        const headerChunkBuffer = await headerChunkBlob.arrayBuffer();
        setProgress(60);
        
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
          
          setPEAnalysisData(limitedResult);
          setProgress(80);
          
          // Store warning about large file
          setParseError("Large PE file: Only header information analyzed. Full section analysis would be too resource-intensive for the browser.");
        } catch (error) {
          console.error("Error during basic PE header analysis:", error);
          setParseError(error instanceof Error ? error.message : "Unknown error during PE analysis");
        }
      }
      else {
        // For non-PE files
        setProgress(50);
        
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
          
          setProgress(80);
        } catch (error) {
          console.error("Error during file hash computation:", error);
          setParseError(error instanceof Error ? error.message : "Unknown error during file analysis");
          setProgress(80);
        }
      }
      
      // Final processing
      setProgress(100);
      return true;
    } catch (error) {
      console.error("Error during progressive file analysis:", error);
      setProgress(100);
      return false;
    }
  };

  const startScan = async () => {
    setScanning(true)
    setProgress(0)
    setScanComplete(false)

    if (!file) {
      setScanning(false)
      return
    }

    try {
      // Use progressive analysis for all files
      const success = await analyzeFileProgressively(file);
      
      // Complete the scan
      setScanning(false)
      setScanComplete(true)
      setActiveTab("results")
    } catch (error) {
      console.error("Error during file scanning:", error);
      setProgress(100);
      setScanning(false);
      setScanComplete(true);
      setActiveTab("results");
    }
  }

  // Load PE analysis data from session storage if it exists when switching to the PE analysis tab
  useEffect(() => {
    if (isPEFile && activeTab === "pe-analysis" && !peAnalysisData && file && !isLargeFile) {
      const storedData = sessionStorage.getItem('peAnalysis')

      if (storedData) {
        // If we have stored data, use it
        setPEAnalysisData(JSON.parse(storedData))
      }
      else if (!isParsing) {
        // If no stored data and not already parsing, try to parse the file
        const parsePEFile = async () => {
          setIsParsing(true)
          setParseError(null)

          try {
            // For large files, show a warning instead of parsing the whole file
            if (file.size > LARGE_FILE_THRESHOLD) {
              setParseError("File is too large for detailed browser analysis. Using header-only mode.");
              // Process only the first chunk
              const headerChunk = file.slice(0, PE_ANALYSIS_CHUNK_SIZE);
              const headerBuffer = await headerChunk.arrayBuffer();
              const result = await analyzePEFile(headerBuffer);
              
              // Keep only essential data
              const limitedResult: PEAnalysisResult = {
                file_size: file.size,
                machine_type: result.machine_type,
                timestamp: result.timestamp,
                sections: result.sections.slice(0, 5), // Limit to first 5 sections
                dosHeader: result.dosHeader,
                ntFileHeader: result.ntFileHeader,
                ntOptionalHeader: result.ntOptionalHeader,
              };
              
              setPEAnalysisData(limitedResult);
            } else {
              // Normal processing for smaller files
              const arrayBuffer = await file.arrayBuffer();
              const result = await analyzePEFile(arrayBuffer);
              setPEAnalysisData(result);
              
              // Store limited data to avoid session storage limits
              try {
                const essentialData = {
                  file_size: result.file_size,
                  machine_type: result.machine_type,
                  timestamp: result.timestamp,
                  sections: result.sections.map(s => ({
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
          } catch (error) {
            console.error("Error parsing PE file:", error);
            setParseError(error instanceof Error ? error.message : "Unknown error parsing PE file");
          } finally {
            setIsParsing(false);
          }
        }

        parsePEFile();
      }
    }
  }, [activeTab, peAnalysisData, file, isParsing, isLargeFile, isPEFile]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-white">Static File Analysis</h1>
        <p className="text-zinc-400">Deep analysis of files for malware, vulnerabilities, and security threats</p>
      </div>

      <div className="flex border-b border-zinc-800">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "upload" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
            }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "results" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
            }`}
          onClick={() => setActiveTab("results")}
          disabled={!scanComplete}
        >
          Analysis Results
        </button>
        {isPEFile ?
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "pe-analysis" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
              }`}
            onClick={() => setActiveTab("pe-analysis")}
            disabled={!scanComplete}
          >
            PE Analysis
          </button> : null}
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "yara" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
            }`}
          onClick={() => setActiveTab("yara")}
          disabled={!scanComplete}
        >
          YARA Scan
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "hex" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
            }`}
          onClick={() => setActiveTab("hex")}
          disabled={!fileSelected}
        >
          Hex View
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsContent value="upload">
          <FileUploader
            onFileSelected={handleFileSelected}
            fileName={fileName}
            fileType={fileType}
            fileSize={fileSize}
            fileSelected={fileSelected}
            scanning={scanning}
            progress={progress}
            onStartScan={startScan}
          />
        </TabsContent>

        <TabsContent value="results">
          <ScanResults file={file} fileData={getFileData()} />
        </TabsContent>

        <TabsContent value="pe-analysis">
          <PEAnalysis
            fileName={fileName}
            peData={peAnalysisData}
            isLoading={isParsing}
            error={parseError}
          />
        </TabsContent>

        <TabsContent value="yara">
          <YaraResults file={file} />
        </TabsContent>

        <TabsContent value="hex">
          <Card className="card-glassmorphism p-6">
            <HexViewer file={file} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
