// Re-export components for easier imports
export { FileUploader } from './FileUploader';
export { DragDropArea } from './components/DragDropArea';
export { FilePreview } from './components/FilePreview';
export { ScanProgress } from './components/ScanProgress';
export { FeatureCard } from './components/FeatureCard';

// Re-export types
export type { 
  FileUploaderProps,
  DragDropAreaProps,
  FilePreviewProps,
  ScanProgressProps,
  FeatureCardProps
} from './types';

// Re-export utilities
export { 
  SUPPORTED_EXTENSIONS,
  getFileTypeClass 
} from './utils/fileTypeUtils';