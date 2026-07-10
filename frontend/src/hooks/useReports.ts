import { useQuery } from "@tanstack/react-query";
import {
    Reports,
} from "../client-axios";

const useReports = () => {
    const getReports = async () => {
        const response = await Reports.getReports()
        return response.data
    }

    const reportQuery = useQuery({
        queryKey: ["reports"],
        queryFn: getReports,
    })

    return {
        reportQuery
    }
}

export default useReports
