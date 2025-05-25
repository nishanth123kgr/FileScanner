"use client";

import React from "react";
import { FileTabType } from "../types";

interface FileTabNavigationProps {
  activeTab: FileTabType;
  setActiveTab: (tab: FileTabType) => void;
  scanComplete: boolean;
}

export const FileTabNavigation: React.FC<FileTabNavigationProps> = ({
  activeTab,
  setActiveTab,
  scanComplete,
}) => {
  return (
    <div className="flex border-b border-zinc-800">
      <button
        className={`px-4 py-2 font-medium text-sm ${
          activeTab === "upload" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => setActiveTab("upload")}
      >
        Upload
      </button>
      
      {scanComplete && (
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "results" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("results")}
        >
          Analysis Results
        </button>
      )}
      
      <button
        className={`px-4 py-2 font-medium text-sm ${
          activeTab === "hex" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => setActiveTab("hex")}
      >
        Hex View
      </button>
    </div>
  );
};

export default FileTabNavigation;