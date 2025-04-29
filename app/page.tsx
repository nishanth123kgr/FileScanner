"use client"

import { useFileScanning, FileTabNavigation, FileContent } from "./file-scanning"

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    fileSelected,
    fileName,
    fileType,
    fileSize,
    scanComplete,
    scanning,
    progress,
    file,
    peAnalysisData,
    getFileData,
    handleFileSelected,
    startScan
  } = useFileScanning();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-white">Static File Analysis</h1>
        <p className="text-zinc-400">Deep analysis of files for malware, vulnerabilities, and security threats</p>
      </div>

      {fileSelected && (
        <>
          <FileTabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            scanComplete={scanComplete}
          />

          <FileContent
            activeTab={activeTab}
            fileSelected={fileSelected}
            fileName={fileName}
            fileType={fileType}
            fileSize={fileSize}
            scanning={scanning}
            progress={progress}
            file={file}
            fileData={getFileData()}
            peAnalysisData={peAnalysisData}
            onStartScan={startScan}
            onFileSelected={handleFileSelected}
          />
        </>
      )}

      {!fileSelected && (
        <FileContent
          activeTab={activeTab}
          fileSelected={fileSelected}
          fileName={fileName}
          fileType={fileType}
          fileSize={fileSize}
          scanning={scanning}
          progress={progress}
          file={file}
          fileData={getFileData()}
          peAnalysisData={peAnalysisData}
          onStartScan={startScan}
          onFileSelected={handleFileSelected}
        />
      )}
    </div>
  )
}
