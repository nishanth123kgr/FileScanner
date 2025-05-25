"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { HexViewerHeader } from "./components/HexViewerHeader"
import { HexViewerContent } from "./components/HexViewerContent"
import { FileInformation } from "./components/FileInformation"
import { useHexData } from "./hooks/useHexData"
import { useChunkPrefetching } from "./hooks/useChunkPrefetching"
import { HEX_CONSTANTS } from "./utils/hexUtils"

interface HexViewerProps {
  file: File | null
}

export default function HexViewer({ file }: HexViewerProps) {
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true)
  const [highlightedBytes, setHighlightedBytes] = useState<string[]>([])
  const scrollPositionRef = useRef<number>(0)
  
  // Use our custom hooks to manage hex data and prefetching
  const {
    hexData,
    fileSize,
    currentOffset,
    isLoading,
    loadProgress,
    isTransitioning,
    setCurrentOffset,
    setHexData,
    setIsTransitioning,
    loadChunk
  } = useHexData(file)

  const {
    prefetchedChunks,
    prefetchNextChunk,
    consumePrefetchedChunk,
    hasPrefetchedChunk
  } = useChunkPrefetching(file)

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden
      setIsTabVisible(newVisibility)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Load initial data when tab is visible
  useEffect(() => {
    if (isTabVisible && file) {
      if (hexData === null) {
        // Load a smaller initial chunk for quick visibility
        loadChunk(currentOffset, isTabVisible, HEX_CONSTANTS.INITIAL_CHUNK_SIZE)
      } else if (
        hexData.length < HEX_CONSTANTS.CHUNK_SIZE && 
        currentOffset + hexData.length < fileSize
      ) {
        // If we previously loaded a small chunk, now load the full chunk
        loadChunk(currentOffset, isTabVisible, HEX_CONSTANTS.CHUNK_SIZE)
      }
    }
  }, [isTabVisible, file, currentOffset, hexData, fileSize, loadChunk])

  // Handle searching for hex patterns
  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm) {
      setHighlightedBytes([])
      return
    }

    // Convert search term to bytes for highlighting
    const bytes = searchTerm.split(" ").filter(Boolean)
    setHighlightedBytes(bytes)
  }, [])

  // Handle scroll events for prefetching
  const handleScroll = useCallback((scrollTop: number, scrollPercentage: number) => {
    // Save current scroll position for restoring after loading
    scrollPositionRef.current = scrollTop
    
    // If user has scrolled past the threshold, prefetch the next chunk
    if (scrollPercentage > HEX_CONSTANTS.PREFETCH_THRESHOLD) {
      prefetchNextChunk(currentOffset, isTabVisible, fileSize)
    }
  }, [currentOffset, isTabVisible, fileSize, prefetchNextChunk])

  // Navigate to next chunk with optimized loading
  const goToNextChunk = useCallback(() => {
    if (!isTabVisible || !file || isLoading) return
    
    const nextOffset = currentOffset + HEX_CONSTANTS.CHUNK_SIZE
    if (nextOffset < fileSize) {
      setIsTransitioning(true)
      
      // Check if we already have this chunk prefetched
      if (hasPrefetchedChunk(nextOffset)) {
        // Use the prefetched data for instant transition
        setHexData(consumePrefetchedChunk(nextOffset))
        setCurrentOffset(nextOffset)
        setIsTransitioning(false)
        
        // Start prefetching the next chunk in advance
        prefetchNextChunk(nextOffset, isTabVisible, fileSize)
      } else {
        // If not prefetched, load it normally
        loadChunk(nextOffset, isTabVisible)
      }
    }
  }, [
    isTabVisible, 
    file, 
    isLoading, 
    currentOffset, 
    fileSize, 
    hasPrefetchedChunk, 
    consumePrefetchedChunk,
    setHexData,
    setCurrentOffset, 
    setIsTransitioning, 
    prefetchNextChunk, 
    loadChunk
  ])

  // Navigate to previous chunk with optimized loading
  const goToPrevChunk = useCallback(() => {
    if (!isTabVisible || !file || isLoading) return
    
    const prevOffset = Math.max(currentOffset - HEX_CONSTANTS.CHUNK_SIZE, 0)
    if (prevOffset !== currentOffset) {
      setIsTransitioning(true)
      
      // Check if we already have this chunk prefetched
      if (hasPrefetchedChunk(prevOffset)) {
        // Use the prefetched data for instant transition
        setHexData(consumePrefetchedChunk(prevOffset))
        setCurrentOffset(prevOffset)
        setIsTransitioning(false)
      } else {
        // If not prefetched, load it normally
        loadChunk(prevOffset, isTabVisible)
      }
    }
  }, [
    isTabVisible, 
    file, 
    isLoading, 
    currentOffset, 
    hasPrefetchedChunk, 
    consumePrefetchedChunk,
    setHexData,
    setCurrentOffset,
    setIsTransitioning,
    loadChunk
  ])

  return (
    <div className="space-y-6 w-full max-w-full">
      <HexViewerHeader 
        file={file} 
        fileSize={fileSize}
        onSearch={handleSearch}
      />
      
      <HexViewerContent
        file={file}
        hexData={hexData}
        currentOffset={currentOffset}
        fileSize={fileSize}
        isLoading={isLoading}
        highlightedBytes={highlightedBytes}
        isTabVisible={isTabVisible}
        onPrevChunk={goToPrevChunk}
        onNextChunk={goToNextChunk}
        onScroll={handleScroll}
      />
      
      <FileInformation 
        fileSize={fileSize}
        hexDataSize={hexData?.length || 0}
      />
    </div>
  )
}