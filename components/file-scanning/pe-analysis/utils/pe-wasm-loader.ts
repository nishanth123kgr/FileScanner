/**
 * PE WASM Analyzer Loader
 * Loads and initializes the WebAssembly PE analyzer module
 */

// This is a dynamic import of the WASM module, which makes it compatible with Next.js
let modulePromise: Promise<any> | null = null;
let initialized = false;

/**
 * Initialize the PE analyzer WASM module
 * @returns Promise that resolves when the module is ready
 */
export async function initPEAnalyzerWasm(): Promise<any> {
  if (initialized && modulePromise) {
    return modulePromise;
  }

  // We need to dynamically import the module because it's a browser-side module
  if (typeof window !== 'undefined') {
    // Create a promise that resolves when the module is loaded
    modulePromise = new Promise(async (resolve, reject) => {
      try {
        // Set up the global configuration before importing the module
        // This is crucial to correctly locate the .wasm file
        (window as any).PEAnalyzerConfig = {
          locateFile: (path: string) => {
            console.log(`Locating WebAssembly file: ${path}`);
            // Make sure we use the full path to the .wasm file
            return `/wasm/${path}`;
          }
        };
        
        // Dynamic import for the WASM module
        const PEAnalyzerModule = await import('../../../../public/wasm/pe_analyzer.js');
        
        // Pass our config to the module
        const module = await PEAnalyzerModule.default((window as any).PEAnalyzerConfig);
        console.log('PE Analyzer WASM module loaded successfully');
        
        initialized = true;
        resolve(module);
      } catch (error) {
        console.error('Failed to load PE Analyzer WASM module:', error);
        reject(error);
      }
    });
    
    return modulePromise;
  }
  
  throw new Error("Cannot load WASM module in server-side environment");
}

/**
 * Analyze a PE file using the WebAssembly module
 * @param file File object to analyze
 * @returns Promise that resolves with the PE analysis result
 */
export async function analyzePEWithWasm(file: File): Promise<any> {
  try {
    // Initialize the module if it hasn't been initialized
    const module = await initPEAnalyzerWasm();
    
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Allocate WebAssembly memory for the file data
    const fileDataPtr = module._malloc(uint8Array.length);
    
    // Copy the file data to WebAssembly memory
    module.HEAPU8.set(uint8Array, fileDataPtr);
    
    // Call the analyze_pe_buffer function
    const resultPtr = module._analyze_pe_buffer(fileDataPtr, uint8Array.length);
    
    // Get the result as a string
    const resultStr = module.UTF8ToString(resultPtr);
    
    // Free the memory
    module._free(fileDataPtr);
    module._free(resultPtr);

    console.log('PE analysis result (first 1000 chars):', resultStr.substring(0, 1000));
    
    // Parse the JSON result
    try {
      const rawResult = JSON.parse(resultStr);
      
      // Post-process the result to ensure section addresses and sizes are properly formatted
      if (rawResult.sections && Array.isArray(rawResult.sections)) {
        rawResult.sections = rawResult.sections.map((section: any) => {
          // Ensure virtual address is properly formatted
          if (!section.virtual_address && section.virtualAddress) {
            section.virtual_address = typeof section.virtualAddress === 'object' 
              ? section.virtualAddress.hex 
              : `0x${parseInt(section.virtualAddress || '0', 16).toString(16).padStart(8, '0')}`;
          }
          
          // Ensure virtual size is a number
          if (!section.virtual_size && section.virtualSize) {
            section.virtual_size = typeof section.virtualSize === 'object'
              ? section.virtualSize.decimal
              : parseInt(section.virtualSize || '0', 10);
          }
          
          // Ensure raw size is a number
          if (!section.raw_size && section.rawSize) {
            section.raw_size = typeof section.rawSize === 'object'
              ? section.rawSize.decimal
              : parseInt(section.rawSize || '0', 10);
          }
          
          return section;
        });
      }
      
      console.log('Processed PE analysis result (sections):', 
                 rawResult.sections ? rawResult.sections.slice(0, 2) : 'No sections');
      
      return rawResult;
    } catch (parseError: unknown) {
      console.error('Error parsing PE analysis JSON result:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(`Failed to parse PE analysis result: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error analyzing PE file with WASM:', error);
    throw error;
  }
}