import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { Reports, type CreateReport } from "../client-axios";
import { extractErrorMessage } from "../utils";

const useCreateReport = () => {
    const queryClient = useQueryClient()

    const createReport = async (data: CreateReport) => {
        const response = await Reports.addReport({ body: data })
        return response.data
    }

    const createReportMutation = useMutation({
        mutationFn: createReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] })
            toast.success("Report created")
        },
        onError: (err) => {
            toast.error(extractErrorMessage(err as AxiosError))
        }
    })

    return { createReportMutation }
}

export default useCreateReport