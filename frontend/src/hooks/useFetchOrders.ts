import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import type { AxiosError } from "axios"

import {
    Orders,
    type OrdersPublic
} from "../client-axios"
import { extractErrorMessage } from "../utils"

export interface OrdersFilters {
    start_date?: string
    end_date?: string
    model_range?: string
    sku?: string | null
}

const fetchOrders = async (filters?: OrdersFilters): Promise<OrdersPublic[]> => {
    const response = await Orders.getOrders(
        filters ? { query: filters } : undefined
    )
    return response.data ?? []
}

const useFetchOrders = () => {
    const queryClient = useQueryClient()

    const ordersQuery = useQuery({
        queryKey: ["orders"],
        queryFn: () => fetchOrders(),
    })

    const previewOrdersMutation = useMutation({
        mutationFn: (filters: OrdersFilters) => fetchOrders(filters),
    })

    const deleteOrdersMutation = useMutation({
        mutationFn: async (ids: number[]) => {
            const response = await Orders.deleteOrders({ body: { ids } })
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            toast.success(`${data?.deleted ?? 0} order(s) deleted`)
        },
        onError: (err) => {
            toast.error(extractErrorMessage(err as AxiosError))
        }
    })

    return {
        ordersQuery,
        previewOrdersMutation,
        deleteOrdersMutation,
    }
}

export default useFetchOrders