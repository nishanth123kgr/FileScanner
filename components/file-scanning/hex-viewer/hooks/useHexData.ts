"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { HEX_CONSTANTS } from "../utils/hexUtils"

export function useHexData(file: File | null) {
  const [hexData, setHexData] = useState<Uint8Array | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [totalRows, setTotalRows] = useState<number>(0)
  const [currentOffset, setCurrentOffset] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadProgress, setLoadProgress] = useState<number>(0)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize with file data
  useEffect(() => {
    if (!file) return;
    
    setFileSize(file.size);
    setTotalRows(Math.ceil(file.size / HEX_CONSTANTS.BYTES_PER_ROW));
    setCurrentOffset(0);
    setHexData(null);
  }, [file]);

  // Function to load a specific chunk of the file with cancellation support
  const loadChunk = useCallback(async (
    offset: number, 
    isTabVisible: boolean, 
    chunkSize = HEX_CONSTANTS.CHUNK_SIZE
  ) => {
    if (!file || !isTabVisible) return null;
    
    try {
      // Cancel any previous loading operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new abort controller for this operation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      setIsLoading(true);
      setLoadProgress(0);
      
      // Calculate start and end for slicing the file
      const start = offset;
      const end = Math.min(offset + chunkSize, file.size);
      
      // Check if the operation was cancelled
      if (signal.aborted) return null;
      
      // Split loading into smaller chunks for better UI responsiveness
      const microChunkSize = 1024; // 1KB micro chunks
      let loadedBytes = 0;
      let accumulatedData = new Uint8Array(end - start);
      
      for (let pos = start; pos < end; pos += microChunkSize) {
        if (signal.aborted) return null;
        
        // Use microtask to allow browser to handle other events
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const microEnd = Math.min(pos + microChunkSize, end);
        const microBlob = file.slice(pos, microEnd);
        const microBuffer = await microBlob.arrayBuffer();
        const microData = new Uint8Array(microBuffer);
        
        // Copy this micro-chunk to the accumulated data
        accumulatedData.set(microData, pos - start);
        
        loadedBytes += microData.length;
        setLoadProgress(Math.floor((loadedBytes / (end - start)) * 100));
      }
      
      if (signal.aborted) return null;
      
      setHexData(accumulatedData);
      setCurrentOffset(offset);
      setIsLoading(false);
      setLoadProgress(100);
      setIsTransitioning(false);
      
      return accumulatedData;
    } catch (error: unknown) {
      // Properly type check the error before accessing its properties
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error loading file chunk:", error);
      }
      setIsLoading(false);
      setIsTransitioning(false);
      return null;
    } finally {
      // Clear the abort controller reference
      if (abortControllerRef.current?.signal.aborted) {
        abortControllerRef.current = null;
      }
    }
  }, [file]);

  // Clean up function to cancel any pending operations
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    hexData,
    fileSize,
    totalRows,
    currentOffset,
    isLoading,
    loadProgress,
    isTransitioning,
    setCurrentOffset,
    setHexData,
    setIsTransitioning,
    loadChunk
  };
}