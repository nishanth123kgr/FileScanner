/**
 * Utilities for working with buffers and file data
 */

/**
 * Reads a file as an array buffer
 */
export const readFileAsBuffer = async (file: File | null): Promise<Uint8Array | null> => {
  if (!file) return null;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

/**
 * Converts a buffer to a hex string
 */
export const bufferToHex = (buffer: Uint8Array | ArrayBuffer): string => {
  const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(view)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};