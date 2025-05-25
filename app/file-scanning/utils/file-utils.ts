// Utility functions for file processing

/**
 * Determines file type based on file extension
 */
export const getFileTypeFromExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || ""

  const typeMap: Record<string, string> = {
    exe: "Windows Executable",
    dll: "Windows Dynamic Link Library",
    sys: "Windows System File",
    pdf: "PDF Document",
    doc: "Microsoft Word Document",
    docx: "Microsoft Word Document",
    xls: "Microsoft Excel Spreadsheet",
    xlsx: "Microsoft Excel Spreadsheet",
    zip: "ZIP Archive",
    rar: "RAR Archive",
    js: "JavaScript File",
    vbs: "VBScript File",
    ps1: "PowerShell Script",
    bat: "Windows Batch File",
    sh: "Shell Script",
  }

  return typeMap[ext] || `${ext.toUpperCase()} File`
}

/**
 * Formats file size from bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Checks if a file is a PE file by examining its header
 */
export const isPEFile = async (file: File): Promise<boolean> => {
  try {
    // Read just the first 8 bytes to determine file type
    const headerBlob = file.slice(0, 8);
    const headerBuffer = await headerBlob.arrayBuffer();
    const headerBytes = new Uint8Array(headerBuffer);
    const headerHex = Array.from(headerBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Detect PE file based on MZ header
    return headerHex.startsWith('4d5a'); // MZ header
  } catch (error) {
    console.error("Error checking PE file header:", error);
    return false;
  }
}