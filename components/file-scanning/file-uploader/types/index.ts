import type React from "react"

export interface FileUploaderProps {
  onFileSelected: (file: File | null) => void
  fileName: string
  fileType: string
  fileSize: string
  fileSelected: boolean
  scanning: boolean
  progress: number
  onStartScan: () => void
}

export interface DragDropAreaProps {
  dragActive: boolean
  handleDrag: (e: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface FilePreviewProps {
  fileName: string
  fileType: string
  fileSize: string
  fileError: string | null
  getFileTypeClass: string
  handleRemoveFile: () => void
  scanning: boolean
  onStartScan: () => void
}

export interface ScanProgressProps {
  scanning: boolean
  progress: number
}

export interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor: string
  delay: number
}