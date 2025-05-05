import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ImportedDll } from '../utils/pe-parser';

export interface ImportsAnalysisProps {
  imports: ImportedDll[] | any[];
}

export function ImportsAnalysis({ imports }: ImportsAnalysisProps) {
  // Check if we're using the new data format
  const isNewFormat = imports?.length > 0 && 'functionCount' in imports[0];
  
  // State to track which DLLs have their functions expanded
  const [expandedDlls, setExpandedDlls] = useState<Record<number, boolean>>({});
  
  // Toggle function expansion for a specific DLL by index
  const toggleFunctions = (index: number) => {
    setExpandedDlls(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-blue-400 mb-2">Imported Libraries</h4>
      
      {imports?.length > 0 ? (
        <div className="space-y-3">
          {imports.map((dll, index) => (
            <div key={index} className="bg-black/20 p-3 rounded-md">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="font-medium text-zinc-300">{dll.dll}</h5>
                {isNewFormat && (
                  <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs">
                    {dll.functionCount} functions
                  </Badge>
                )}
              </div>
              
              <div className="pl-2 border-l border-zinc-700/50 mt-2">
                {/* For new format, use functions directly if available */}
                {isNewFormat && dll.functions?.length > 0 ? (
                  <div className="space-y-1">
                    {dll.functions.slice(0, expandedDlls[index] ? dll.functions.length : 5).map((func: string, funcIndex: number) => (
                      <div key={funcIndex} className="text-xs text-zinc-400 font-mono">{func}</div>
                    ))}
                    {dll.functions.length > 5 && (
                      <button 
                        onClick={() => toggleFunctions(index)}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
                      >
                        {expandedDlls[index] 
                          ? '▲ Show less' 
                          : `▼ Show all ${dll.functions.length} functions`}
                      </button>
                    )}
                  </div>
                ) : (
                  /* For old format */
                  dll.functions?.length > 0 ? (
                    <div className="space-y-1">
                      {dll.functions.slice(0, expandedDlls[index] ? dll.functions.length : 5).map((func: string, funcIndex: number) => (
                        <div key={funcIndex} className="text-xs text-zinc-400 font-mono">{func}</div>
                      ))}
                      {dll.functions.length > 5 && (
                        <button 
                          onClick={() => toggleFunctions(index)}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
                        >
                          {expandedDlls[index] 
                            ? '▲ Show less' 
                            : `▼ Show all ${dll.functions.length} functions`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500">No function information available</div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/20 p-4 rounded-md">
          <div className="text-center text-zinc-500">
            No import information available. This could be due to:
          </div>
          <ul className="mt-2 text-xs text-zinc-500 list-disc pl-6 space-y-1">
            <li>Static linking</li>
            <li>Import obfuscation</li>
            <li>Corrupted import table</li>
            <li>Limited PE parsing capabilities</li>
          </ul>
          <div className="mt-3 text-center">
            <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs">
              Use detailed analysis tools for more information
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}