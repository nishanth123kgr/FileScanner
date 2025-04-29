"use client"

import { Button } from "@/components/ui/button"
import { FileSearch, Upload, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { DragDropAreaProps } from "../types"

export function DragDropArea({ 
  dragActive, 
  handleDrag, 
  handleDrop, 
  handleFileChange 
}: DragDropAreaProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center py-10 md:py-16 border-2 border-dashed rounded-lg backdrop-blur-sm transition-all duration-300 ${
        dragActive 
          ? "border-red-500/70 bg-red-500/10" 
          : "border-zinc-700/70 bg-zinc-800/20 hover:border-red-500/50 hover:bg-zinc-800/30"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
      
      <label htmlFor="file-upload" className="w-full">
        <div className="flex flex-col items-center cursor-pointer">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute -inset-1 bg-red-500/30 rounded-full blur-md"></div>
            <FileSearch className="h-14 w-14 text-red-500 mb-4 relative" />
          </motion.div>
          <motion.h3 
            className="text-xl font-medium text-white mb-2"
            animate={{ scale: dragActive ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {dragActive ? "Drop file here" : "Upload File for Analysis"}
          </motion.h3>
          <p className="text-sm text-zinc-400 mb-6 text-center max-w-md px-4">
            Drag & drop your file or click to browse. We'll analyze it for malware, suspicious code, and security threats.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white gap-2 relative overflow-hidden shadow-lg shadow-red-500/20" 
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <span className="absolute inset-0 bg-white/10 animate-pulse rounded-md"></span>
              <Upload className="h-4 w-4" />
              <span className="relative">Select File</span>
            </Button>
          </motion.div>
        </div>
      </label>
      
      {/* Supported file info */}
      <div className="mt-6 text-xs text-zinc-500">
        <p className="flex items-center gap-1 justify-center">
          <AlertCircle className="h-3 w-3" />
          <span>Supported formats: EXE, DLL, PDF, DOC, ZIP, and more</span>
        </p>
      </div>
    </div>
  )
}