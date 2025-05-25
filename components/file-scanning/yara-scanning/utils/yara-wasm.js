import Yara from 'libyara-wasm';


// Parse rule metadata from YARA output
function parseRuleMetadata(metaString) {
    if (!metaString) return {};

    const metadata = {};
    const metaRegex = /(\w+):\s*([^,\]]+)(?:,|])/g;
    let match;

    while ((match = metaRegex.exec(metaString)) !== null) {
        metadata[match[1].trim()] = match[2].trim();
    }

    return metadata;
}

// Parse match details from YARA output
function parseMatchDetails(matchString) {
    const details = {};

    if (matchString.includes('Pos ')) {
        details.position = parseInt(matchString.match(/Pos (\d+)/)[1]);
    }

    if (matchString.includes('length ')) {
        details.length = parseInt(matchString.match(/length (\d+)/)[1]);
    }

    if (matchString.includes('identifier ')) {
        details.identifier = matchString.match(/identifier ([^,]+)/)[1];
    }

    if (matchString.includes('data: "')) {
        details.data = matchString.match(/data: "([^"]+)"/)[1];
    }

    return details;
}

// Convert YARA text output to structured JSON
function parseYaraOutputToJson(outputText) {
    const result = {
        matched_rules: [],
        summary: {
            rules_matched: 0,
            total_matches: 0,
            warnings: 0,
            errors: 0
        },
        warnings: [],
        errors: []
    };

    // Parse the output by lines
    const lines = outputText.split('\n');
    let currentRule = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Handle errors
        if (line.startsWith('❌ Error')) {
            result.errors.push({
                message: line.substring(2).trim(),
                type: "error"
            });
            continue;
        }

        // Handle warnings
        if (line.startsWith('⚠️ Warning')) {
            result.warnings.push({
                message: line.substring(2).trim(),
                type: "warning"
            });
            continue;
        }

        // Handle console messages
        if (line.startsWith('📋')) {
            // Console messages can be ignored for JSON output
            continue;
        }

        // Handle rule matches
        if (line.startsWith('🔍 Rule') || line.startsWith('🔍 Input matches rule')) {
            // Start of a new rule match

            // Save the previous rule if it exists
            if (currentRule) {
                result.matched_rules.push(currentRule);
            }

            // Extract rule name
            const ruleNameMatch = line.match(/"([^"]+)"/);
            if (!ruleNameMatch) continue;

            const ruleName = ruleNameMatch[1];

            // Extract metadata if present
            let metadata = {};
            const metaMatch = line.match(/\[(.*?)\]/);
            if (metaMatch) {
                metadata = parseRuleMetadata(metaMatch[1]);
            }

            // Extract match count if present
            let matchCount = 0;
            const countMatch = line.match(/\((\d+) (?:time|match)/);
            if (countMatch) {
                matchCount = parseInt(countMatch[1]);
            }

            currentRule = {
                rule_name: ruleName,
                metadata: metadata,
                match_count: matchCount,
                matches: []
            };

            // Add to summary counts
            result.summary.rules_matched++;
            result.summary.total_matches += matchCount;

            continue;
        }

        // Handle individual matches
        if (line.startsWith('  • Pos') && currentRule) {
            const matchDetails = parseMatchDetails(line);
            currentRule.matches.push(matchDetails);
        }
    }

    // Add the last rule if it exists
    if (currentRule) {
        result.matched_rules.push(currentRule);
    }

    // Set summary counts
    result.summary.warnings = result.warnings.length;
    result.summary.errors = result.errors.length;

    return result;
}

async function loadRules() {
    const rules = await fetch('./rules.yar');
    const rulesText = await rules.text();
    return rulesText;
}

async function analyzeYara(file) {
    const fileBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileBuffer);
    const rulesText = await loadRules();
    const yara = await Yara();

    try {
        // Run YARA scan
        const result = await yara.run(fileUint8Array, rulesText);
        console.log('Raw YARA result:', result);
        
        // Process the result into a more descriptive format
        let yaraOutputText = processYaraOutput(result);
        
        // Parse the output into structured JSON
        const jsonResults = parseYaraOutputToJson(yaraOutputText);
        
        return jsonResults;
    } catch (error) {
        console.error('Error scanning file:', error);
        return null;
    }
}

// Process raw YARA result into text format
function processYaraOutput(resp) {
    let outputText = '';
    
    // Handle compile errors and warnings
    if (resp.compileErrors && resp.compileErrors.size() > 0) {
        for (let i = 0; i < resp.compileErrors.size(); i++) {
            const compileError = resp.compileErrors.get(i);
            if (!compileError.warning) {
                outputText += `❌ Error on line ${compileError.lineNumber}: ${compileError.message}\n`;
            } else {
                outputText += `⚠️ Warning on line ${compileError.lineNumber}: ${compileError.message}\n`;
            }
        }
    }

    // Show console messages if they exist
    if (resp.consoleLogs) {
        const consoleLogs = resp.consoleLogs;
        for (let i = 0; i < consoleLogs.size(); i++) {
            outputText += `📋 ${consoleLogs.get(i)}\n`;
        }
    }

    // Process matched rules
    const matchedRules = resp.matchedRules;
    for (let i = 0; i < matchedRules.size(); i++) {
        const rule = matchedRules.get(i);
        const matches = rule.resolvedMatches;
        
        // Process metadata
        let meta = "";
        if (rule.metadata && rule.metadata.size() > 0) {
            meta += " [";
            for (let j = 0; j < rule.metadata.size(); j++) {
                meta += `${rule.metadata.get(j).identifier}: ${rule.metadata.get(j).data}, `;
            }
            meta = meta.slice(0, -2) + "]";
        }

        // Process matches
        const matchesSize = matches.size();
        const countString = matchesSize === 0 ? "" : ` (${matchesSize} match${matchesSize > 1 ? "es" : ""})`;

        if (matchesSize === 0) {
            outputText += `🔍 Input matches rule "${rule.ruleName}"${meta}${countString.length > 0 ? ` ${countString}` : ""}.\n`;
        } else {
            outputText += `🔍 Rule "${rule.ruleName}"${meta} matches${countString}:\n`;
            for (let j = 0; j < matchesSize; j++) {
                const match = matches.get(j);
                outputText += `  • Pos ${match.location}, length ${match.matchLength}, identifier ${match.stringIdentifier}, data: "${match.data}"\n`;
            }
        }
    }
    
    return outputText;
}

// Function to initialize YARA scan for a file and store results in session storage
async function initializeYaraScan(file) {
    if (!file) return null;
    
    try {
        // Run YARA analysis
        const results = await analyzeYara(file);
        
        // Store results in session storage for use in YARA tab
        if (results) {
            try {
                sessionStorage.setItem('yaraResults', JSON.stringify(results));
            } catch (storageError) {
                console.warn("Could not store YARA results in session storage:", storageError);
            }
        }
        
        return results;
    } catch (error) {
        console.error('Error initializing YARA scan:', error);
        return null;
    }
}

// Export the analyzeYara function so it can be imported by other modules
export { analyzeYara, initializeYaraScan };


