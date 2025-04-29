// List of supported file extensions for scanning
export const SUPPORTED_EXTENSIONS = [
  '.exe', '.dll', '.sys', '.pdf', '.doc', '.docx', 
  '.xls', '.xlsx', '.js', '.php', '.zip', '.rar', 
  '.tar', '.gz', '.7z'
];

// Check if file extension is known and get appropriate icon class
export const getFileTypeClass = (fileName: string): string => {
  if (!fileName) return '';
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (['.exe', '.dll', '.sys'].includes(extension)) return 'bg-red-500/20 border-red-500/30 text-red-400';
  if (['.pdf'].includes(extension)) return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
  if (['.doc', '.docx', '.txt'].includes(extension)) return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
  if (['.xls', '.xlsx'].includes(extension)) return 'bg-green-500/20 border-green-500/30 text-green-400';
  if (['.zip', '.rar', '.tar', '.gz', '.7z'].includes(extension)) return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
  
  return 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400';
}