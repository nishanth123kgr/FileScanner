import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { PEAnalysisResult } from '../utils/pe-parser';

interface PEHeadersProps {
  analysisData: PEAnalysisResult;
}

export default function PEHeaders({ analysisData }: PEHeadersProps) {
  const { dosHeader, ntFileHeader, ntOptionalHeader, dataDirectories } = analysisData;

  return (
    <div className="space-y-4">
      {/* DOS Header */}
      <div>
        <h4 className="text-sm font-medium text-blue-400 mb-2">DOS Header</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {dosHeader && (
            <>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">e_magic</div>
                <div className="text-sm text-zinc-300 font-mono">{dosHeader.e_magic}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">e_lfanew</div>
                <div className="text-sm text-zinc-300 font-mono">0x{dosHeader.e_lfanew.toString(16)}</div>
              </div>
            </>
          )}
          {!dosHeader && (
            <div className="bg-black/20 p-2 rounded-md col-span-2">
              <div className="text-sm text-zinc-500">No DOS header information available</div>
            </div>
          )}
        </div>
      </div>

      {/* NT File Header */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">NT File Header</h4>
        <div className="space-y-2">
          {ntFileHeader ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="text-xs text-zinc-500">Machine</div>
                  <div className="text-sm text-zinc-300">{ntFileHeader.machine}</div>
                </div>
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="text-xs text-zinc-500">Number of Sections</div>
                  <div className="text-sm text-zinc-300">{ntFileHeader.numberOfSections}</div>
                </div>
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="text-xs text-zinc-500">Time/Date Stamp</div>
                  <div className="text-sm text-zinc-300">{ntFileHeader.timeDateStamp}</div>
                </div>
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="text-xs text-zinc-500">Size of Optional Header</div>
                  <div className="text-sm text-zinc-300">{ntFileHeader.sizeOfOptionalHeader} bytes</div>
                </div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">Characteristics</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ntFileHeader.characteristicsDescription.map((desc) => (
                    <Badge key={desc} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 text-xs">
                      {desc}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-black/20 p-2 rounded-md">
              <div className="text-sm text-zinc-500">No NT File header information available</div>
            </div>
          )}
        </div>
      </div>

      {/* NT Optional Header */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">NT Optional Header</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {ntOptionalHeader ? (
            <>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">Magic</div>
                <div className="text-sm text-zinc-300">{ntOptionalHeader.magic}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">Entry Point</div>
                <div className="text-sm text-zinc-300 font-mono">0x{ntOptionalHeader.addressOfEntryPoint.toString(16)}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">Image Base</div>
                <div className="text-sm text-zinc-300 font-mono">0x{ntOptionalHeader.imageBase.toString(16)}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">Section Alignment</div>
                <div className="text-sm text-zinc-300 font-mono">0x{ntOptionalHeader.sectionAlignment.toString(16)}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">File Alignment</div>
                <div className="text-sm text-zinc-300 font-mono">0x{ntOptionalHeader.fileAlignment.toString(16)}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-md">
                <div className="text-xs text-zinc-500">Subsystem</div>
                <div className="text-sm text-zinc-300">{ntOptionalHeader.subsystem}</div>
              </div>
            </>
          ) : (
            <div className="bg-black/20 p-2 rounded-md col-span-3">
              <div className="text-sm text-zinc-500">No NT Optional header information available</div>
            </div>
          )}
        </div>
      </div>
    
      {/* Data Directories */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">Data Directories</h4>
        <div className="bg-black/20 p-2 rounded-md">
          {dataDirectories && dataDirectories.length > 0 ? (
            <div className="space-y-2">
              {dataDirectories.slice(0, 4).map((dir, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-zinc-400">{dir.name}</span>
                  <span className="text-sm text-zinc-300 font-mono">
                    0x{dir.virtualAddress.toString(16)} ({dir.size} bytes)
                  </span>
                </div>
              ))}
              {dataDirectories.length > 4 && (
                <div className="text-xs text-zinc-500 mt-1">
                  + {dataDirectories.length - 4} more directories
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No data directories information available</div>
          )}
        </div>
      </div>
    </div>
  );
}