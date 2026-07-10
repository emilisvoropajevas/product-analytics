import { useQuery } from "@tanstack/react-query";

import {
    Orders
} from "../client-axios"

const useOrders = () => {
    const getOrders = async () => {
        const response = await Orders.getOrders()

        return response.data
    }

    const ordersQuery = useQuery({
        queryKey: ["orders"],
        queryFn: getOrders,
    })

    return ordersQuery

}

export default useOrders