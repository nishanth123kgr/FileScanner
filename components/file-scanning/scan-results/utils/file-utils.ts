/**
 * Re-export all utilities from specialized files
 * This file is maintained for backward compatibility
 */

// Re-export from buffer-utils.ts
export { bufferToHex, readFileAsBuffer } from './buffer-utils';

// Re-export from hash-utils.ts
export { 
  computeMd5Hash, 
  computeSha1Hash, 
  computeSha256Hash,
  computeFileHashes,
  type FileHashes 
} from './hash-utils';

// Re-export from file-type-utils.ts
export { 
  getFileHeader, 
  identifyFileType, 
  getMagicInfo,
  type FileData 
} from './file-type-utils';