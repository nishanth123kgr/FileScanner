"use client"

import { formatHexByte, isHighlightedByte } from "../utils/hexUtils"

interface HexByteProps {
  byte: number
  highlightedBytes: string[]
}

export const HexByte = ({ byte, highlightedBytes }: HexByteProps) => {
  // Handle missing data
  if (byte === -1) {
    return <span className="inline-block w-6 text-zinc-800">  </span>
  }
  
  // Format the byte and check if it should be highlighted
  const hexValue = formatHexByte(byte)
  const isHighlighted = isHighlightedByte(byte, highlightedBytes)
  
  return (
    <span
      className={`inline-block w-6 ${
        isHighlighted 
          ? "text-white bg-purple-500/40 rounded px-0.5" 
          : "text-zinc-300"
      }`}
      title={`0x${hexValue} (${byte})`}
    >
      {hexValue}
    </span>
  )
}