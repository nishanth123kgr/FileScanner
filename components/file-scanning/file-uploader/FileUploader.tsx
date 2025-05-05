"use client"

import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { FileSearch, FileWarning, File } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { FileUploaderProps } from "./types"
import { getFileTypeClass } from "./utils/fileTypeUtils"
import { DragDropArea } from "./components/DragDropArea"
import { FilePreview } from "./components/FilePreview"
import { ScanProgress } from "./components/ScanProgress"
import { FeatureCard } from "./components/FeatureCard"

export function FileUploader({
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
  // Use internal state to track file selection status
  const [internalFileSelected, setInternalFileSelected] = useState<boolean>(fileSelected)
  
  // Sync internal state with props
  useEffect(() => {
    setInternalFileSelected(fileSelected)
  }, [fileSelected])
  
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
    if (file.size > 10 * 1024 * 1024 * 1024) {
      setFileError("File size exceeds 10GB limit")
      return
    }
    
    // Update parent component with the file
    onFileSelected(file)
    // Update internal state
    setInternalFileSelected(true)
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
  
  const handleRemoveFile = () => {
    // Clear the file in the parent component
    onFileSelected(null)
    // Reset any error states
    setFileError(null)
    // Directly update internal state to immediately switch UI
    setInternalFileSelected(false)
  }

  // Feature card data
  const featureCards = [
    {
      icon: <FileSearch className="h-4 w-4 text-red-400" />,
      title: "Static Analysis",
      description: "Examines file content without execution to identify malicious patterns",
      accentColor: "red",
      delay: 0.3
    },
    {
      icon: <FileWarning className="h-4 w-4 text-purple-400" />,
      title: "PE Analysis",
      description: "Deep inspection of Windows executable files for suspicious characteristics",
      accentColor: "purple",
      delay: 0.4
    },
    {
      icon: <File className="h-4 w-4 text-orange-400" />,
      title: "YARA Scanning",
      description: "Pattern matching with YARA rules to detect known malware signatures",
      accentColor: "orange",
      delay: 0.5
    }
  ];

  const currentFileTypeClass = getFileTypeClass(fileName);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={internalFileSelected ? "preview" : "droparea"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="card-glassmorphism p-6 red-accent-border overflow-hidden relative">
            {!internalFileSelected ? (
              <DragDropArea 
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileChange={handleFileChange}
              />
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-lg glassmorphism"
              >
                <FilePreview 
                  fileName={fileName}
                  fileType={fileType}
                  fileSize={fileSize}
                  fileError={fileError}
                  getFileTypeClass={currentFileTypeClass}
                  handleRemoveFile={handleRemoveFile}
                  scanning={scanning}
                  onStartScan={onStartScan}
                />

                <ScanProgress scanning={scanning} progress={progress} />
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Feature cards section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featureCards.map((card, index) => (
          <FeatureCard 
            key={index}
            icon={card.icon}
            title={card.title}
            description={card.description}
            accentColor={card.accentColor}
            delay={card.delay}
          />
        ))}
      </div>
    </div>
  )
}