import React from "react";

interface ScanProgressProps {
  progress: number;
  currentChunk: number;
  totalChunks: number;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({
  progress,
  currentChunk,
  totalChunks
}) => {
  return (
    <div className="text-center py-10">
      <div className="mb-4 text-zinc-300">Scanning file with YARA rules...</div>
      <div className="w-full bg-zinc-800 rounded-full h-2.5 max-w-md mx-auto">
        <div 
          className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        {progress}% complete - Processed chunk {currentChunk} of {totalChunks}
      </div>
    </div>
  );
};