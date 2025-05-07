// Custom hook for file scanning state management
import { useState, useEffect } from "react";
import { formatFileSize, getFileTypeFromExtension } from "../utils/file-utils";
import { analyzeFileProgressively } from "../utils/file-analyzer";
import { FileTabType, PEAnalysisResult } from "../types";
import { initializeYaraScan } from "@/components/file-scanning/yara-scanning/utils/yara-wasm";

export function useFileScanning() {
  const [activeTab, setActiveTab] = useState<FileTabType>("upload");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [scanComplete, setScanComplete] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [peAnalysisData, setPEAnalysisData] = useState<PEAnalysisResult | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isPEFile, setIsPEFile] = useState<boolean>(false);
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  const [yaraData, setYaraData] = useState<any>(null);

  // Get file metadata for display
  const getFileData = () => {
    return {
      fileName,
      fileType,
      fileSize
    }
  };

  // Handle file selection
  const handleFileSelected = async (file: File | null) => {
    if (file) {
      setFile(file);
      setFileSelected(true);
      setFileName(file.name);
      setFileType(file.type || getFileTypeFromExtension(file.name));
      setFileSize(formatFileSize(file.size));

      // Reset analysis state
      setPEAnalysisData(null);
      setParseError(null);
      setScanComplete(false);
      setYaraData(null);
      
      // Clear previous session storage data
      sessionStorage.removeItem('yaraResults');
      sessionStorage.removeItem('peAnalysis');
    }
  };

  // Start file scanning process
  const startScan = async () => {
    setScanning(true);
    setProgress(0);
    setScanComplete(false);

    if (!file) {
      setScanning(false);
      return;
    }

    try {
      // Start with 0% progress
      setProgress(0);
      
      // Begin progressive analysis (50% of progress)
      const result = await analyzeFileProgressively(file, (progressValue) => {
        // Map the progress to 0-50%
        setProgress(Math.floor(progressValue / 2));
      });
      
      // Update state with analysis results
      setIsPEFile(result.isPEFile);
      setIsLargeFile(result.isLargeFile);
      setPEAnalysisData(result.peAnalysisData);
      setParseError(result.parseError);
      
      // Update progress to 50% after PE analysis
      setProgress(50);
      
      // Start YARA analysis (remaining 50% of progress)
      const yaraResults = await initializeYaraScan(file);
      setYaraData(yaraResults);
      
      // Complete the scan
      setProgress(100);
      setScanning(false);
      setScanComplete(true);
      setActiveTab("results");
    } catch (error) {
      console.error("Error during file scanning:", error);
      setProgress(100);
      setScanning(false);
      setScanComplete(true);
      setActiveTab("results");
    }
  };

  // Load PE analysis data from session storage when switching to PE analysis tab
  useEffect(() => {
    if (isPEFile && activeTab === "pe-analysis" && !peAnalysisData && file && !isLargeFile) {
      const storedData = sessionStorage.getItem('peAnalysis');

      if (storedData) {
        // If we have stored data, use it
        setPEAnalysisData(JSON.parse(storedData));
      }
      else if (!isParsing) {
        // If no stored data and not already parsing, try to parse the file
        const parsePEFile = async () => {
          setIsParsing(true);
          setParseError(null);
          
          // This will re-analyze the PE file if needed
          const result = await analyzeFileProgressively(file, () => {});
          setPEAnalysisData(result.peAnalysisData);
          setParseError(result.parseError);
          setIsParsing(false);
        };
        
        parsePEFile();
      }
    }
  }, [activeTab, peAnalysisData, file, isParsing, isLargeFile, isPEFile]);
  
  // Load YARA analysis data from session storage when switching to YARA tab
  useEffect(() => {
    if (activeTab === "yara" && !yaraData && file) {
      const storedData = sessionStorage.getItem('yaraResults');

      if (storedData) {
        // If we have stored data, use it
        setYaraData(JSON.parse(storedData));
      }
    }
  }, [activeTab, yaraData, file]);

  return {
    activeTab,
    setActiveTab,
    fileSelected,
    fileName,
    fileType,
    fileSize,
    scanComplete,
    scanning,
    progress,
    file,
    peAnalysisData,
    yaraData,
    isParsing,
    parseError,
    isPEFile,
    isLargeFile,
    getFileData,
    handleFileSelected,
    startScan
  };
}