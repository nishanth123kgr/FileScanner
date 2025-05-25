"use client"

import { Button } from "@/components/ui/button"
import { FileSearch, File, X, CheckCircle2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { FilePreviewProps } from "../types"

export function FilePreview({ 
  fileName, 
  fileType, 
  fileSize, 
  fileError, 
  getFileTypeClass, 
  handleRemoveFile,
  scanning,
  onStartScan
}: FilePreviewProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${getFileTypeClass} border`}>
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
  )
}