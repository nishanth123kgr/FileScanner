import React from 'react';
import { Progress } from '@/components/ui/progress';
import type { PESection } from '../utils/pe-parser';

export interface SectionsAnalysisProps {
  sections: PESection[];
}

export function SectionsAnalysis({ sections }: SectionsAnalysisProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-blue-400 mb-2">Section Entropy Analysis</h4>
      
      {sections.length > 0 ? (
        <div className="space-y-3">
          {sections.map((section, index) => {
            // Calculate entropy-based styling
            const entropyValue = parseFloat(section.entropy);
            const entropyPercent = (entropyValue / 8) * 100;
            
            let entropyColor = 'from-green-500 to-green-600';
            if (entropyValue > 7.0) {
              entropyColor = 'from-red-500 to-red-600';
            } else if (entropyValue > 6.5) {
              entropyColor = 'from-amber-500 to-amber-600';
            } else if (entropyValue > 5.5) {
              entropyColor = 'from-blue-500 to-blue-600';
            }
            
            return (
              <div key={index} className="bg-black/20 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-white">{section.name}</div>
                  <div className="text-xs text-zinc-400">{section.virtual_address}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                  <div>
                    <span className="text-zinc-500">Virtual Size:</span>{" "}
                    <span className="text-zinc-300">
                      {typeof section.virtual_size === 'number' ? section.virtual_size.toLocaleString() : 'Unknown'} bytes
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Raw Size:</span>{" "}
                    <span className="text-zinc-300">
                      {typeof section.raw_size === 'number' ? section.raw_size.toLocaleString() : 'Unknown'} bytes
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-zinc-500">
                    Entropy: <span className={
                      entropyValue > 7.0 
                        ? 'text-red-400' 
                        : entropyValue > 6.5 
                          ? 'text-amber-400' 
                          : 'text-green-400'
                    }>{section.entropy}</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Chi-Square: {section.chi_square}
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${entropyColor} rounded-full`} 
                    style={{ width: `${entropyPercent}%` }} 
                  />
                </div>
                
                <div className="mt-1 flex justify-between items-center text-xs">
                  <span className="text-zinc-500">0</span>
                  <div className="space-x-3 text-zinc-500">
                    <span>4</span>
                    <span>6</span>
                    <span>7</span>
                  </div>
                  <span className="text-zinc-500">8</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-black/20 rounded-md text-center text-zinc-500">
          No section data available
        </div>
      )}
      
      {sections.length > 0 && (
        <div className="mt-2 text-xs text-zinc-500">
          <p>
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Normal (0-5.5) |
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mx-1"></span> Compressed (5.5-6.5) |
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mx-1"></span> Packed (6.5-7.0) |
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-1"></span> Encrypted (7.0-8.0)
          </p>
        </div>
      )}
    </div>
  );
}