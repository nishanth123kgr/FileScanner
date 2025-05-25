import React from "react";
import { FileWarning } from "lucide-react";
import { YaraMatch } from "../types";
import { getSeverityColor } from "../utils/yara-scanner";

interface MatchesListProps {
  matches: YaraMatch[];
}

export const MatchesList: React.FC<MatchesListProps> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-400">
        No matches found for the selected severity level.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <div 
          key={`${match.rule}-${index}`}
          className="p-4 bg-zinc-800/50 border border-zinc-700/40 rounded-lg hover:bg-zinc-800/70 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getSeverityColor(match.severity)}/20 border ${getSeverityColor(match.severity)}/30`}>
              <FileWarning className={`h-5 w-5 ${match.severity === "high" ? "text-red-500" : match.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-medium">{match.rule}</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${match.severity === "high" ? "bg-red-500/20 text-red-300" : match.severity === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                  {match.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{match.description}</p>
              <div className="mt-3 bg-zinc-900/60 p-2 rounded text-sm border border-zinc-800/70">
                <div className="font-mono text-xs text-zinc-500">
                  Matches found: {match.matches.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};