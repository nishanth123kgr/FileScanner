import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { PEAnalysisResult } from '../utils/pe-parser';

export interface SuspiciousIndicatorsProps {
  analysisData: PEAnalysisResult;
}

export function SuspiciousIndicators({ analysisData }: SuspiciousIndicatorsProps) {
  // Component implementation
  const suspiciousIndicators = [];
  
  // Check for high entropy sections (possible packing/encryption)
  const highEntropySection = analysisData.sections.find(
    section => parseFloat(section.entropy) > 7.0
  );
  
  if (highEntropySection) {
    suspiciousIndicators.push({
      title: 'Possible packed/encrypted content',
      description: `Section "${highEntropySection.name}" has high entropy (${highEntropySection.entropy}), suggesting possible packing or encryption.`,
      severity: 'high'
    });
  }
  
  // Check for potentially suspicious imports
  const suspiciousImportKeywords = ['inject', 'memory', 'remote', 'process', 'write'];
  const hasSuspiciousImports = analysisData.imports?.some(dll => 
    dll.functions.some(func => 
      suspiciousImportKeywords.some(keyword => 
        func.toLowerCase().includes(keyword)
      )
    )
  );
  
  if (hasSuspiciousImports) {
    suspiciousIndicators.push({
      title: 'Suspicious API imports',
      description: 'This executable imports functions commonly used for code/DLL injection or memory manipulation.',
      severity: 'medium'
    });
  }

  // Check for low entropy sections that are unusual
  const unusualLowEntropySection = analysisData.sections.find(
    section => parseFloat(section.entropy) < 0.5 && section.raw_size > 1024
  );

  if (unusualLowEntropySection) {
    suspiciousIndicators.push({
      title: 'Unusual section entropy',
      description: `Section "${unusualLowEntropySection.name}" has unusually low entropy, which could indicate large blocks of the same byte (padding or encrypted data).`,
      severity: 'low'
    });
  }

  // Check for executable sections with unusual names
  const commonSectionNames = ['.text', '.code', 'CODE', 'INIT', '.init'];
  const unusualExecutableSection = analysisData.sections.find(
    section => (section.characteristics & 0x20000000) && !commonSectionNames.includes(section.name)
  );

  if (unusualExecutableSection) {
    suspiciousIndicators.push({
      title: 'Unusual executable section',
      description: `Section "${unusualExecutableSection.name}" is marked as executable but has an uncommon name.`,
      severity: 'medium'
    });
  }
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-blue-400 mb-2">Suspicious Indicators</h4>
      
      {suspiciousIndicators.length > 0 ? (
        <div className="space-y-3">
          {suspiciousIndicators.map((indicator, index) => (
            <div 
              key={index} 
              className={`bg-black/20 p-3 rounded-md border ${
                indicator.severity === 'high' 
                  ? 'border-red-500/30' 
                  : indicator.severity === 'medium' 
                    ? 'border-amber-500/30' 
                    : 'border-zinc-600/30'
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
        <div className="bg-black/20 p-4 rounded-md border border-green-500/30">
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

      <div className="bg-zinc-900/50 p-3 rounded-md border border-zinc-800/50 mt-4">
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