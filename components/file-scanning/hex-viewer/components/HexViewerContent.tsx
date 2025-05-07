"use client"

import { useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HexRow } from "./HexRow"
import { HEX_CONSTANTS } from "../utils/hexUtils"

interface HexViewerContentProps {
  file: File | null
  hexData: Uint8Array | null
  currentOffset: number
  fileSize: number
  isLoading: boolean
  highlightedBytes: string[]
  isTabVisible: boolean
  onPrevChunk: () => void
  onNextChunk: () => void
  onScroll: (scrollTop: number, scrollPercentage: number) => void
}

export const HexViewerContent = ({
  file,
  hexData,
  currentOffset,
  fileSize,
  isLoading,
  highlightedBytes,
  isTabVisible,
  onPrevChunk,
  onNextChunk,
  onScroll
}: HexViewerContentProps) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: hexData ? Math.ceil(hexData.length / HEX_CONSTANTS.BYTES_PER_ROW) : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30, // estimated row height in pixels
    overscan: 10, // Increased overscan for smoother scrolling
  })

  // Handle scroll events for data prefetching
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !hexData || !isTabVisible) return;
    
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    onScroll(scrollTop, scrollPercentage);
  }, [hexData, isTabVisible, onScroll]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="rounded-lg text-card-foreground shadow-none animate-fadeIn bg-black/40 backdrop-blur-md border border-zinc-800/50 p-6 relative overflow-hidden">
        <div className="absolute -bottom-24 -right-24 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl"></div>
        
        {!file ? (
          <div className="text-center py-10 text-zinc-500">
            No file selected. Please upload a file first.
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <div className="font-mono text-sm">
              {/* Updated header with consistent color styling */}
              <div className="flex bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 text-zinc-400 py-2 rounded-t-lg border-b border-zinc-700/50">
                <div className="w-20 px-3 text-cyan-400 font-medium">Offset</div>
                <div className="flex-1 px-3 font-medium">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</div>
                <div className="w-44 px-3 text-teal-400 font-medium border-l border-zinc-700/50">ASCII</div>
              </div>

              <div 
                ref={parentRef}
                className="bg-zinc-900/40 border border-zinc-800/50 rounded-b-lg relative"
                style={{ height: `${HEX_CONSTANTS.CONTAINER_HEIGHT}px`, overflowY: 'auto' }}
                onScroll={handleScroll}
              >
                {/* Always render the virtualized content container, even during loading */}
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
                      <HexRow 
                        data={hexData!}
                        rowIndex={virtualRow.index}
                        currentOffset={currentOffset}
                        fileSize={fileSize}
                        highlightedBytes={highlightedBytes}
                      />
                    </div>
                  ))}
                </div>
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
              onClick={onPrevChunk}
              disabled={currentOffset === 0 || !file || !isTabVisible || isLoading}
              className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextChunk}
              disabled={currentOffset + HEX_CONSTANTS.CHUNK_SIZE >= fileSize || !file || !isTabVisible || isLoading}
              className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}