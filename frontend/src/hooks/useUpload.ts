import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from 'sonner'

import {
    type BodyUploadOrders as UploadData,
    Upload,
} from "../client-axios";
import { extractErrorMessage } from "../utils";

export interface UploadStatus {
    chunk: number
    status: "Success" | "Failed"
    inserted_rows: number
    reason: string | null
    row_start: number
    row_end: number
}

export interface UploadStatusResponse {
    total_successful: number
    total_failed: number
    data: Array<UploadStatus>
}

const useUpload = () => {
    const upload = async (data : UploadData) => {
        const response = await Upload.uploadOrders({
            body: data,
        })
        return response
    }

    const uploadMutation = useMutation({
        mutationFn: upload,
        onSuccess: (response) => {
            const result = response.data as unknown as UploadStatusResponse
            if (result.total_failed > 0) {
                toast.warning(`Upload partial: ${result.total_failed} chunks failed`)
            } else {
                toast.success("Data Uploaded successfully")
            }
        },
        onError: (err) => {
            toast.error(extractErrorMessage(err as AxiosError))
        }
    })
    return {
        uploadMutation
    }
}

export default useUpload