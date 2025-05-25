import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  FileIcon, FileText, FileBadge, Image, FileCode, FileX, 
  File, Copy, CheckCircle, AlertCircle 
} from 'lucide-react';
import type { ResourceEntry } from '../utils/pe-parser';
import { cn } from '@/utils/utils';
import { Tooltip } from '@/components/ui/tooltip';

export interface ResourcesAnalysisProps {
  resources: ResourceEntry[] | any[];
}

export function ResourcesAnalysis({ resources }: ResourcesAnalysisProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  // Check if we're using the new data format (with language object format instead of string)
  const isNewFormat = resources?.length > 0 && 
    resources[0].language && typeof resources[0].language !== 'string';

  // Group resources by type
  const resourcesByType = resources.reduce((acc, resource) => {
    const type = resource.type.toLowerCase();
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Helper function to get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'icon': return <Image className="h-3.5 w-3.5 text-blue-500" />;
      case 'manifest': return <FileCode className="h-3.5 w-3.5 text-purple-500" />;
      case 'version': return <FileBadge className="h-3.5 w-3.5 text-green-500" />;
      case 'dialog': return <FileText className="h-3.5 w-3.5 text-amber-500" />;
      case 'group icon': return <Image className="h-3.5 w-3.5 text-indigo-500" />;
      default: return <File className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };
  
  // Helper for entropy status and color
  const getEntropyInfo = (entropy: number) => {
    if (entropy > 7.0) return { status: 'High', color: 'text-red-500' };
    if (entropy > 6.5) return { status: 'Medium', color: 'text-amber-500' };
    if (entropy > 5.5) return { status: 'Normal', color: 'text-blue-500' };
    return { status: 'Low', color: 'text-green-500' };
  };
  
  // Copy hash to clipboard
  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };
  
  // Helper functions to get correct data regardless of format
  const getHash = (resource: any): string => {
    return resource.sha256 || resource.md5 || '';
  };

  const getLanguage = (resource: any): string => {
    return typeof resource.language === 'string' ? 
      resource.language : 
      resource.language || 'Unknown';
  };

  const getEntropy = (resource: any): number => {
    return parseFloat(resource.entropy) || 0;
  };

  const getSize = (resource: any): number => {
    return resource.size || 0;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-blue-400">PE Resources</h4>
        <div className="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 px-2 py-0.5 text-xs">
          {resources?.length || 0} resources
        </div>
      </div>
      
      {resources.length > 0 ? (
        <div className="space-y-1">
          <div className="grid grid-cols-12 text-[10px] text-zinc-500 px-2 py-1 font-medium">
            <div className="col-span-3">Type</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-1 text-center">Lang</div>
            <div className="col-span-2 text-center">Entropy</div>
            <div className="col-span-4">Hash</div>
          </div>
          
          {resources.map((resource, index) => {
            const entropy = getEntropy(resource);
            const entropyInfo = getEntropyInfo(entropy);
            const hash = getHash(resource);
            const shortHash = hash ? `${hash.substring(0, 16)}...` : 'N/A';
            
            return (
              <div 
                key={index}
                className={cn(
                  "grid grid-cols-12 gap-x-1 items-center text-xs px-2 py-1.5 rounded hover:bg-zinc-900/30",
                  index % 2 === 0 ? "bg-black/30 border border-zinc-900" : "bg-black/20 border border-zinc-900"
                )}
              >
                <div className="col-span-3 flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="truncate font-medium text-white">
                    {resource.type}
                  </div>
                </div>
                
                <div className="col-span-2 text-zinc-400">
                  {getSize(resource).toLocaleString()} B
                </div>
                
                <div className="col-span-1 text-center">
                  <Badge className="text-[9px] bg-zinc-800/70 hover:bg-zinc-800 px-1 py-0">
                    {getLanguage(resource)}
                  </Badge>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className={cn("inline-flex items-center gap-1", entropyInfo.color)}>
                    {entropy.toFixed(2)}
                    {entropy > 7.0 && (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </span>
                </div>
                
                <div className="col-span-4 flex items-center gap-1">
                  <span className="font-mono text-zinc-400 truncate">
                    {shortHash}
                  </span>
                  {hash && (
                    <button 
                      onClick={() => copyToClipboard(hash)}
                      className="text-zinc-500 hover:text-zinc-300"
                      title="Copy full hash"
                    >
                      {copiedHash === hash ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-black/30 rounded-md text-center text-zinc-500 border border-zinc-900">
          <FileX className="h-4 w-4 mx-auto mb-1 opacity-50" />
          No resource data available
        </div>
      )}
      
      <div className="mt-3 text-xs text-zinc-500">
        <p>
          High entropy ({'>'}7.0) may indicate compression, encryption or obfuscation.
        </p>
      </div>
    </div>
  );
}