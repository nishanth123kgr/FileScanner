import { YaraMatch, YaraScanResult } from "../types";

// Mock YARA rules for demo (in reality, these would be loaded from a server)
export const YARA_RULES = [
  "rule WannaCry_Ransomware { strings: $s1 = \"msg/m_bulgarian\" $s2 = \"msg/m_chinese\" condition: $s1 and $s2 }",
  "rule Suspicious_MZ_Header { strings: $mz = {4D 5A 90 00} condition: $mz at 0 }",
  "rule Potential_Shellcode { strings: $sc = {EB ?? ?? ?? ?? ?? 68 ?? ?? ?? ?? E8} condition: $sc }",
  "rule Contains_Base64_PE { strings: $b64 = /TVqQAAMA/ condition: $b64 }"
];

// Function to simulate scanning with YARA rules
export const scanFileWithYara = async (
  file: File, 
  onProgress: (progress: number, chunk: number, total: number) => void,
  onMatchFound: (match: YaraMatch) => void
): Promise<void> => {
  if (!file) return;
  
  // Define chunk size for incremental scanning
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalSize = file.size;
  const chunks = Math.ceil(totalSize / chunkSize);
  
  // Scan file in chunks
  for (let i = 0; i < chunks; i++) {
    // Allow UI to update between chunks
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, totalSize);
    const progress = Math.floor(((i + 1) / chunks) * 100);
    
    // Update progress
    onProgress(progress, i + 1, chunks);
    
    // Simulate finding matches for demo purposes
    if (i === 1 || i === Math.floor(chunks / 2) || i === chunks - 2) {
      const randomRule = YARA_RULES[Math.floor(Math.random() * YARA_RULES.length)];
      const match: YaraMatch = {
        rule: randomRule.split(" ")[1], // Extract rule name
        description: `Detected ${randomRule.split(" ")[1]} pattern`,
        severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
        matches: [`Offset ${start + Math.floor(Math.random() * chunkSize)}`],
        offset: start + Math.floor(Math.random() * chunkSize)
      };
      
      // Report match found
      onMatchFound(match);
    }
  }
};

// Helper to get color based on severity
export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high": return "bg-red-500";
    case "medium": return "bg-amber-500";
    case "low": return "bg-blue-500";
    default: return "bg-zinc-500";
  }
};