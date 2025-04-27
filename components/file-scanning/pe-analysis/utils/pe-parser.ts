/**
 * A frontend utility function to analyze PE file data using pe-library
 * Optimized for handling large files without browser slowdowns
 */
import { NtExecutable, type NtExecutableSection, Format } from 'pe-library';

/**
 * Represents a PE file section with analysis data
 */
export interface PESection {
  name: string;
  virtual_address: string;
  virtual_size: number;
  raw_size: number;
  entropy: string;
  chi_square: string;
  characteristics: number;
}

/**
 * Represents an imported DLL and its functions
 */
export interface ImportedDll {
  dll: string;
  functions: string[];
}

/**
 * Represents DOS Header information
 */
interface DOSHeader {
  e_magic: string;
  e_lfanew: number;
  e_cblp?: number;
  e_cp?: number;
  e_crlc?: number;
  e_cparhdr?: number;
  e_minalloc?: number;
  e_maxalloc?: number;
  e_ss?: number;
  e_sp?: number;
  e_csum?: number;
  e_ip?: number;
  e_cs?: number;
  e_lfarlc?: number;
  e_ovno?: number;
}

/**
 * Represents NT File Header information
 */
interface NTFileHeader {
  machine: string;
  numberOfSections: number;
  timeDateStamp: string;
  pointerToSymbolTable?: number;
  numberOfSymbols?: number;
  sizeOfOptionalHeader: number;
  characteristics: number;
  characteristicsDescription: string[];
}

/**
 * Represents NT Optional Header information
 */
interface NTOptionalHeader {
  magic: string;
  majorLinkerVersion?: number;
  minorLinkerVersion?: number;
  sizeOfCode?: number;
  sizeOfInitializedData?: number;
  sizeOfUninitializedData?: number;
  addressOfEntryPoint: number;
  baseOfCode?: number;
  baseOfData?: number;
  imageBase: number;
  sectionAlignment: number;
  fileAlignment: number;
  majorOperatingSystemVersion?: number;
  minorOperatingSystemVersion?: number;
  majorImageVersion?: number;
  minorImageVersion?: number;
  majorSubsystemVersion?: number;
  minorSubsystemVersion?: number;
  win32VersionValue?: number;
  sizeOfImage?: number;
  sizeOfHeaders?: number;
  checkSum?: number;
  subsystem: string;
  dllCharacteristics?: number;
  sizeOfStackReserve?: number;
  sizeOfStackCommit?: number;
  sizeOfHeapReserve?: number;
  sizeOfHeapCommit?: number;
  loaderFlags?: number;
  numberOfRvaAndSizes?: number;
}

/**
 * Represents a Data Directory entry
 */
interface DataDirectory {
  name: string;
  virtualAddress: number;
  size: number;
}

/**
 * Represents the complete PE file analysis result
 */
export interface PEAnalysisResult {
  file_size: number;
  machine_type?: string;
  timestamp?: string;
  sections: PESection[];
  imports?: ImportedDll[];
  dosHeader?: DOSHeader;
  ntFileHeader?: NTFileHeader;
  ntOptionalHeader?: NTOptionalHeader;
  dataDirectories?: DataDirectory[];
  error?: string;
  stack?: string;
}

// Size threshold to apply optimization strategies
const LARGE_SECTION_THRESHOLD = 1 * 1024 * 1024; // 1MB
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

/**
 * Calculate Shannon entropy for an array of bytes
 * Version optimized for large byte arrays with sampling
 * @param data - Array containing byte data
 * @param useFullData - Whether to analyze full data or use sampling
 * @returns Shannon entropy value (between 0-8)
 */
function calculateShannonEntropy(data: Uint8Array, useFullData: boolean = true): number {
  if (!data || data.length === 0) return 0;
  
  let dataToAnalyze: Uint8Array;
  
  // For large sections, use sampling to avoid slowdowns
  if (!useFullData && data.length > LARGE_SECTION_THRESHOLD) {
    // Sample the data - take first 100KB, middle 100KB, and last 100KB
    const sampleSize = 100 * 1024; // 100KB samples
    const samples = new Uint8Array(sampleSize * 3);
    
    // First sample
    const firstSample = data.slice(0, sampleSize);
    samples.set(firstSample, 0);
    
    // Middle sample
    const middleOffset = Math.floor(data.length / 2) - sampleSize / 2;
    const middleSample = data.slice(middleOffset, middleOffset + sampleSize);
    samples.set(middleSample, sampleSize);
    
    // Last sample
    const lastSample = data.slice(data.length - sampleSize);
    samples.set(lastSample, sampleSize * 2);
    
    dataToAnalyze = samples;
  } else {
    dataToAnalyze = data;
  }
  
  // Count occurrences of each byte value
  const counts: number[] = new Array(256).fill(0);
  for (let i = 0; i < dataToAnalyze.length; i++) {
    counts[dataToAnalyze[i]]++;
  }
  
  // Calculate entropy
  let entropy = 0;
  const dataLength = dataToAnalyze.length;
  
  for (let i = 0; i < 256; i++) {
    if (counts[i] > 0) {
      const probability = counts[i] / dataLength;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
}

/**
 * Calculate Chi-square statistic for an array of bytes
 * Version optimized for large byte arrays with sampling
 * @param data - Array containing byte data
 * @param useFullData - Whether to analyze full data or use sampling
 * @returns Chi-square value
 */
function calculateChiSquare(data: Uint8Array, useFullData: boolean = true): number {
  if (!data || data.length === 0) return 0;
  
  let dataToAnalyze: Uint8Array;
  
  // For large sections, use sampling to avoid slowdowns
  if (!useFullData && data.length > LARGE_SECTION_THRESHOLD) {
    // Sample the data - take first 50KB, middle 50KB, and last 50KB
    const sampleSize = 50 * 1024; // 50KB samples
    const samples = new Uint8Array(sampleSize * 3);
    
    // First sample
    const firstSample = data.slice(0, sampleSize);
    samples.set(firstSample, 0);
    
    // Middle sample
    const middleOffset = Math.floor(data.length / 2) - sampleSize / 2;
    const middleSample = data.slice(middleOffset, middleOffset + sampleSize);
    samples.set(middleSample, sampleSize);
    
    // Last sample
    const lastSample = data.slice(data.length - sampleSize);
    samples.set(lastSample, sampleSize * 2);
    
    dataToAnalyze = samples;
  } else {
    dataToAnalyze = data;
  }
  
  // Expected frequency in a uniform distribution
  const expected = dataToAnalyze.length / 256;
  
  // Count occurrences of each byte value
  const counts: number[] = new Array(256).fill(0);
  for (let i = 0; i < dataToAnalyze.length; i++) {
    counts[dataToAnalyze[i]]++;
  }
  
  // Calculate chi-square
  let chiSquare = 0;
  for (let i = 0; i < 256; i++) {
    const deviation = counts[i] - expected;
    chiSquare += (deviation * deviation) / expected;
  }
  
  return chiSquare;
}

/**
 * Extract section data from PE file using pe-library
 * Version optimized for both small and large files
 * @param arrayBuffer - ArrayBuffer containing the PE file data
 * @param isLargeFile - Flag to indicate if file is above threshold
 * @returns Object containing PE file analysis information
 */
export async function analyzePEFile(arrayBuffer: ArrayBuffer, isLargeFile: boolean = false): Promise<PEAnalysisResult> {
  console.log('Analyzing PE file...');
  
  // If not explicitly set, determine if this is a large file
  if (isLargeFile === undefined) {
    isLargeFile = arrayBuffer.byteLength > LARGE_FILE_THRESHOLD;
  }
  
  if (isLargeFile) {
    console.warn(`Large PE file detected (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB). Using optimized mode.`);
  }
  
  try {
    // Convert ArrayBuffer to Uint8Array which pe-library can use
    const fileData = new Uint8Array(arrayBuffer);
    
    // Parse the PE file using NtExecutable - use worker if available
    const executable = await NtExecutable.from(fileData);
    
    // Get the file headers
    const dosHeader = executable.dosHeader;
    const ntHeaders = executable.newHeader;
    
    const result: PEAnalysisResult = {
      file_size: arrayBuffer.byteLength,
      machine_type: ntHeaders?.fileHeader?.machine?.toString() || 'Unknown',
      timestamp: ntHeaders?.fileHeader?.timeDateStamp ? 
        new Date(ntHeaders.fileHeader.timeDateStamp * 1000).toISOString() : 
        'Unknown',
      sections: []
    };
    
    // Extract DOS Header information
    if (dosHeader) {
      // Using a simplified approach with any to avoid typechecking issues
      const dosHeaderAny = dosHeader as any;
      
      result.dosHeader = {
        e_magic: `0x${dosHeader.magic?.toString(16).padStart(4, '0') || '0000'}`,
        e_lfanew: dosHeaderAny.lfanew || dosHeaderAny.e_lfanew || 0,
        e_cblp: 0,  // Default values for properties that might not be directly accessible
        e_cp: 0,
        e_crlc: 0,
        e_cparhdr: 0,
        e_minalloc: 0,
        e_maxalloc: 0,
        e_ss: 0,
        e_sp: 0,
        e_csum: 0,
        e_ip: 0,
        e_cs: 0,
        e_lfarlc: 0,
        e_ovno: 0
      };
    }
    
    // Extract NT File Header information
    if (ntHeaders?.fileHeader) {
      const fileHeader = ntHeaders.fileHeader;
      const characteristicsDescMap: Record<number, string> = {
        0x0001: "IMAGE_FILE_RELOCS_STRIPPED",
        0x0002: "IMAGE_FILE_EXECUTABLE_IMAGE",
        0x0004: "IMAGE_FILE_LINE_NUMS_STRIPPED",
        0x0008: "IMAGE_FILE_LOCAL_SYMS_STRIPPED",
        0x0010: "IMAGE_FILE_AGGRESIVE_WS_TRIM",
        0x0020: "IMAGE_FILE_LARGE_ADDRESS_AWARE",
        0x0040: "Reserved",
        0x0080: "IMAGE_FILE_BYTES_REVERSED_LO",
        0x0100: "IMAGE_FILE_32BIT_MACHINE",
        0x0200: "IMAGE_FILE_DEBUG_STRIPPED",
        0x0400: "IMAGE_FILE_REMOVABLE_RUN_FROM_SWAP",
        0x0800: "IMAGE_FILE_NET_RUN_FROM_SWAP",
        0x1000: "IMAGE_FILE_SYSTEM",
        0x2000: "IMAGE_FILE_DLL",
        0x4000: "IMAGE_FILE_UP_SYSTEM_ONLY",
        0x8000: "IMAGE_FILE_BYTES_REVERSED_HI"
      };
      
      // Map machine types to human-readable strings
      const machineTypeMap: Record<number, string> = {
        0x0: "IMAGE_FILE_MACHINE_UNKNOWN",
        0x1d3: "IMAGE_FILE_MACHINE_AM33",
        0x8664: "IMAGE_FILE_MACHINE_AMD64",
        0x1c0: "IMAGE_FILE_MACHINE_ARM",
        0xaa64: "IMAGE_FILE_MACHINE_ARM64",
        0x1c4: "IMAGE_FILE_MACHINE_ARMNT",
        0xebc: "IMAGE_FILE_MACHINE_EBC",
        0x14c: "IMAGE_FILE_MACHINE_I386",
        0x200: "IMAGE_FILE_MACHINE_IA64",
        0x9041: "IMAGE_FILE_MACHINE_M32R",
        0x266: "IMAGE_FILE_MACHINE_MIPS16",
        0x366: "IMAGE_FILE_MACHINE_MIPSFPU",
        0x466: "IMAGE_FILE_MACHINE_MIPSFPU16",
        0x1f0: "IMAGE_FILE_MACHINE_POWERPC",
        0x1f1: "IMAGE_FILE_MACHINE_POWERPCFP",
        0x166: "IMAGE_FILE_MACHINE_R4000",
        0x5032: "IMAGE_FILE_MACHINE_RISCV32",
        0x5064: "IMAGE_FILE_MACHINE_RISCV64",
        0x5128: "IMAGE_FILE_MACHINE_RISCV128",
        0x1a2: "IMAGE_FILE_MACHINE_SH3",
        0x1a3: "IMAGE_FILE_MACHINE_SH3DSP",
        0x1a6: "IMAGE_FILE_MACHINE_SH4",
        0x1a8: "IMAGE_FILE_MACHINE_SH5",
        0x1c2: "IMAGE_FILE_MACHINE_THUMB",
        0x169: "IMAGE_FILE_MACHINE_WCEMIPSV2"
      };
      
      // Get characteristics descriptions
      const characteristicsDesc: string[] = [];
      const characteristics = fileHeader.characteristics || 0;
      Object.entries(characteristicsDescMap).forEach(([bitValue, desc]) => {
        if (characteristics & Number(bitValue)) {
          characteristicsDesc.push(desc);
        }
      });
      
      // Get machine type
      const machineType = machineTypeMap[fileHeader.machine] || `Unknown (0x${fileHeader.machine?.toString(16) || '0'})`;
      
      result.ntFileHeader = {
        machine: machineType,
        numberOfSections: fileHeader.numberOfSections || 0,
        timeDateStamp: fileHeader.timeDateStamp ? 
          new Date(fileHeader.timeDateStamp * 1000).toISOString() : 
          'Unknown',
        pointerToSymbolTable: fileHeader.pointerToSymbolTable,
        numberOfSymbols: fileHeader.numberOfSymbols,
        sizeOfOptionalHeader: fileHeader.sizeOfOptionalHeader || 0,
        characteristics: fileHeader.characteristics || 0,
        characteristicsDescription: characteristicsDesc
      };
    }
    
    // Extract NT Optional Header information
    if (ntHeaders?.optionalHeader) {
      const optHeader = ntHeaders.optionalHeader;
      
      // Map subsystem values to human-readable strings
      const subsystemMap: Record<number, string> = {
        0: "IMAGE_SUBSYSTEM_UNKNOWN",
        1: "IMAGE_SUBSYSTEM_NATIVE",
        2: "IMAGE_SUBSYSTEM_WINDOWS_GUI",
        3: "IMAGE_SUBSYSTEM_WINDOWS_CUI",
        5: "IMAGE_SUBSYSTEM_OS2_CUI",
        7: "IMAGE_SUBSYSTEM_POSIX_CUI",
        8: "IMAGE_SUBSYSTEM_NATIVE_WINDOWS",
        9: "IMAGE_SUBSYSTEM_WINDOWS_CE_GUI",
        10: "IMAGE_SUBSYSTEM_EFI_APPLICATION",
        11: "IMAGE_SUBSYSTEM_EFI_BOOT_SERVICE_DRIVER",
        12: "IMAGE_SUBSYSTEM_EFI_RUNTIME_DRIVER",
        13: "IMAGE_SUBSYSTEM_EFI_ROM",
        14: "IMAGE_SUBSYSTEM_XBOX",
        16: "IMAGE_SUBSYSTEM_WINDOWS_BOOT_APPLICATION"
      };
      
      // Map magic values to human-readable strings
      const magicMap: Record<number, string> = {
        0x10b: "PE32 (32-bit)",
        0x20b: "PE32+ (64-bit)"
      };
      
      result.ntOptionalHeader = {
        magic: magicMap[optHeader.magic] || `Unknown (0x${optHeader.magic?.toString(16) || '0'})`,
        majorLinkerVersion: optHeader.majorLinkerVersion,
        minorLinkerVersion: optHeader.minorLinkerVersion,
        sizeOfCode: optHeader.sizeOfCode,
        sizeOfInitializedData: optHeader.sizeOfInitializedData,
        sizeOfUninitializedData: optHeader.sizeOfUninitializedData,
        addressOfEntryPoint: optHeader.addressOfEntryPoint || 0,
        baseOfCode: optHeader.baseOfCode,
        // baseOfData is only in 32-bit PE files, so handle conditionally
        baseOfData: 'baseOfData' in optHeader ? optHeader.baseOfData : undefined,
        imageBase: optHeader.imageBase || 0,
        sectionAlignment: optHeader.sectionAlignment || 0,
        fileAlignment: optHeader.fileAlignment || 0,
        majorOperatingSystemVersion: optHeader.majorOperatingSystemVersion,
        minorOperatingSystemVersion: optHeader.minorOperatingSystemVersion,
        majorImageVersion: optHeader.majorImageVersion,
        minorImageVersion: optHeader.minorImageVersion,
        majorSubsystemVersion: optHeader.majorSubsystemVersion,
        minorSubsystemVersion: optHeader.minorSubsystemVersion,
        win32VersionValue: optHeader.win32VersionValue,
        sizeOfImage: optHeader.sizeOfImage,
        sizeOfHeaders: optHeader.sizeOfHeaders,
        checkSum: optHeader.checkSum,
        subsystem: subsystemMap[optHeader.subsystem] || `Unknown (${optHeader.subsystem || 0})`,
        dllCharacteristics: optHeader.dllCharacteristics,
        sizeOfStackReserve: optHeader.sizeOfStackReserve,
        sizeOfStackCommit: optHeader.sizeOfStackCommit,
        sizeOfHeapReserve: optHeader.sizeOfHeapReserve,
        sizeOfHeapCommit: optHeader.sizeOfHeapCommit,
        loaderFlags: optHeader.loaderFlags,
        numberOfRvaAndSizes: optHeader.numberOfRvaAndSizes
      };
      
      // Extract Data Directories information - only for header data
      const optHeaderAny = ntHeaders.optionalHeader as any;
      if (optHeaderAny.dataDirectory) {
        result.dataDirectories = [];
        const directoryNames = [
          "Export Table", "Import Table", "Resource Table", "Exception Table",
          "Certificate Table", "Base Relocation Table", "Debug", "Architecture",
          "Global Pointer", "TLS Table", "Load Config Table", "Bound Import",
          "Import Address Table", "Delay Import Descriptor", "CLR Runtime Header", "Reserved"
        ];
        
        // Loop through available data directories
        const dataDirectories = optHeaderAny.dataDirectory;
        for (let i = 0; i < directoryNames.length && i < dataDirectories.length; i++) {
          const entry = dataDirectories[i];
          if (entry && (entry.virtualAddress || entry.size)) {
            result.dataDirectories.push({
              name: directoryNames[i],
              virtualAddress: entry.virtualAddress || 0,
              size: entry.size || 0
            });
          }
        }
      }
    }
    
    // Process each section using getAllSections() method - with optimization for large files
    const sections = executable.getAllSections() || [];
    
    // For large files, limit section processing to avoid browser slowdown
    const sectionsToProcess = isLargeFile ? Math.min(sections.length, 10) : sections.length;
    
    for (let i = 0; i < sectionsToProcess; i++) {
      const section = sections[i];
      // Get section data for statistical analysis
      let sectionData = new Uint8Array(0);
      
      try {
        // Get the raw data for the section
        if (section.data && section.data.byteLength > 0) {
          sectionData = new Uint8Array(section.data);
        }
      } catch (e) {
        console.warn(`Could not get raw data for section ${section.info.name}`, e);
      }
      
      // Skip entropy calculation for very large sections in large files
      const skipFullAnalysis = isLargeFile && sectionData.length > LARGE_SECTION_THRESHOLD;
      
      // Calculate statistical measures - using sampling for large sections
      const entropy = calculateShannonEntropy(sectionData, !skipFullAnalysis);
      const chiSquare = calculateChiSquare(sectionData, !skipFullAnalysis);
      
      result.sections.push({
        name: section.info.name || 'Unnamed',
        virtual_address: `0x${section.info.virtualAddress?.toString(16).padStart(8, '0') || '00000000'}`,
        virtual_size: section.info.virtualSize || 0,
        raw_size: section.info.sizeOfRawData || 0,
        entropy: entropy.toFixed(6),
        chi_square: chiSquare.toFixed(2),
        characteristics: section.info.characteristics || 0
      });
      
      // For large files, add a small delay between processing sections to avoid UI freezing
      if (isLargeFile && i < sectionsToProcess - 1) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // If we limited section processing, add a note about skipped sections
    if (sectionsToProcess < sections.length) {
      result.sections.push({
        name: `[${sections.length - sectionsToProcess} more sections - skipped for performance]`,
        virtual_address: '0x00000000',
        virtual_size: 0,
        raw_size: 0,
        entropy: '0.000000',
        chi_square: '0.00',
        characteristics: 0
      });
    }
    
    // Extract imports information only for smaller files
    if (!isLargeFile) {
      try {
        // Use a manual approach to extract imports instead of getImports()
        const importDir = result.dataDirectories?.find(dir => dir.name === "Import Table");
        if (importDir && importDir.virtualAddress && importDir.size) {
          // For now, we'll just use the section data to extract basic import information
          const importedDlls: ImportedDll[] = [];
          
          // If this is a simple case where we can match sections with imports
          for (const section of sections) {
            if (section.info.name?.includes('.idata') || 
                section.info.name?.includes('IMPORT') || 
                (section.info.virtualAddress <= importDir.virtualAddress && 
                 section.info.virtualAddress + section.info.virtualSize >= importDir.virtualAddress + importDir.size)) {
              
              importedDlls.push({
                dll: "Import information available",
                functions: ["Use detailed analysis for function names"]
              });
              break;
            }
          }
          
          if (importedDlls.length > 0) {
            result.imports = importedDlls;
          }
        }
      } catch (e) {
        console.warn('Could not extract import information', e);
      }
    }
    
    return result;
  } catch (error) {
    // Type assertion for error object
    const err = error as Error;
    return {
      file_size: arrayBuffer.byteLength,
      sections: [],
      error: `Error analyzing PE file: ${err.message}`,
      stack: err.stack
    };
  }
}

/**
 * Example usage:
 * 
 * // With File input element
 * document.getElementById('fileInput')?.addEventListener('change', async (event) => {
 *   const file = (event.target as HTMLInputElement)?.files?.[0];
 *   if (!file) return;
 *   
 *   const arrayBuffer = await file.arrayBuffer();
 *   const peData = await analyzePEFile(arrayBuffer);
 *   console.log(peData);
 * });
 * 
 * // Or with fetch
 * async function analyzePEFromUrl(url: string): Promise<PEAnalysisResult> {
 *   const response = await fetch(url);
 *   const arrayBuffer = await response.arrayBuffer();
 *   const peData = await analyzePEFile(arrayBuffer);
 *   return peData;
 * }
 */