"use client"

import { byteToAsciiChar, getCharacterClass, isHighlightedByte } from "../utils/hexUtils"

interface AsciiCharProps {
  byte: number
  highlightedBytes: string[]
}

export const AsciiChar = ({ byte, highlightedBytes }: AsciiCharProps) => {
  // Skip rendering for missing data
  if (byte === -1) {
    return <span className="opacity-0"> </span>
  }
  
  // Get character representation and styling
  const { char, tooltip } = byteToAsciiChar(byte)
  const charClass = getCharacterClass(byte)
  const isHighlighted = isHighlightedByte(byte, highlightedBytes)
  const highlightClass = isHighlighted ? "bg-teal-500/30 text-white rounded px-0.5" : ""
  
  return (
    <span 
      className={`inline-block w-2.5 text-center font-mono hover:scale-125 hover:font-bold transition-all cursor-default ${charClass} ${highlightClass}`}
      title={tooltip}
    >
      {char}
    </span>
  )
}