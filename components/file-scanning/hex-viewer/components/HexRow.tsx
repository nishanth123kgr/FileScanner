"use client"

import { formatHexOffset, HEX_CONSTANTS } from "../utils/hexUtils"
import { HexByte } from "./HexByte"
import { AsciiChar } from "./AsciiChar"

interface HexRowProps {
  data: Uint8Array
  rowIndex: number
  currentOffset: number
  fileSize: number
  highlightedBytes: string[]
}

export const HexRow = ({
  data,
  rowIndex,
  currentOffset,
  fileSize,
  highlightedBytes
}: HexRowProps) => {
  if (!data) return null;
  
  const startOffset = rowIndex * HEX_CONSTANTS.BYTES_PER_ROW;
  const offset = currentOffset + startOffset;
  
  // Don't render if we're past the file size
  if (offset >= fileSize) return null;
  
  const rowBytes = Array.from(data.slice(startOffset, startOffset + HEX_CONSTANTS.BYTES_PER_ROW));
  
  // Pad the row with empty bytes if needed
  const paddedRow = [...rowBytes];
  while (paddedRow.length < HEX_CONSTANTS.BYTES_PER_ROW) {
    paddedRow.push(-1); // -1 indicates no data
  }
  
  return (
    <div className="flex py-1.5 border-b border-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
      <div className="w-20 px-3 text-purple-400">
        {formatHexOffset(offset)}
      </div>
      <div className="flex-1 px-3">
        {paddedRow.map((byte, byteIndex) => (
          <HexByte
            key={byteIndex}
            byte={byte}
            highlightedBytes={highlightedBytes}
          />
        ))}
      </div>
      <div className="w-44 px-3 border-l border-zinc-800/50 flex">
        {paddedRow.map((byte, byteIndex) => (
          <AsciiChar
            key={byteIndex}
            byte={byte}
            highlightedBytes={highlightedBytes}
          />
        ))}
      </div>
    </div>
  );
}