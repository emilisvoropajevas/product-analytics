import { useRef, useState } from "react"
import { X } from "lucide-react"

import useUpload from "../hooks/useUpload"

interface UploadPanelProps {
    onClose: () => void
}

export default function UploadPanel({ onClose } : UploadPanelProps) {
    const [stage, setStage] = useState<1 | 2 | 3>(1)
    const [file, setFile] = useState<File | null>(null)
    const [headers, setHeaders] = useState<string[]>([])
    const [previewRows, setPreviewRows] = useState<string[][]>([])




    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xl p-6">
                <p>Upload Content Here</p>
                <button onClick={onClose}><X/></button>
            </div>
        </div>
    )

}