import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Orders,
    type OrdersPublic
} from "../client-axios"

export interface OrdersFilters {
    start_date?: string
    end_date?: string
    model_range?: string
    sku?: string | null
}

const fetchOrders = async (filters?: OrdersFilters): Promise<OrdersPublic[]> => {
    const response = await Orders.getOrders(
        filters? { query: filters } : undefined
    )
    return response.data ?? []
}

const useFetchOrders = () => {
    const ordersQuery = useQuery({
        queryKey: ["orders"],
        queryFn: () => fetchOrders(),
    })

    const previewOrdersMutation = useMutation({
        mutationFn: (filters: OrdersFilters) => fetchOrders(filters),
    })

    return {
        ordersQuery,
        previewOrdersMutation
    }
}

export default useFetchOrders
