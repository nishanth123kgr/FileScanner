"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

// Sample hex data for demonstration
const generateHexData = () => {
  const data = []
  for (let i = 0; i < 16; i++) {
    const row = []
    for (let j = 0; j < 16; j++) {
      row.push(
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0"),
      )
    }
    data.push(row)
  }
  return data
}

export default function FileHexViewer() {
  const [hexData] = useState(generateHexData())
  const [currentPage, setCurrentPage] = useState(1)
  const [highlightedBytes, setHighlightedBytes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const totalPages = 16 // Simulated for demo

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search hex pattern (e.g., 4D 5A 90)"
            className="bg-zinc-800 border-zinc-700 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
        <Button onClick={handleSearch} className="bg-red-500 hover:bg-red-600 text-white">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="font-mono text-sm">
          <div className="flex bg-zinc-800 text-zinc-400 py-1">
            <div className="w-20 px-2">Offset</div>
            <div className="flex-1 px-2">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</div>
            <div className="w-32 px-2">ASCII</div>
          </div>

          {hexData.map((row, rowIndex) => {
            const offset = (rowIndex + (currentPage - 1) * 16).toString(16).padStart(8, "0")

            return (
              <div key={rowIndex} className="flex py-1 border-b border-zinc-800 hover:bg-zinc-800/50">
                <div className="w-20 px-2 text-blue-400">{offset}</div>
                <div className="flex-1 px-2">
                  {row.map((byte, byteIndex) => (
                    <span
                      key={byteIndex}
                      className={`inline-block w-6 ${
                        isHighlighted(byte) ? "text-white bg-red-500/30" : "text-zinc-300"
                      }`}
                    >
                      {byte}
                    </span>
                  ))}
                </div>
                <div className="w-32 px-2 text-zinc-500">
                  {row.map((byte, byteIndex) => {
                    // Convert hex to ASCII character if printable, otherwise show a dot
                    const charCode = Number.parseInt(byte, 16)
                    const char = charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : "."

                    return (
                      <span key={byteIndex} className={isHighlighted(byte) ? "text-white" : ""}>
                        {char}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-zinc-400">
          Showing page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-medium text-white mb-2">Byte Pattern Analysis</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-400">File signature: </span>
            <span className="text-zinc-300">4D 5A (MZ - Windows executable)</span>
          </div>
          <div>
            <span className="text-zinc-400">Entropy: </span>
            <span className="text-zinc-300">7.92 (High - possible encryption)</span>
          </div>
          <div>
            <span className="text-zinc-400">Suspicious offsets: </span>
            <span className="text-red-400">0x1A3F, 0x2C4B</span>
          </div>
          <div>
            <span className="text-zinc-400">String count: </span>
            <span className="text-zinc-300">142 ASCII, 38 Unicode</span>
          </div>
        </div>
      </div>
    </div>
  )
}
