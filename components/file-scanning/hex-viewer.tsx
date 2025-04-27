"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, FileCode, Bug, Fingerprint } from "lucide-react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useVirtualizer } from '@tanstack/react-virtual'

// This constant defines how many bytes to load at once - reduced for better performance
const CHUNK_SIZE = 1024 * 8; // Reduced to 8KB chunks for faster loading
const BYTES_PER_ROW = 16;
const INITIAL_CHUNK_SIZE = 1024 * 4; // Smaller initial load (4KB) for faster tab transitions

export default function HexViewer({ file }: { file: File | null }) {
  const [hexData, setHexData] = useState<Uint8Array | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [totalRows, setTotalRows] = useState<number>(0)
  const [currentOffset, setCurrentOffset] = useState<number>(0)
  const [highlightedBytes, setHighlightedBytes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true)
  const [loadProgress, setLoadProgress] = useState<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize with file data - with progressive loading
  useEffect(() => {
    if (!file) return;
    
    setFileSize(file.size);
    setTotalRows(Math.ceil(file.size / BYTES_PER_ROW));
    setCurrentOffset(0);
    setHexData(null);
    
    // Only load the first chunk immediately if tab is visible
    if (isTabVisible) {
      // Load a smaller initial chunk for faster tab transitions
      loadChunk(0, INITIAL_CHUNK_SIZE);
    }
  }, [file]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      setIsTabVisible(newVisibility);
      
      // Cancel any ongoing loading operations when tab becomes invisible
      if (!newVisibility && abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Cancel any pending operations on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Function to load a specific chunk of the file with cancellation support
  const loadChunk = useCallback(async (offset: number, chunkSize = CHUNK_SIZE) => {
    if (!file || !isTabVisible) return;
    
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
      if (signal.aborted) return;
      
      // Split loading into smaller chunks for better UI responsiveness
      const microChunkSize = 1024; // 1KB micro chunks
      let loadedBytes = 0;
      let accumulatedData = new Uint8Array(end - start);
      
      for (let pos = start; pos < end; pos += microChunkSize) {
        if (signal.aborted) return;
        
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
      
      if (signal.aborted) return;
      
      setHexData(accumulatedData);
      setCurrentOffset(offset);
      setIsLoading(false);
      setLoadProgress(100);
    } catch (error: unknown) {
      // Properly type check the error before accessing its properties
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error loading file chunk:", error);
      }
      setIsLoading(false);
    } finally {
      // Clear the abort controller reference
      if (abortControllerRef.current?.signal.aborted) {
        abortControllerRef.current = null;
      }
    }
  }, [file, isTabVisible]);

  // If tab becomes visible, load data on demand
  useEffect(() => {
    if (isTabVisible && file) {
      if (hexData === null) {
        // Load a smaller initial chunk for quick visibility
        loadChunk(currentOffset, INITIAL_CHUNK_SIZE);
      } else if (hexData.length < CHUNK_SIZE && currentOffset + hexData.length < file.size) {
        // If we previously loaded a small chunk, now load the full chunk
        // but don't reload what we already have
        loadChunk(currentOffset);
      }
    }
  }, [isTabVisible, file, currentOffset, hexData, loadChunk]);

  const handleSearch = () => {
    if (!searchTerm) {
      setHighlightedBytes([])
      return
    }

    // Convert search term to bytes for highlighting
    const bytes = searchTerm.split(" ").filter(Boolean)
    setHighlightedBytes(bytes)
  }

  const isHighlighted = (byte: string) => {
    return highlightedBytes.includes(byte.toLowerCase())
  }

  // Create a row virtualization component with react-virtual
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: hexData ? Math.ceil(hexData.length / BYTES_PER_ROW) : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30, // estimated row height in pixels
    overscan: 10, // Increased overscan for smoother scrolling
  })

  // Handle navigation between chunks with optimized loading
  const goToNextChunk = () => {
    if (!isTabVisible || !file) return;
    const nextOffset = currentOffset + CHUNK_SIZE;
    if (nextOffset < fileSize) {
      loadChunk(nextOffset);
    }
  };

  const goToPrevChunk = () => {
    if (!isTabVisible || !file) return;
    const prevOffset = Math.max(currentOffset - CHUNK_SIZE, 0);
    if (prevOffset !== currentOffset) {
      loadChunk(prevOffset);
    }
  };

  // Calculate current chunk and total chunks for display
  const currentChunk = Math.floor(currentOffset / CHUNK_SIZE) + 1;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  // Memoize the hex row rendering for better performance
  const renderHexRow = useCallback((rowIndex: number) => {
    if (!hexData) return null;
    
    const startOffset = rowIndex * BYTES_PER_ROW;
    const offset = currentOffset + startOffset;
    
    // Don't render if we're past the file size
    if (offset >= fileSize) return null;
    
    const rowBytes = Array.from(hexData.slice(startOffset, startOffset + BYTES_PER_ROW));
    
    // Pad the row with empty bytes if needed
    const paddedRow = [...rowBytes];
    while (paddedRow.length < BYTES_PER_ROW) {
      paddedRow.push(-1); // -1 indicates no data
    }
    
    return (
      <div className="flex py-1.5 border-b border-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
        <div className="w-20 px-3 text-purple-400">{offset.toString(16).padStart(8, "0")}</div>
        <div className="flex-1 px-3">
          {paddedRow.map((byte, byteIndex) => (
            <span
              key={byteIndex}
              className={`inline-block w-6 ${
                byte === -1 
                ? "text-zinc-800" 
                : isHighlighted(byte.toString(16).padStart(2, "0")) 
                  ? "text-white bg-purple-500/40 rounded px-0.5" 
                  : "text-zinc-300"
              }`}
            >
              {byte === -1 ? "  " : byte.toString(16).padStart(2, "0")}
            </span>
          ))}
        </div>
        <div className="w-32 px-3 text-zinc-500">
          {paddedRow.map((byte, byteIndex) => {
            // Convert hex to ASCII character if printable, otherwise show a dot
            if (byte === -1) return <span key={byteIndex}> </span>;
            
            const char = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".";
            return (
              <span 
                key={byteIndex} 
                className={isHighlighted(byte.toString(16).padStart(2, "0")) ? "text-white" : ""}
              >
                {char}
              </span>
            )
          })}
        </div>
      </div>
    );
  }, [hexData, currentOffset, fileSize, isHighlighted]);

  // Only render component content if tab is visible or we're in the initial render
  return (
    <div className="space-y-6">
      <motion.div 
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
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <FileCode className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-1">Hex Viewer</h3>
                <p className="text-zinc-400 mb-4">Examining {file?.name || "file"} ({fileSize > 0 ? (fileSize / 1024 / 1024).toFixed(2) + " MB" : "0 bytes"})</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search hex pattern (e.g., 4D 5A 90)"
                  className="bg-zinc-800/50 border-zinc-700/50 text-white hover:border-zinc-600 focus:border-purple-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
              </div>
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-500 text-white border-0">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl"></div>
          
          {!file ? (
            <div className="text-center py-10 text-zinc-500">
              No file selected. Please upload a file first.
            </div>
          ) : isLoading ? (
            <div className="text-center py-10">
              <div className="mb-4 text-zinc-300">Loading file data...</div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 max-w-md mx-auto">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${loadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-zinc-500">{loadProgress}% complete</div>
            </div>
          ) : (
            <div className="overflow-x-auto relative z-10">
              <div className="font-mono text-sm">
                <div className="flex bg-zinc-800/70 text-zinc-400 py-2 rounded-t-lg">
                  <div className="w-20 px-3 text-purple-400 font-medium">Offset</div>
                  <div className="flex-1 px-3 font-medium">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</div>
                  <div className="w-32 px-3 text-blue-400 font-medium">ASCII</div>
                </div>

                <div 
                  ref={parentRef}
                  className="bg-zinc-900/40 border border-zinc-800/50 rounded-b-lg"
                  style={{ height: '400px', overflowY: 'auto' }}
                >
                  {isTabVisible && hexData && (
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                        <div
                          key={virtualRow.index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          {renderHexRow(virtualRow.index)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 relative z-10">
            <div className="text-sm text-zinc-400">
              {fileSize > 0 ? `Viewing bytes ${currentOffset.toLocaleString()} to ${Math.min(currentOffset + (hexData?.length || 0), fileSize).toLocaleString()} of ${fileSize.toLocaleString()}` : ''}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevChunk}
                disabled={currentOffset === 0 || !file || !isTabVisible || isLoading}
                className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextChunk}
                disabled={currentOffset + CHUNK_SIZE >= fileSize || !file || !isTabVisible || isLoading}
                className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Keep this component but display actual file info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="card-glassmorphism p-6 border-0 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl"></div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
            <Fingerprint className="h-5 w-5 text-purple-500" />
            File Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Fingerprint className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium">File Size</h4>
                  <p className="text-sm text-zinc-300 mt-1 bg-black/40 p-1.5 rounded border border-zinc-800/50 font-mono">
                    {fileSize > 0 ? `${(fileSize / 1024 / 1024).toFixed(2)} MB (${fileSize.toLocaleString()} bytes)` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Fingerprint className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Loaded Data</h4>
                  <p className="text-sm text-zinc-300 mt-1 bg-black/40 p-1.5 rounded border border-zinc-800/50 font-mono">
                    {hexData ? `${(hexData.length / 1024).toFixed(2)} KB loaded` : "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
