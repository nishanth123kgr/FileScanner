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

/**
 * Analyzes a file using YARA rules and returns structured results
 * This function sends the file to a backend API for YARA scanning
 * 
 * @param file - The file to be analyzed
 * @param customRules - Optional custom YARA rules to apply
 * @returns Promise with YARA scan results
 */
export const analyzeFileWithYara = async (
  file: File,
  customRules?: string[]
): Promise<YaraScanResult> => {
  if (!file) {
    throw new Error("No file provided for YARA analysis");
  }

  // Starting timestamp for scan duration calculation
  const startTime = performance.now();
  
  // Create a FormData object to send the file and rules
  const formData = new FormData();
  formData.append("file", file);
  
  // Add custom rules if provided
  if (customRules?.length) {
    formData.append("rules", JSON.stringify(customRules));
  }

  try {
    // In a real implementation, send the file to your backend API
    // Replace this URL with your actual API endpoint
    const response = await fetch("/api/yara/scan", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`YARA scan failed with status: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Calculate scan duration
    const endTime = performance.now();
    const scanDuration = ((endTime - startTime) / 1000).toFixed(2); // in seconds
    
    // Transform backend response to match our interface
    const result: YaraScanResult = {
      matches: data.matches.map((match: any) => ({
        rule: match.rule,
        description: match.meta?.description || `Match found for rule: ${match.rule}`,
        severity: match.meta?.severity || "medium",
        matches: match.strings?.map((s: any) => s.data) || [],
        offset: match.strings?.[0]?.offset || 0
      })),
      scanTime: `${scanDuration}s`,
      rulesApplied: data.rulesApplied || (customRules?.length || YARA_RULES.length)
    };
    
    return result;
  } catch (error) {
    console.error("YARA analysis failed:", error);
    // For development/demo, return mock data when API isn't available
    return generateMockYaraResults(file);
  }
};

/**
 * Generates mock YARA scan results for testing/development
 * @param file - The file that was "scanned"
 * @returns Mock YARA scan results
 */
const generateMockYaraResults = (file: File): YaraScanResult => {
  const mockMatches: YaraMatch[] = [
    {
      rule: "Suspicious_MZ_Header",
      description: "Detected executable header at beginning of file",
      severity: "medium",
      matches: ["Offset 0x0000: 4D 5A 90 00"],
      offset: 0
    }
  ];
  
  // Add more mock matches based on file type
  if (file.name.endsWith(".exe") || file.name.endsWith(".dll")) {
    mockMatches.push({
      rule: "Potential_Malware_Signature",
      description: "File contains patterns associated with known malware",
      severity: "high",
      matches: ["Offset 0x1420: Pattern match for encrypted payload"],
      offset: 0x1420
    });
  } else if (file.name.endsWith(".js") || file.name.endsWith(".html")) {
    mockMatches.push({
      rule: "Javascript_Obfuscation",
      description: "Obfuscated JavaScript detected",
      severity: "medium",
      matches: ["Offset 0x2A8: eval(function(p,a,c,k,e,d)"],
      offset: 0x2A8
    });
  }
  
  // Add a random low severity match
  if (Math.random() > 0.5) {
    mockMatches.push({
      rule: "Base64_Content",
      description: "File contains base64 encoded data",
      severity: "low",
      matches: ["Offset 0x8A4: TVqQAAMA..."],
      offset: 0x8A4
    });
  }
  
  return {
    matches: mockMatches,
    scanTime: "0.42s",
    rulesApplied: YARA_RULES.length
  };
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