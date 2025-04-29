"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileCode } from "lucide-react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { formatFileSize } from "../utils/hexUtils"

interface HexViewerHeaderProps {
  file: File | null
  fileSize: number
  onSearch: (searchTerm: string) => void
}

export const HexViewerHeader = ({ file, fileSize, onSearch }: HexViewerHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const handleSearch = () => {
    onSearch(searchTerm.toLowerCase());
  }
  
  return (
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
              <p className="text-zinc-400 mb-4">
                Examining {file?.name || "file"} ({fileSize > 0 ? formatFileSize(fileSize) : "0 bytes"})
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
              placeholder="Search hex pattern (e.g., 4D 5A 90)"
              className="bg-zinc-800/50 border-zinc-700/50 text-white hover:border-zinc-600 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-2 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
  );
}