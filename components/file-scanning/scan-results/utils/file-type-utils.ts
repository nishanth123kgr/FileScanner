/**
 * Utilities for file type detection and analysis
 */
import { bufferToHex } from './buffer-utils';

/**
 * Interface for basic file data
 */
export interface FileData {
  fileName: string;
  fileType: string;
  fileSize: string;
}

/**
 * Gets the file header as a hex string
 */
export const getFileHeader = async (file: File | null, bytesToRead: number = 8): Promise<string | null> => {
  if (!file) return null;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, bytesToRead));
    return bufferToHex(headerBytes);
  } catch (error) {
    console.error('Error reading file header:', error);
    return null;
  }
};

/**
 * Maps file signatures to their types based on magic numbers
 */
export const identifyFileType = (headerHex: string): string => {
  if (headerHex.startsWith('4d5a')) {
    return 'PE Executable (Windows)';
  } else if (headerHex.startsWith('7f454c46')) {
    return 'ELF (Linux/Unix Executable)';
  } else if (headerHex.startsWith('cafebabe')) {
    return 'Java Class file';
  } else if (headerHex.startsWith('504b0304')) {
    return 'ZIP archive (may be DOCX/XLSX/PPTX/JAR/APK)';
  } else if (headerHex.startsWith('25504446')) {
    return 'PDF document';
  } else if (headerHex.startsWith('ffd8ffe0') || headerHex.startsWith('ffd8ffe1')) {
    return 'JPEG image';
  } else if (headerHex.startsWith('89504e47')) {
    return 'PNG image';
  } else if (headerHex.startsWith('47494638')) {
    return 'GIF image';
  } else if (headerHex.startsWith('424d')) {
    return 'BMP image';
  } else if (headerHex.startsWith('52494646') && headerHex.includes('57415645')) {
    return 'WAV audio';
  } else {
    return 'Unknown file type';
  }
};

/**
 * Determines the file type based on magic numbers
 */
export const getMagicInfo = async (file: File | null): Promise<string | null> => {
  if (!file) return null;
  
  try {
    const headerHex = await getFileHeader(file, 8);
    if (!headerHex) return 'Error reading file header';
    
    return identifyFileType(headerHex);
  } catch (error) {
    console.error('Error determining file magic:', error);
    return 'Error analyzing file';
  }
};