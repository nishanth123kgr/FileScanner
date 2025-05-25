"use client"

import { Button } from "@/components/ui/button"
import { FileSearch, Upload, AlertCircle, Shield } from "lucide-react"
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
      
      {/* Background particle animation */}
      <div className="absolute inset-0 overflow-hidden">
        {dragActive && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0"
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-red-500/30"
                initial={{ 
                  x: Math.random() * 100 - 50 + "%", 
                  y: -20,
                  opacity: 0.8
                }}
                animate={{ 
                  y: "110%",
                  opacity: 0
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      <label htmlFor="file-upload" className="w-full z-10">
        <div className="flex flex-col items-center cursor-pointer">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-16 w-16 text-red-400 mb-4 relative" />
          </motion.div>
          <motion.h3 
            className="text-2xl font-medium mb-2 text-red-400"
            animate={{ 
              scale: dragActive ? 1.05 : 1
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {dragActive ? "Drop to Analyze" : "Upload File for Analysis"}
          </motion.h3>
          <p className="text-sm text-zinc-400 mb-6 text-center max-w-md px-4">
            Drag & drop your file or click to browse. Our advanced scanner will analyze it for malware, 
            suspicious code patterns, and potential security threats.
          </p>
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white gap-2 px-6 py-5" 
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-5 w-5" />
              <span>Select File</span>
            </Button>
          </motion.div>
        </div>
      </label>
      
      {/* Supported file info */}
      <div className="mt-8 text-xs text-zinc-400 bg-zinc-800/30 py-2 px-4 rounded-full backdrop-blur-sm">
        <p className="flex items-center gap-2 justify-center">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span>Supported formats: EXE, DLL, PDF, DOC, ZIP, and more</span>
        </p>
      </div>
    </div>
  )
}