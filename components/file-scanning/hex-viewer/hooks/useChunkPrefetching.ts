"use client"

import { useState, useCallback } from "react"
import { HEX_CONSTANTS } from "../utils/hexUtils"

export function useChunkPrefetching(file: File | null) {
  const [prefetchedChunks, setPrefetchedChunks] = useState<Map<number, Uint8Array>>(new Map())
  
  const prefetchNextChunk = useCallback(async (
    offset: number, 
    isTabVisible: boolean, 
    fileSize: number
  ) => {
    if (!file || !isTabVisible) return;
    
    const nextOffset = offset + HEX_CONSTANTS.CHUNK_SIZE;
    if (nextOffset >= fileSize) return;
    
    // Don't prefetch if we already have this chunk
    if (prefetchedChunks.has(nextOffset)) return;
    
    try {
      // Create a separate abort controller for prefetch
      const prefetchController = new AbortController();
      const signal = prefetchController.signal;
      
      // Load the chunk in the background
      const blob = file.slice(nextOffset, Math.min(nextOffset + HEX_CONSTANTS.CHUNK_SIZE, fileSize));
      const buffer = await blob.arrayBuffer();
      const data = new Uint8Array(buffer);
      
      // If aborted, don't update state
      if (signal.aborted) return;
      
      // Store the prefetched chunk
      setPrefetchedChunks(prev => {
        const newMap = new Map(prev);
        newMap.set(nextOffset, data);
        // Limit cache size to prevent memory issues (keep current, next and prev chunks)
        if (newMap.size > 3) {
          const oldestKey = Array.from(newMap.keys())
            .filter(key => key !== offset && key !== nextOffset && key !== offset - HEX_CONSTANTS.CHUNK_SIZE)
            .sort()[0];
          if (oldestKey) {
            newMap.delete(oldestKey);
          }
        }
        return newMap;
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error prefetching chunk:", error);
      }
    }
  }, [file, prefetchedChunks]);
  
  // Remove a chunk from prefetched cache after using it
  const consumePrefetchedChunk = useCallback((offset: number) => {
    if (prefetchedChunks.has(offset)) {
      const chunk = prefetchedChunks.get(offset)!;
      
      // Remove from cache
      setPrefetchedChunks(prev => {
        const newMap = new Map(prev);
        newMap.delete(offset);
        return newMap;
      });
      
      return chunk;
    }
    return null;
  }, [prefetchedChunks]);

  return {
    prefetchedChunks,
    prefetchNextChunk,
    consumePrefetchedChunk,
    hasPrefetchedChunk: (offset: number) => prefetchedChunks.has(offset)
  };
}