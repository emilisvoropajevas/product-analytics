import { useRef, useState } from "react"
import { X, FileText } from "lucide-react"

import useUpload from "../hooks/useUpload"
import type { Upload } from "../client-axios"

interface UploadPanelProps {
    onClose: () => void,
}
/// singl file uploads only allowed -> if two files uploaded -> reject both files immediately, reupload

export default function UploadPanel({ onClose} : UploadPanelProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragActive, setIsDragActive] = useState<boolean>(false)


    const [headers, setHeaders] = useState<string[]>([])
    const [previewRows, setPreviewRows] = useState<string[][]>([])


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
        setUploadedFile(singleFile)
      }


    }



    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium">Upload CSV</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>
                <div className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-400 px-6 py-10
                  ${isDragActive ? "bg-gray-200 border-gray-700" : "border-gray-300"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragExit}
                  onDrop={handleDrop}
                  >
                <div className="text-center">
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300">
                    <FileText className="mx-auto size-10 text-gray-400"/>
                    <span>Select File (.csv only)</span>
                    <input id="file-upload" type="file" name="file-upload" accept=".csv" className="sr-only"></input>
                  </label>
                  </div>

                </div>
                {uploadedFile && <p>{uploadedFile.name}</p>}


                </div>
            </div>
        </div>
    )

}
/// Upload Button

/* 

<div class="col-span-full">
          <label for="cover-photo" class="block text-sm/6 font-medium text-white">Cover photo</label>
          <div class="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
            <div class="text-center">
              <svg viewBox="0 0 24 24" fill="currentColor" data-slot="icon" aria-hidden="true" class="mx-auto size-12 text-gray-600">
                <path d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clip-rule="evenodd" fill-rule="evenodd" />
              </svg>
              <div class="mt-4 flex text-sm/6 text-gray-400">
                <label for="file-upload" class="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300">
                  <span>Upload a file</span>
                  <input id="file-upload" type="file" name="file-upload" class="sr-only" />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs/5 text-gray-400">PNG, JPG, GIF up to 10MB</p>

*/