"use client"

import { useState, useCallback } from "react"
import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSearch, Upload, File, FileWarning, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploaderProps {
  onFileSelected: (file: File | null) => void
  fileName: string
  fileType: string
  fileSize: string
  fileSelected: boolean
  scanning: boolean
  progress: number
  onStartScan: () => void
}

// List of supported file extensions for scanning
const SUPPORTED_EXTENSIONS = ['.exe', '.dll', '.sys', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.js', '.php', '.zip', '.rar', '.tar', '.gz', '.7z'];

export default function FileUploader({
  onFileSelected,
  fileName,
  fileType,
  fileSize,
  fileSelected,
  scanning,
  progress,
  onStartScan,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [fileError, setFileError] = useState<string | null>(null)
  
  // Handle file change from traditional file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  // Validate file type/size and set file if valid
  const validateAndSetFile = (file: File) => {
    setFileError(null)
    
    // Basic file validation - could be expanded
    if (file.size > 100 * 1024 * 1024) {
      setFileError("File size exceeds 100MB limit")
      return
    }
    
    // Update parent component with the file
    onFileSelected(file)
  }
  
  // Handle drag and drop events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }, [])
  
  // Check if file extension is known and get appropriate icon class
  const getFileTypeClass = () => {
    if (!fileName) return '';
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    if (['.exe', '.dll', '.sys'].includes(extension)) return 'bg-red-500/20 border-red-500/30 text-red-400';
    if (['.pdf'].includes(extension)) return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
    if (['.doc', '.docx', '.txt'].includes(extension)) return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    if (['.xls', '.xlsx'].includes(extension)) return 'bg-green-500/20 border-green-500/30 text-green-400';
    if (['.zip', '.rar', '.tar', '.gz', '.7z'].includes(extension)) return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
    
    return 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400';
  }

  const handleRemoveFile = () => {
    onFileSelected(null)
    setFileError(null)
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="card-glassmorphism p-6 red-accent-border overflow-hidden relative">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-purple-500/5"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-red-500/10 blur-3xl"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"></div>
            
            {!fileSelected ? (
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
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-lg glassmorphism"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${getFileTypeClass()} border`}>
                      <File className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium text-lg truncate max-w-[200px] sm:max-w-xs">
                          {fileName}
                        </h4>
                        {fileError ? (
                          <span className="text-red-500 text-xs bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {fileError}
                          </span>
                        ) : (
                          <span className="text-green-500 text-xs bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Ready
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <span>{fileType}</span>
                        <span>•</span>
                        <span>{fileSize}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRemoveFile}
                          className="h-5 w-5 p-0 text-zinc-500 hover:text-red-400 hover:bg-transparent"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20" 
                      onClick={onStartScan} 
                      disabled={scanning || !!fileError}
                    >
                      {scanning ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FileSearch className="h-4 w-4 mr-2" />
                          Analyze File
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {scanning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-2"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Analysis Progress</span>
                      <span className="text-zinc-300 font-medium">{progress}%</span>
                    </div>
                    <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Running static analysis...</span>
                      <span>Step {Math.max(1, Math.ceil(progress/20))}/5</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Feature cards section with fixed motion animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card-glassmorphism p-5 red-accent-border relative overflow-hidden group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/5 via-red-500/0 to-red-500/5 group-hover:from-red-500/10 opacity-50 group-hover:opacity-100 transition-opacity rounded-lg"></div>
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/10">
              <FileSearch className="h-4 w-4 text-red-400" />
            </div>
            Static Analysis
          </h4>
          <p className="text-sm text-zinc-400">
            Examines file content without execution to identify malicious patterns
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="card-glassmorphism p-5 red-accent-border relative overflow-hidden group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/5 via-purple-500/0 to-purple-500/5 group-hover:from-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity rounded-lg"></div>
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <FileWarning className="h-4 w-4 text-purple-400" />
            </div>
            PE Analysis
          </h4>
          <p className="text-sm text-zinc-400">
            Deep inspection of Windows executable files for suspicious characteristics
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="card-glassmorphism p-5 red-accent-border relative overflow-hidden group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/5 via-orange-500/0 to-orange-500/5 group-hover:from-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity rounded-lg"></div>
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-500/10">
              <File className="h-4 w-4 text-orange-400" />
            </div>
            YARA Scanning
          </h4>
          <p className="text-sm text-zinc-400">
            Pattern matching with YARA rules to detect known malware signatures
          </p>
        </motion.div>
      </div>
    </div>
  )
}
