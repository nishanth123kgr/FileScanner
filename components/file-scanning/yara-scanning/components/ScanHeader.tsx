import React from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanHeaderProps {
  fileName: string | null;
  onRescan: () => void;
  isScanning: boolean;
}

export const ScanHeader: React.FC<ScanHeaderProps> = ({ 
  fileName, 
  onRescan, 
  isScanning 
}) => {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Shield className="h-6 w-6 text-amber-500" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-medium text-white mb-1">YARA Scan Results</h3>
        <p className="text-zinc-400 mb-4">
          {fileName ? `Scanning ${fileName} for suspicious patterns` : "No file selected"}
        </p>
      </div>
      {fileName && !isScanning && (
        <Button 
          onClick={onRescan} 
          className="bg-amber-600 hover:bg-amber-500 text-white border-0"
        >
          Rescan
        </Button>
      )}
    </div>
  );
};