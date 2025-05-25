import React from "react";
import { Fingerprint } from "lucide-react";
import { YARA_RULES } from "../utils/yara-scanner";

interface ScanInformationProps {
  scanTime: string;
}

export const ScanInformation: React.FC<ScanInformationProps> = ({ scanTime }) => {
  return (
    <>
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
        <Fingerprint className="h-5 w-5 text-amber-500" />
        Scan Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Fingerprint className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h4 className="text-white font-medium">Scan Time</h4>
              <p className="text-sm text-zinc-300 mt-1 bg-black/40 p-1.5 rounded border border-zinc-800/50 font-mono">
                {scanTime}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors border border-zinc-700/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Fingerprint className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h4 className="text-white font-medium">Rules Applied</h4>
              <p className="text-sm text-zinc-300 mt-1 bg-black/40 p-1.5 rounded border border-zinc-800/50 font-mono">
                {YARA_RULES.length} rules (general malware detection)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};