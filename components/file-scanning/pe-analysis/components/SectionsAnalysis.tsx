import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Copy, CheckCircle } from 'lucide-react';
import type { PESection } from '../utils/pe-parser';
import { cn } from '@/utils/utils';

export interface SectionsAnalysisProps {
  sections: PESection[] | any[];
}

export function SectionsAnalysis({ sections }: SectionsAnalysisProps) {
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);
  
  // Check if sections is valid and contains data
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-blue-400">Section Entropy Analysis</h4>
          <Badge variant="outline" className="bg-zinc-900/50 text-xs">0 sections</Badge>
        </div>
        <div className="p-3 bg-black/30 rounded-md text-center text-zinc-500 border border-zinc-900">
          No section data available
        </div>
      </div>
    );
  }
  
  // Check if we're using the new data format (with virtualAddress as object)
  const isNewFormat = sections && sections.length > 0 && 
    typeof sections[0].virtualAddress === 'object';
    
  // Debug logging for section data format
  React.useEffect(() => {
    if (sections && sections.length > 0) {
      console.log('Section data format sample:', sections[0]);
    }
  }, [sections]);
  
  // Helper function to get color based on entropy
  const getEntropyInfo = (entropy: number) => {
    if (entropy > 7.0) return { status: 'Encrypted', color: 'text-red-500' };
    if (entropy > 6.5) return { status: 'Packed', color: 'text-amber-500' };
    if (entropy > 5.5) return { status: 'Compressed', color: 'text-blue-500' };
    return { status: 'Normal', color: 'text-green-500' };
  };
  
  // Calculate entropy percentage (0-8 is typical range for entropy)
  const getEntropyPercentage = (entropy: number) => {
    return Math.min(Math.max((entropy / 8) * 100, 0), 100);
  };
  
  // Copy address to clipboard
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Helper function to get value based on format
  const getAddress = (section: any): string => {
    // Try multiple possible paths to get the virtual address
    let address;
    
    if (isNewFormat && section.virtualAddress?.hex) {
      address = section.virtualAddress.hex;
    } else if (section.virtual_address) {
      address = section.virtual_address;
    } else if (typeof section.virtualAddress === 'string') {
      address = section.virtualAddress;
    } else if (typeof section.virtualAddress === 'number') {
      address = `0x${section.virtualAddress.toString(16).padStart(8, '0')}`;
    } else if (section.info?.virtualAddress) {
      address = `0x${section.info.virtualAddress.toString(16).padStart(8, '0')}`;
    } else {
      address = "0x0";
    }
    
    // Ensure address starts with 0x
    if (typeof address === 'string' && !address.startsWith('0x')) {
      address = `0x${address}`;
    }
    
    return address;
  };

  // Parse any hex value to a number, handling various formats
  const parseHexToNumber = (hexValue: any): number => {
    if (hexValue === null || hexValue === undefined) return 0;
    
    if (typeof hexValue === 'number') return hexValue;
    
    if (typeof hexValue === 'object') {
      if (hexValue.decimal !== undefined) return hexValue.decimal;
      if (hexValue.value !== undefined) return parseHexToNumber(hexValue.value);
    }
    
    if (typeof hexValue === 'string') {
      try {
        return parseInt(hexValue.replace(/^0x/i, ''), 16) || 0;
      } catch (e) {
        return 0;
      }
    }
    
    return 0;
  };
  
  const getVirtualSize = (section: any): number => {
    // Try multiple possible paths to get the virtual size
    if (isNewFormat && section.virtualSize?.decimal) {
      return section.virtualSize.decimal;
    }
    
    if (section.virtual_size !== undefined) {
      return typeof section.virtual_size === 'number' ? 
        section.virtual_size : parseHexToNumber(section.virtual_size);
    }
    
    if (section.virtualSize !== undefined) {
      return parseHexToNumber(section.virtualSize);
    }
    
    if (section.info?.virtualSize !== undefined) {
      return parseHexToNumber(section.info.virtualSize);
    }
    
    return 0;
  };

  const getRawSize = (section: any): number => {
    // Try multiple possible paths to get the raw size
    if (isNewFormat && section.rawSize?.decimal) {
      return section.rawSize.decimal;
    }
    
    if (section.raw_size !== undefined) {
      return typeof section.raw_size === 'number' ? 
        section.raw_size : parseHexToNumber(section.raw_size);
    }
    
    if (section.rawSize !== undefined) {
      return parseHexToNumber(section.rawSize);
    }
    
    if (section.info?.sizeOfRawData !== undefined) {
      return parseHexToNumber(section.info.sizeOfRawData);
    }
    
    return 0;
  };

  const getEntropy = (section: any): number => {
    return parseFloat(section.entropy) || 0;
  };

  const getChiSquare = (section: any): string => {
    if (isNewFormat) {
      return section.chiSquared?.toFixed(2) || "N/A";
    }
    return section.chi_square || "N/A";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-blue-400">Section Entropy Analysis</h4>
        <div className="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 px-2 py-0.5 text-xs">
          {sections?.length || 0} sections
        </div>
      </div>
      
      {sections.length > 0 ? (
        <div className="space-y-1">
          <div className="grid grid-cols-12 text-[10px] text-zinc-500 px-2 py-1 font-medium">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Address</div>
            <div className="col-span-3">Size</div>
            <div className="col-span-2 text-center">Entropy</div>
            <div className="col-span-3 text-center">Chi-Square</div>
          </div>
          
          {sections.map((section, index) => {
            const entropyValue = getEntropy(section);
            const entropyInfo = getEntropyInfo(entropyValue);
            const address = getAddress(section);
            
            return (
              <div 
                key={index}
                className={cn(
                  "grid grid-cols-12 gap-x-1 items-center text-xs px-2 py-1.5 rounded hover:bg-zinc-900/30",
                  index % 2 === 0 ? "bg-black/30 border border-zinc-900" : "bg-black/20 border border-zinc-900"
                )}
              >
                <div className="col-span-2 font-medium text-white truncate">
                  {section.name}
                  {isNewFormat && section.nameASCII && (
                    <span className="ml-1 text-[9px] text-zinc-500">{section.nameASCII}</span>
                  )}
                </div>
                
                <div className="col-span-2 flex items-center gap-1">
                  <code className="text-zinc-400 text-[10px]">
                    {parseInt(address.replace('0x', ''), 16)} (0x{address.replace('0x', '')})
                  </code>
                  <button 
                    onClick={() => copyToClipboard(address)}
                    className="text-zinc-500 hover:text-zinc-300"
                    title="Copy address"
                  >
                    {copiedAddress === address ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                
                <div className="col-span-3 grid grid-cols-2 gap-1 text-zinc-400 text-[10px]">
                  <div>V: {getVirtualSize(section).toLocaleString()}</div>
                  <div>R: {getRawSize(section).toLocaleString()}</div>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className={cn("inline-flex items-center gap-1", entropyInfo.color)}>
                    {entropyValue.toFixed(2)}
                    {entropyValue > 7.0 && (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </span>
                </div>
                
                <div className="col-span-3 text-center text-zinc-400">
                  {getChiSquare(section)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-black/30 rounded-md text-center text-zinc-500 border border-zinc-900">
          No section data available
        </div>
      )}
      
      <div className="mt-3 text-xs text-zinc-500">
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Normal (0-5.5)</span>
          <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Compressed (5.5-6.5)</span>
          <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Packed (6.5-7.0)</span>
          <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span> Encrypted (7.0+)</span>
        </div>
      </div>
    </div>
  );
}