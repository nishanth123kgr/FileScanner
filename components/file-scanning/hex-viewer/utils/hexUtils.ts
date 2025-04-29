// Utility functions for hex viewer

/**
 * Constants for hex viewer configuration
 */
export const HEX_CONSTANTS = {
  CHUNK_SIZE: 1024 * 8, // 8KB chunks for normal loading
  BYTES_PER_ROW: 16,
  INITIAL_CHUNK_SIZE: 1024 * 4, // 4KB for initial load
  PREFETCH_THRESHOLD: 0.8, // 80% of current chunk
  CONTAINER_HEIGHT: 400, // Fixed container height
};

/**
 * Formats a byte number as a hex string with leading zeros
 */
export function formatHexByte(byte: number): string {
  return byte.toString(16).padStart(2, "0");
}

/**
 * Formats an offset as a hex string with leading zeros
 */
export function formatHexOffset(offset: number): string {
  return offset.toString(16).padStart(8, "0");
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 bytes";
  
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Determines if a byte should be highlighted based on search criteria
 */
export function isHighlightedByte(byte: number, highlightedBytes: string[]): boolean {
  if (byte < 0) return false;
  return highlightedBytes.includes(formatHexByte(byte));
}

/**
 * Get the character visualization class based on byte value
 */
export function getCharacterClass(byte: number): string {
  if (byte === -1) return "text-transparent";
  if (byte === 0) return "text-zinc-700 bg-zinc-800/50"; // NULL byte
  if (byte < 32) return "text-blue-400/70"; // Control chars
  if (byte === 32) return "text-zinc-600 border-dashed border-b border-zinc-800"; // Space
  if (byte >= 33 && byte <= 47) return "text-amber-400/70"; // Special chars
  if (byte >= 48 && byte <= 57) return "text-green-400/70"; // Numbers
  if (byte >= 58 && byte <= 64) return "text-amber-400/70"; // More special chars
  if (byte >= 65 && byte <= 90) return "text-purple-400/80"; // Uppercase
  if (byte >= 91 && byte <= 96) return "text-amber-400/70"; // More special chars
  if (byte >= 97 && byte <= 122) return "text-sky-400/80"; // Lowercase
  if (byte >= 123 && byte <= 126) return "text-amber-400/70"; // More special chars
  if (byte >= 127) return "text-red-400/70"; // Extended ASCII
  return "text-zinc-500";
}

/**
 * Convert byte to ASCII representation
 */
export function byteToAsciiChar(byte: number): { char: string; tooltip: string } {
  if (byte === -1) return { char: " ", tooltip: "None" };
  
  let char = ".";
  let tooltip = "Non-printable";
  
  if (byte === 0) {
    char = "0";
    tooltip = "NULL";
  } else if (byte < 32) {
    char = "•";
    tooltip = `Control (${byte})`;
  } else if (byte >= 32 && byte <= 126) {
    char = String.fromCharCode(byte);
    tooltip = `ASCII ${byte} (0x${byte.toString(16)})`;
  } else if (byte >= 127) {
    char = "×";
    tooltip = `Extended (${byte})`;
  }
  
  return { char, tooltip };
}