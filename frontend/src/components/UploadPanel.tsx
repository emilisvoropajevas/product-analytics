import { useRef, useState } from "react"
import { X, FileText } from "lucide-react"
import { toast } from 'sonner'

import useUpload from "../hooks/useUpload"
import type { Upload } from "../client-axios"

interface UploadPanelProps {
    onClose: () => void,
}
/// singl file uploads only allowed -> if two files uploaded -> reject both files immediately, reupload

export default function UploadPanel({ onClose} : UploadPanelProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState<boolean>(false)
  const [headers, setHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const { uploadMutation } = useUpload()

  const processFile = (file : File) => {
    if (file.size > 10* 1024 *1024) {
      toast.error("File too large, max 10Mb")
      return
    }
    if (!file.name.endsWith(".csv")) {
      toast.error("File must be a CSV")
      return
    }
    setUploadedFile(file)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter(line => line.trim() !== "")
      const parsedHeaders = lines[0].split(",")
      const parsedRows = lines.slice(1,21).map(line => line.split(","))
      setHeaders(parsedHeaders)
      setPreviewRows(parsedRows)
      setStage(2)
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragExit = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      const singleFile = Array.from(e.dataTransfer.files)[0]
      processFile(singleFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium">Upload CSV</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
              </div>
              {stage === 1 && (
                <div>{!uploadedFile ? (
                  <div className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10
                    ${isDragActive ? "bg-gray-200 border-gray-700" : "border-gray-300"}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragExit}
                    onDrop={handleDrop}>
                      <div className="text-center">
                        <label htmlFor="file-upload" className="cursor-pointer font-semibold text-gray-600 hover:text-indigo-300">
                          <FileText className="mx-auto size-10 text-gray-400"/>
                          <span className="text-sm">Select File (.csv only)</span>
                          <input id="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange}/>
                      </label>
                      </div>
                  </div>) : (
                    <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                      <FileText className="size-5 text-gray-400 shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={14}/>
                      </button>
                    </div>)}
                  </div>)}


                  

                      
                <div className="flex justify-between mt-6">
                  {stage === 2 && (
                    <button onClick={() => setStage(1)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                      Back
                    </button>
                  )}
                  {stage === 1 && (
                    <button onClick={() => uploadedFile && parseCSV(uploadedFile)}
                    disabled={!uploadedFile}
                    className="ml-auto bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                      Next
                    </button>
                  )}
                  {stage === 2 && (
                    <button onClick={() => uploadMutation.mutate({file: uploadedFile! })}
                    disabled={uploadMutation.isPending}
                    className="ml-auto bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                      {uploadMutation.isPending ? "Uploading..." : "Upload"}
                    </button>
                  )}
                  {stage === 3 && (
                    <button onClick={onClose} className="ml-auto bg-gray-900 text-white px-4 py-2 rounded-md text-sm">
                      Close
                    </button>
                  )}
                </div>


          </div>      
          </div>
    )

}