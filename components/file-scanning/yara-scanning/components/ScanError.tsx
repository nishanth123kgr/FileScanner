import React from "react";
import { AlertTriangle } from "lucide-react";

interface ScanErrorProps {
  errorMessage: string;
}

export const ScanError: React.FC<ScanErrorProps> = ({ errorMessage }) => {
  return (
    <div className="flex justify-center py-8">
      <div className="text-center max-w-md">
        <div className="bg-red-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-500 h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Scan Error</h3>
        <p className="text-zinc-400">{errorMessage}</p>
      </div>
    </div>
  );
};