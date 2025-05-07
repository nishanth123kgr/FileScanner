import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { PEAnalysisResult, DataDirectory } from '../utils/pe-parser';

interface PEHeadersProps {
  analysisData: PEAnalysisResult;
}

export default function PEHeaders({ analysisData }: PEHeadersProps) {
  const [showAllDirectories, setShowAllDirectories] = useState(false);

  // Add debug log for incoming data
  React.useEffect(() => {
    console.log('PEHeaders received data:', {
      header: analysisData.header ? 'Present' : 'Missing',
      originalNewFormat: analysisData.originalNewFormat ? 'Present' : 'Missing',
      dosHeader: analysisData.dosHeader ? 'Present' : 'Missing',
      ntFileHeader: analysisData.ntFileHeader ? 'Present' : 'Missing',
      ntOptionalHeader: analysisData.ntOptionalHeader ? 'Present' : 'Missing',
    });
  }, [analysisData]);

  // Get PE headers from either the original format or adapted format
  const header = analysisData.originalNewFormat?.header || analysisData.header;
  const dosHeader = analysisData.dosHeader || header?.dosHeader;
  const fileHeader = analysisData.ntFileHeader || header?.fileHeader;
  const optionalHeader = analysisData.ntOptionalHeader || header?.optionalHeader;
  const dataDirectories = analysisData.dataDirectories || 
    optionalHeader?.dataDirectories ||
    (analysisData.originalNewFormat?.header?.optionalHeader?.dataDirectories || []);

  // Helper function to get machine type string
  const getMachine = () => {
    if (header?.machine?.type) {
      return `${header.machine.type} (${header.machine.code || ''})`;
    }
    return fileHeader?.machine || 'Unknown';
  };

  // Helper function to get number of sections
  const getNumberOfSections = () => {
    return header?.sectionCount || fileHeader?.numberOfSections || 0;
  };

  // Helper function to get timestamp
  const getTimestamp = () => {
    if (header?.fileHeader?.timestamp) {
      return new Date(header.fileHeader.timestamp * 1000).toUTCString();
    }
    return fileHeader?.timeDateStamp || 'Unknown';
  };

  // Helper function to get optional header size
  const getOptionalHeaderSize = () => {
    const size = header?.fileHeader?.optionalHeaderSize || 
      fileHeader?.sizeOfOptionalHeader || 0;
    return `${size} bytes`;
  };

  // Helper function to get characteristics flags
  const getCharacteristicsFlags = () => {
    if (header?.fileHeader?.characteristics?.flags) {
      return header.fileHeader.characteristics.flags;
    }
    return fileHeader?.characteristicsDescription || [];
  };

  // Helper function to get entry point
  const getEntryPoint = () => {
    if (header?.optionalHeader?.entryPoint || header?.entryPoint) {
      const ep = header?.optionalHeader?.entryPoint || header?.entryPoint || '';
      return ep.replace('0x', '');
    }
    if (optionalHeader?.addressOfEntryPoint) {
      return optionalHeader.addressOfEntryPoint.toString(16);
    }
    return '0';
  };

  // Helper function to get image base
  const getImageBase = () => {
    if (header?.optionalHeader?.imageBase) {
      return header.optionalHeader.imageBase.toString(16);
    }
    return (optionalHeader?.imageBase || 0).toString(16);
  };

  // Helper function to get section alignment
  const getSectionAlignment = () => {
    return header?.optionalHeader?.sectionAlignment || 
      optionalHeader?.sectionAlignment || 0;
  };

  // Helper function to get file alignment
  const getFileAlignment = () => {
    return header?.optionalHeader?.fileAlignment || 
      optionalHeader?.fileAlignment || 0;
  };

  // Helper function to get subsystem
  const getSubsystem = () => {
    if (header?.optionalHeader?.subsystem) {
      const subsystem = header.optionalHeader.subsystem;
      return `${subsystem.name || ''} (${subsystem.value || ''})`;
    }
    return optionalHeader?.subsystem || 'Unknown';
  };

  // Helper function to get magic value
  const getMagic = () => {
    return header?.format || optionalHeader?.magic || 'Unknown';
  };

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
                <div className="text-sm text-zinc-300 font-mono">
                  {typeof dosHeader.e_lfanew === 'number' ? 
                    dosHeader.e_lfanew : 
                    (parseInt(dosHeader.e_lfanew || '0', 16) || 0)}
                  {' '}(0x{typeof dosHeader.e_lfanew === 'number' ? 
                    dosHeader.e_lfanew.toString(16) : 
                    (parseInt(dosHeader.e_lfanew || '0', 16) || 0).toString(16)})
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-black/20 p-2 rounded-md">
              <div className="text-xs text-zinc-500">Machine</div>
              <div className="text-sm text-zinc-300">{getMachine()}</div>
            </div>
            <div className="bg-black/20 p-2 rounded-md">
              <div className="text-xs text-zinc-500">Number of Sections</div>
              <div className="text-sm text-zinc-300">{getNumberOfSections()}</div>
            </div>
            <div className="bg-black/20 p-2 rounded-md">
              <div className="text-xs text-zinc-500">Time/Date Stamp</div>
              <div className="text-sm text-zinc-300">{getTimestamp()}</div>
            </div>
            <div className="bg-black/20 p-2 rounded-md">
              <div className="text-xs text-zinc-500">Size of Optional Header</div>
              <div className="text-sm text-zinc-300">{getOptionalHeaderSize()}</div>
            </div>
          </div>
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">Characteristics</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {getCharacteristicsFlags().map((desc: string, index: number) => (
                <Badge 
                  key={index}
                  className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 text-xs"
                >
                  {desc}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NT Optional Header */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">NT Optional Header</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">Magic</div>
            <div className="text-sm text-zinc-300">{getMagic()}</div>
          </div>
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">Entry Point</div>
            <div className="text-sm text-zinc-300 font-mono">
              {parseInt(getEntryPoint(), 16)} (0x{getEntryPoint()})
            </div>
          </div>
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">Image Base</div>
            <div className="text-sm text-zinc-300 font-mono">
              {parseInt(getImageBase(), 16)} (0x{getImageBase()})
            </div>
          </div>
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">Section Alignment</div>
            <div className="text-sm text-zinc-300 font-mono">
              {getSectionAlignment()} (0x{getSectionAlignment().toString(16)})
            </div>
          </div>
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">File Alignment</div>
            <div className="text-sm text-zinc-300 font-mono">
              {getFileAlignment()} (0x{getFileAlignment().toString(16)})
            </div>
          </div>
          <div className="bg-black/20 p-2 rounded-md">
            <div className="text-xs text-zinc-500">Subsystem</div>
            <div className="text-sm text-zinc-300">{getSubsystem()}</div>
          </div>
        </div>
      </div>
    
      {/* Data Directories */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">Data Directories</h4>
        <div className="bg-black/20 p-2 rounded-md">
          {dataDirectories && dataDirectories.length > 0 ? (
            <div className="space-y-2">
              {dataDirectories.slice(0, showAllDirectories ? dataDirectories.length : 4).map((dir: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-zinc-400">{dir.name}</span>
                  <span className="text-sm text-zinc-300 font-mono">
                    {typeof dir.virtualAddress === 'number' ? 
                      dir.virtualAddress : 
                      parseInt(dir.virtualAddress || '0', 16)} 
                    (0x{(typeof dir.virtualAddress === 'number' ? 
                      dir.virtualAddress : 
                      parseInt(dir.virtualAddress || '0', 16)).toString(16)}) 
                    ({dir.size} bytes)
                  </span>
                </div>
              ))}
              {dataDirectories.length > 4 && (
                <button 
                  onClick={() => setShowAllDirectories(!showAllDirectories)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
                >
                  {showAllDirectories 
                    ? '▲ Show less' 
                    : `▼ Show all ${dataDirectories.length} directories`}
                </button>
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