"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileUploader } from "@/components/file-scanning/file-uploader";
import ScanResults from "@/components/file-scanning/scan-results";
import HexViewer from "@/components/file-scanning/hex-viewer";
import { FileData, FileTabType } from "../types";
import { PEAnalysisResult } from "@/components/file-scanning/pe-analysis/utils/pe-parser";

interface FileContentProps {
  activeTab: FileTabType;
  fileSelected: boolean;
  fileName: string;
  fileType: string;
  fileSize: string;
  scanning: boolean;
  progress: number;
  file: File | null;
  fileData: FileData;
  peAnalysisData?: PEAnalysisResult | null;
  yaraData?: any; // Added yaraData prop
  onStartScan: () => void;
  onFileSelected: (file: File | null) => void;
}

export const FileContent: React.FC<FileContentProps> = ({
  activeTab,
  fileSelected,
  fileName,
  fileType,
  fileSize,
  scanning,
  progress,
  file,
  fileData,
  peAnalysisData,
  yaraData, // Receive yaraData from parent
  onStartScan,
  onFileSelected,
}) => {
  return (
    <>
      {fileSelected ? (
        <Tabs value={activeTab}>
          <TabsContent value="upload">
            <FileUploader
              onFileSelected={onFileSelected}
              fileName={fileName}
              fileType={fileType}
              fileSize={fileSize}
              fileSelected={fileSelected}
              scanning={scanning}
              progress={progress}
              onStartScan={onStartScan}
            />
          </TabsContent>

          <TabsContent value="results">
            <ScanResults 
              file={file} 
              fileData={fileData} 
              peData={peAnalysisData} 
              yaraData={yaraData} // Pass yaraData to ScanResults component
            />
          </TabsContent>

          <TabsContent value="hex">
            <Card className="card-glassmorphism p-6">
              <HexViewer file={file} />
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <FileUploader
          onFileSelected={onFileSelected}
          fileName={fileName}
          fileType={fileType}
          fileSize={fileSize}
          fileSelected={fileSelected}
          scanning={scanning}
          progress={progress}
          onStartScan={onStartScan}
        />
      )}
    </>
  );
};

export default FileContent;