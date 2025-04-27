import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileSearch, Info } from "lucide-react";
import type { PEAnalysisResult } from '../utils/pe-parser';

export interface AnalysisHeaderProps {
  fileName: string;
  fileData: PEAnalysisResult;
}

export function AnalysisHeader({ fileName, fileData }: AnalysisHeaderProps) {
  // Format file size in a more readable way
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-start gap-6 relative z-10">
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
        <FileSearch className="h-8 w-8 text-blue-500" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">PE File Analysis</h3>
            <p className="text-zinc-400">
              Analysis of <span className="text-white font-medium">{fileName}</span>
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 px-3 py-1.5 text-sm self-start md:self-center">
            {fileData.machine_type}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-400">{formatFileSize(fileData.file_size)}</div>
            <div className="text-xs text-zinc-400 mt-1">File Size</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
            <div className="text-2xl font-bold text-purple-400">{fileData.sections.length}</div>
            <div className="text-xs text-zinc-400 mt-1">Sections</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-500/20 backdrop-blur-sm">
            <div className="text-2xl font-bold text-teal-400">
              {fileData.ntFileHeader?.numberOfSections || fileData.sections.length}
            </div>
            <div className="text-xs text-zinc-400 mt-1">PE Sections</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-zinc-300">
                {fileData.timestamp ? new Date(fileData.timestamp).toLocaleDateString() : "Unknown"}
              </div>
              <Info className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="text-xs text-zinc-400 mt-1">Compile Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}