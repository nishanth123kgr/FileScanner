/**
 * Utilities for computing various hash functions
 */
import md5 from 'js-md5';
import { bufferToHex, readFileAsBuffer } from './buffer-utils';
import { sha1 } from 'js-sha1';
import { sha256 } from 'js-sha256';

/**
 * Interface for file hash results
 */
export interface FileHashes {
  md5: string;
  sha1: string;
  sha256: string;
}

/**
 * Check if Web Crypto API is available
 */
const isWebCryptoAvailable = typeof window !== 'undefined' && 
  window.crypto && 
  window.crypto.subtle && 
  typeof window.crypto.subtle.digest === 'function';

/**
 * Computes MD5 hash for a buffer using the js-md5 library
 */
export const computeMd5Hash = (buffer: Uint8Array): string => {
  // Using a more basic approach that's likely to work with any version of js-md5
  // @ts-ignore - Suppress TypeScript errors for md5 usage
  return md5(buffer);
};

/**
 * Computes SHA-1 hash for a buffer
 */
export const computeSha1Hash = async (buffer: Uint8Array): Promise<string> => {
  // Use Web Crypto API if available, otherwise fall back to js-sha256
  if (isWebCryptoAvailable) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-1', buffer);
      return bufferToHex(hashBuffer);
    } catch (error) {
      console.warn('Web Crypto API failed for SHA-1, using fallback', error);
      // Fall through to use the fallback
    }
  }
  
  // Fallback to js-sha256 implementation
  return sha1(buffer);
};

/**
 * Computes SHA-256 hash for a buffer
 */
export const computeSha256Hash = async (buffer: Uint8Array): Promise<string> => {
  // Use Web Crypto API if available, otherwise fall back to js-sha256
  if (isWebCryptoAvailable) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      return bufferToHex(hashBuffer);
    } catch (error) {
      console.warn('Web Crypto API failed for SHA-256, using fallback', error);
      // Fall through to use the fallback
    }
  }
  
  // Fallback to js-sha256 implementation
  return sha256(buffer);
};

/**
 * Computes MD5, SHA-1, and SHA-256 hashes for a file
 */
export const computeFileHashes = async (file: File | null): Promise<FileHashes | null> => {
  if (!file) return null;

  try {
    const fileBuffer = await readFileAsBuffer(file);
    if (!fileBuffer) return null;
    
    // Compute all hashes
    const md5Hex = computeMd5Hash(fileBuffer);
    const sha1Hex = await computeSha1Hash(fileBuffer);
    const sha256Hex = await computeSha256Hash(fileBuffer);
    
    return {
      md5: md5Hex,
      sha1: sha1Hex,
      sha256: sha256Hex
    };
  } catch (error) {
    console.error('Error computing file hashes:', error);
    return null;
  }
};