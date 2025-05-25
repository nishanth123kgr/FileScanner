"use client";

import { useState, useCallback, useEffect } from "react";
import { YaraResults } from "./components/YaraResults";
import { analyzeYara } from "./utils/yara-wasm";

export default function YaraScan({ file }: { file: File | null }) {
  const [yaraData, setYaraData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Function to execute YARA scan using analyzeYara function
  const performYaraScan = useCallback(async (fileToScan: File) => {
    if (!fileToScan) return;
    
    try {
      setIsScanning(true);
      setScanError(null);

      // Call the analyzeYara function from yara-wasm.js
      const results = await analyzeYara(fileToScan);
      
      // Set the YARA scan results
      setYaraData(results);
      
      // Store results in session storage
      if (results) {
        try {
          sessionStorage.setItem('yaraResults', JSON.stringify(results));
        } catch (storageError) {
          console.warn("Could not store YARA results in session storage:", storageError);
        }
      }
    } catch (error) {
      console.error("Error during YARA analysis:", error);
      setScanError(error instanceof Error ? error.message : "YARA scan failed");
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Function to handle scan button click
  const handleScan = useCallback(() => {
    if (file) {
      performYaraScan(file);
    }
  }, [file, performYaraScan]);
  
  // Check for existing YARA results in session storage when component mounts
  useEffect(() => {
    if (file) {
      const storedData = sessionStorage.getItem('yaraResults');
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setYaraData(parsedData);
        } catch (err) {
          console.error("Error parsing stored YARA results:", err);
        }
      }
    }
  }, [file]);

  return (
    <YaraResults 
      file={file} 
      yaraData={yaraData} 
      isScanning={isScanning} 
      error={scanError} 
      onScan={handleScan} 
    />
  );
}