import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { PEAnalysisResult } from '../utils/pe-parser';

export interface SuspiciousIndicatorsProps {
  analysisData: PEAnalysisResult;
}

export function SuspiciousIndicators({ analysisData }: SuspiciousIndicatorsProps) {
  // Check if we're using the new data format
  const isNewFormat = 'header' in analysisData;
  
  // Component implementation
  const suspiciousIndicators = [];
  
  // Check for high entropy sections (possible packing/encryption)
  const highEntropySection = analysisData.sections.find(section => {
    const entropy = parseFloat(section.entropy);
    return entropy > 7.0;
  });
  
  if (highEntropySection) {
    suspiciousIndicators.push({
      title: 'Possible packed/encrypted content',
      description: `Section "${highEntropySection.name}" has high entropy (${highEntropySection.entropy}), suggesting possible packing or encryption.`,
      severity: 'high'
    });
  }
  
  // Check for potentially suspicious imports
  const suspiciousImportKeywords = ['inject', 'memory', 'remote', 'process', 'write'];
  
  // Handle imports differently based on format
  const hasSuspiciousImports = analysisData.imports?.some(dll => {
    // Functions are accessed the same way in both formats
    const functions = dll.functions || [];
    return functions.some((func: string) => 
      suspiciousImportKeywords.some(keyword => 
        func.toLowerCase().includes(keyword)
      )
    );
  });
  
  if (hasSuspiciousImports) {
    suspiciousIndicators.push({
      title: 'Suspicious API imports',
      description: 'This executable imports functions commonly used for code/DLL injection or memory manipulation.',
      severity: 'medium'
    });
  }

  // Check for low entropy sections that are unusual
  const unusualLowEntropySection = analysisData.sections.find(section => {
    const entropy = parseFloat(section.entropy);
    const rawSize = isNewFormat 
      ? (section as any).rawSize?.decimal || section.raw_size || 0
      : section.raw_size || 0;
      
    return entropy < 0.5 && rawSize > 1024;
  });

  if (unusualLowEntropySection) {
    suspiciousIndicators.push({
      title: 'Unusual section entropy',
      description: `Section "${unusualLowEntropySection.name}" has unusually low entropy, which could indicate large blocks of the same byte (padding or encrypted data).`,
      severity: 'low'
    });
  }

  // Check for executable sections with unusual names
  // This check depends on characteristics field which may be structured differently
  // in the new format, so adjust accordingly if the new data has this info
  const commonSectionNames = ['.text', '.code', 'CODE', 'INIT', '.init'];
  
  // In the new format, we may not have the characteristics bitmask directly,
  // so we'll need a different approach to check for executable sections
  // This is a simplified version that just checks for unusual section names
  const unusualSectionNames = analysisData.sections.filter(section =>
    !commonSectionNames.includes(section.name) &&
    section.name !== '.data' &&
    section.name !== '.rdata' &&
    section.name !== '.rsrc'
  );
  
  if (unusualSectionNames.length > 0) {
    suspiciousIndicators.push({
      title: 'Unusual section names',
      description: `Found sections with uncommon names: ${unusualSectionNames.map(s => s.name).join(', ')}`,
      severity: 'low'
    });
  }
  
  // Check for signature status
  if (isNewFormat && analysisData.signature) {
    if (analysisData.signature.isSigned === false) {
      suspiciousIndicators.push({
        title: 'Unsigned executable',
        description: 'This executable is not digitally signed, which is common for legitimate software.',
        severity: 'low'
      });
    } else if (analysisData.signature.isValid === false) {
      suspiciousIndicators.push({
        title: 'Invalid signature',
        description: 'This executable has an invalid digital signature, which could indicate tampering.',
        severity: 'high'
      });
    }
  }
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-blue-400 mb-2">Suspicious Indicators</h4>
      
      {suspiciousIndicators.length > 0 ? (
        <div className="space-y-3">
          {suspiciousIndicators.map((indicator, index) => (
            <div 
              key={index} 
              className={`bg-black/30 p-3 rounded-md border ${
                indicator.severity === 'high' 
                  ? 'border-red-500/30' 
                  : indicator.severity === 'medium' 
                    ? 'border-amber-500/30' 
                    : 'border-zinc-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  rounded-full p-1.5 
                  ${indicator.severity === 'high' 
                    ? 'bg-red-500/10 text-red-500' 
                    : indicator.severity === 'medium' 
                      ? 'bg-amber-500/10 text-amber-500' 
                      : 'bg-zinc-500/10 text-zinc-500'}
                `}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h5 className={`font-medium text-sm ${
                    indicator.severity === 'high' 
                      ? 'text-red-400' 
                      : indicator.severity === 'medium' 
                        ? 'text-amber-400' 
                        : 'text-zinc-300'
                  }`}>
                    {indicator.title}
                  </h5>
                  <p className="text-xs text-zinc-400 mt-1">{indicator.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/30 p-4 rounded-md border border-green-500/30">
          <div className="flex items-start gap-3">
            <div className="bg-green-500/10 text-green-500 rounded-full p-1.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h5 className="font-medium text-sm text-green-400">No suspicious indicators detected</h5>
              <p className="text-xs text-zinc-400 mt-1">
                No obvious suspicious patterns were found in this PE file.
                This doesn't guarantee the file is safe - always exercise caution.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-black/30 p-3 rounded-md border border-zinc-900 mt-4">
        <div className="flex gap-2 items-center mb-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <h5 className="text-xs font-medium text-zinc-300">Risk Assessment Factors</h5>
        </div>
        <div className="space-y-1 pl-6 text-xs">
          <p className="text-zinc-500">• High entropy sections (&gt; 7.0) often indicate encryption or packing</p>
          <p className="text-zinc-500">• Suspicious API imports may suggest malicious behavior</p>
          <p className="text-zinc-500">• Unusual section names or permissions can indicate obfuscation</p>
          <p className="text-zinc-500">• This is an automated analysis and may have false positives</p>
        </div>
      </div>
    </div>
  );
}